import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { EMAIL_TOKEN_LIMITS, EmailTokenPurpose } from '@viratec/contracts';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../security/audit.service';
import { RATE_LIMITS, RateLimitService } from '../security/rate-limit.service';
import { safeEqual, sha256Hex } from '../security/crypto';
import type { ClientContext } from '../common/decorators/client-context.decorator';
import { claimUnverifiedAccountWrites, generateResetCode, hashEmailToken } from './email-ownership';
import { MailClient } from './mail.client';

const RESET_CODE_TTL_MS = EMAIL_TOKEN_LIMITS.resetCodeTtlMinutes * 60_000;
const RESET_CODE_MAX_ATTEMPTS = 5;

const resetMessage = (code: string) => ({
  subject: 'Код відновлення пароля · Password reset code — VIRaTeC',
  text: [
    `Ваш код відновлення пароля VIRaTeC: ${code}`,
    '',
    `Код дійсний ${EMAIL_TOKEN_LIMITS.resetCodeTtlMinutes} хвилин. Якщо ви не запитували відновлення, проігноруйте цей лист — ваш пароль не зміниться.`,
    '',
    '---',
    '',
    `Your VIRaTeC password reset code: ${code}`,
    '',
    `The code is valid for ${EMAIL_TOKEN_LIMITS.resetCodeTtlMinutes} minutes. If you did not ask to reset your password, ignore this email and your password stays the same.`,
  ].join('\n'),
});

const invalidCode = () =>
  new BadRequestException({
    message: 'The code is incorrect or has expired',
    code: 'RESET_CODE_INVALID',
  });

interface ResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
}

@Injectable()
export class PasswordResetService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private mail: MailClient,
    private audit: AuditService,
    private rateLimit: RateLimitService,
  ) {}

  private hash(userId: string, code: string) {
    return hashEmailToken(
      this.config.getOrThrow<Buffer>('security.totpEncryptionKey'),
      EmailTokenPurpose.RESET_PASSWORD,
      `${userId}:${code}`,
    );
  }

  async request(rawEmail: string, client: ClientContext = {}) {
    this.mail.assertAvailable();
    const email = rawEmail.toLowerCase();
    await Promise.all([
      this.rateLimit.consume(
        `password:forgot:email:${sha256Hex(email)}`,
        RATE_LIMITS.passwordForgotPerEmail,
      ),
      client.ipAddress
        ? this.rateLimit.consume(
            `password:forgot:ip:${client.ipAddress}`,
            RATE_LIMITS.passwordForgotPerIp,
          )
        : undefined,
    ]);

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, isBlocked: true },
    });
    if (!user || user.isBlocked) return { success: true };

    const code = generateResetCode();
    await this.prisma.$transaction([
      this.prisma.emailToken.deleteMany({
        where: { userId: user.id, purpose: EmailTokenPurpose.RESET_PASSWORD },
      }),
      this.prisma.emailToken.create({
        data: {
          userId: user.id,
          purpose: EmailTokenPurpose.RESET_PASSWORD,
          tokenHash: this.hash(user.id, code),
          expiresAt: new Date(Date.now() + RESET_CODE_TTL_MS),
        },
      }),
    ]);
    await this.mail.send({ to: user.email, ...resetMessage(code) });
    return { success: true };
  }

  async reset(
    { email: rawEmail, code, newPassword }: ResetPasswordInput,
    client: ClientContext = {},
  ) {
    const email = rawEmail.toLowerCase();
    await this.rateLimit.consume(
      `password:reset:email:${sha256Hex(email)}`,
      RATE_LIMITS.passwordResetPerEmail,
    );

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        emailVerifiedAt: true,
        emailOwnershipClaimable: true,
        passwordHash: true,
      },
    });
    const token = user
      ? await this.prisma.emailToken.findFirst({
          where: {
            userId: user.id,
            purpose: EmailTokenPurpose.RESET_PASSWORD,
            consumedAt: null,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        })
      : null;
    if (!user || !token || token.attempts >= RESET_CODE_MAX_ATTEMPTS) throw invalidCode();

    await this.prisma.emailToken.update({
      where: { id: token.id },
      data: { attempts: { increment: 1 } },
    });
    if (!safeEqual(this.hash(user.id, code), token.tokenHash)) throw invalidCode();

    const passwordHash = await argon2.hash(newPassword);
    const claimedUnverified = !user.emailVerifiedAt && user.emailOwnershipClaimable;
    await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const { count } = await tx.emailToken.updateMany({
        where: { id: token.id, consumedAt: null, expiresAt: { gt: now } },
        data: { consumedAt: now },
      });
      if (count === 0) throw invalidCode();
      if (claimedUnverified) {
        await Promise.all(
          claimUnverifiedAccountWrites(tx, user.id, { passwordHash, googleId: null }),
        );
      } else {
        await tx.user.update({
          where: { id: user.id, passwordHash: user.passwordHash },
          data: { passwordHash, emailVerifiedAt: now, emailOwnershipClaimable: false },
        });
        await tx.refreshToken.updateMany({
          where: { userId: user.id, revoked: false },
          data: { revoked: true },
        });
        await tx.emailToken.deleteMany({
          where: { userId: user.id, purpose: EmailTokenPurpose.RESET_PASSWORD },
        });
      }
    });

    await this.audit.record({
      action: claimedUnverified ? 'auth.unverified_account_claimed' : 'auth.password_reset',
      actorId: user.id,
      metadata: { method: 'password_reset' },
      client,
    });
    return { success: true };
  }
}

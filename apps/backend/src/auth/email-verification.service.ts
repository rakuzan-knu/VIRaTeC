import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EMAIL_TOKEN_LIMITS, EmailTokenPurpose } from '@viratec/contracts';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../security/audit.service';
import { RATE_LIMITS, RateLimitService } from '../security/rate-limit.service';
import { randomToken } from '../security/crypto';
import type { ClientContext } from '../common/decorators/client-context.decorator';
import { hashEmailToken } from './email-ownership';
import { MailClient } from './mail.client';

const VERIFY_LINK_TTL_MS = EMAIL_TOKEN_LIMITS.verifyLinkTtlHours * 60 * 60_000;
const VERIFY_EMAIL_PATH = '/verify-email';

interface VerificationTarget {
  id: string;
  email: string;
  emailVerifiedAt: Date | null;
}

const verificationMessage = (link: string) => ({
  subject: 'Підтвердьте електронну пошту · Verify your email — VIRaTeC',
  text: [
    'Вітаємо!',
    '',
    'Щоб підтвердити адресу електронної пошти для облікового запису VIRaTeC, відкрийте посилання:',
    link,
    '',
    `Посилання дійсне ${EMAIL_TOKEN_LIMITS.verifyLinkTtlHours} годин. Якщо ви не реєструвалися у VIRaTeC, просто проігноруйте цей лист.`,
    '',
    '---',
    '',
    'Hello!',
    '',
    'To confirm the email address of your VIRaTeC account, open this link:',
    link,
    '',
    `The link is valid for ${EMAIL_TOKEN_LIMITS.verifyLinkTtlHours} hours. If you did not sign up for VIRaTeC, ignore this email.`,
  ].join('\n'),
});

const invalidLink = () =>
  new BadRequestException({
    message: 'This verification link is invalid or has expired',
    code: 'EMAIL_TOKEN_INVALID',
  });

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private mail: MailClient,
    private audit: AuditService,
    private rateLimit: RateLimitService,
  ) {}

  private hash(token: string) {
    return hashEmailToken(
      this.config.getOrThrow<Buffer>('security.totpEncryptionKey'),
      EmailTokenPurpose.VERIFY_EMAIL,
      token,
    );
  }

  async send(user: VerificationTarget) {
    if (user.emailVerifiedAt) return;
    this.mail.assertAvailable();

    const token = randomToken();
    await this.prisma.$transaction([
      this.prisma.emailToken.deleteMany({
        where: { userId: user.id, purpose: EmailTokenPurpose.VERIFY_EMAIL },
      }),
      this.prisma.emailToken.create({
        data: {
          userId: user.id,
          purpose: EmailTokenPurpose.VERIFY_EMAIL,
          tokenHash: this.hash(token),
          expiresAt: new Date(Date.now() + VERIFY_LINK_TTL_MS),
        },
      }),
    ]);
    await this.mail.send({
      to: user.email,
      ...verificationMessage(this.mail.buildLink(VERIFY_EMAIL_PATH, { token })),
    });
  }

  async sendAfterRegistration(user: VerificationTarget) {
    try {
      await this.send(user);
    } catch (error) {
      this.logger.warn(`Verification email for ${user.id} was not sent: ${String(error)}`);
    }
  }

  async resend(userId: string) {
    await this.rateLimit.consume(`email:verify:${userId}`, RATE_LIMITS.emailVerifyPerAccount);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, emailVerifiedAt: true },
    });
    if (!user) throw new UnauthorizedException('User no longer exists');
    await this.send(user);
    return { success: true };
  }

  async verify(token: string, client: ClientContext = {}) {
    const record = await this.prisma.emailToken.findUnique({
      where: { tokenHash: this.hash(token) },
      select: { id: true, userId: true, purpose: true, expiresAt: true, consumedAt: true },
    });
    if (
      !record ||
      record.purpose !== EmailTokenPurpose.VERIFY_EMAIL ||
      record.consumedAt ||
      record.expiresAt < new Date()
    ) {
      throw invalidLink();
    }

    await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const { count } = await tx.emailToken.updateMany({
        where: { id: record.id, consumedAt: null, expiresAt: { gt: now } },
        data: { consumedAt: now },
      });
      if (count === 0) throw invalidLink();
      await tx.user.updateMany({
        where: { id: record.userId, emailVerifiedAt: null },
        data: { emailVerifiedAt: now, emailOwnershipClaimable: false },
      });
    });
    await this.audit.record({ action: 'auth.email_verified', actorId: record.userId, client });
    return { success: true };
  }
}

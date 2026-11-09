import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { EMAIL_TOKEN_LIMITS, EmailTokenPurpose } from '@viratec/contracts';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../security/audit.service';
import { RATE_LIMITS, RateLimitService } from '../security/rate-limit.service';
import { randomToken } from '../security/crypto';
import { toAccount } from '../security/account';
import type { ClientContext } from '../common/decorators/client-context.decorator';
import { hashEmailToken } from './email-ownership';
import { MailClient } from './mail.client';
import { ReauthenticationService } from './reauthentication.service';
import { SecurityMailService } from './security-mail.service';
import type { RequestEmailChangeDto } from './dto/request-email-change.dto';

const CHANGE_LINK_TTL_MS = EMAIL_TOKEN_LIMITS.verifyLinkTtlHours * 60 * 60_000;
const VERIFY_EMAIL_PATH = '/verify-email';
const EMAIL_CHANGE_LINK_TYPE = 'email-change';

const confirmationMessage = (link: string) => ({
  subject: 'Підтвердьте нову пошту · Confirm your new email — VIRaTeC',
  text: [
    'Щоб зробити цю адресу пошти основною для облікового запису VIRaTeC, відкрийте посилання:',
    link,
    '',
    `Посилання дійсне ${EMAIL_TOKEN_LIMITS.verifyLinkTtlHours} годин. Якщо ви цього не запитували, проігноруйте цей лист.`,
    '',
    '---',
    '',
    'To make this the email address of your VIRaTeC account, open this link:',
    link,
    '',
    `The link is valid for ${EMAIL_TOKEN_LIMITS.verifyLinkTtlHours} hours. If you did not ask for this, ignore this email.`,
  ].join('\n'),
});

const invalidLink = () =>
  new BadRequestException({
    message: 'This confirmation link is invalid or has expired',
    code: 'EMAIL_TOKEN_INVALID',
  });

const emailTaken = () =>
  new ConflictException({ message: 'This email is already in use', code: 'EMAIL_TAKEN' });

@Injectable()
export class EmailChangeService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private mail: MailClient,
    private audit: AuditService,
    private rateLimit: RateLimitService,
    private reauthentication: ReauthenticationService,
    private securityMail: SecurityMailService,
  ) {}

  private hash(token: string) {
    return hashEmailToken(
      this.config.getOrThrow<Buffer>('security.totpEncryptionKey'),
      EmailTokenPurpose.CHANGE_EMAIL,
      token,
    );
  }

  async request(userId: string, dto: RequestEmailChangeDto, client: ClientContext = {}) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User no longer exists');

    const newEmail = dto.newEmail.trim().toLowerCase();
    if (newEmail === user.email) {
      throw new BadRequestException({
        message: 'This is already your email',
        code: 'EMAIL_UNCHANGED',
      });
    }

    await this.reauthentication.confirm(user, dto, client);
    await this.rateLimit.consume(`email:change:${userId}`, RATE_LIMITS.emailChangePerAccount);
    this.mail.assertAvailable();

    const taken = await this.prisma.user.findUnique({
      where: { email: newEmail },
      select: { id: true },
    });
    if (taken) throw emailTaken();

    const token = randomToken();
    const [, , updated] = await this.prisma.$transaction([
      this.prisma.emailToken.deleteMany({
        where: { userId, purpose: EmailTokenPurpose.CHANGE_EMAIL },
      }),
      this.prisma.emailToken.create({
        data: {
          userId,
          purpose: EmailTokenPurpose.CHANGE_EMAIL,
          tokenHash: this.hash(token),
          expiresAt: new Date(Date.now() + CHANGE_LINK_TTL_MS),
        },
      }),
      this.prisma.user.update({ where: { id: userId }, data: { pendingEmail: newEmail } }),
    ]);

    await this.mail.send({
      to: newEmail,
      ...confirmationMessage(
        this.mail.buildLink(VERIFY_EMAIL_PATH, { token, type: EMAIL_CHANGE_LINK_TYPE }),
      ),
    });
    await this.securityMail.emailChangeRequested(user.email, newEmail);
    await this.audit.record({ action: 'auth.email_change_requested', actorId: userId, client });
    return toAccount(updated);
  }

  async cancel(userId: string) {
    const [, updated] = await this.prisma.$transaction([
      this.prisma.emailToken.deleteMany({
        where: { userId, purpose: EmailTokenPurpose.CHANGE_EMAIL },
      }),
      this.prisma.user.update({ where: { id: userId }, data: { pendingEmail: null } }),
    ]);
    return toAccount(updated);
  }

  async confirm(token: string, client: ClientContext = {}) {
    const record = await this.prisma.emailToken.findUnique({
      where: { tokenHash: this.hash(token) },
      select: {
        id: true,
        userId: true,
        purpose: true,
        expiresAt: true,
        consumedAt: true,
        user: { select: { email: true, pendingEmail: true } },
      },
    });
    if (
      !record ||
      record.purpose !== EmailTokenPurpose.CHANGE_EMAIL ||
      record.consumedAt ||
      record.expiresAt < new Date() ||
      !record.user.pendingEmail
    ) {
      throw invalidLink();
    }

    const previousEmail = record.user.email;
    const newEmail = record.user.pendingEmail;
    try {
      await this.prisma.$transaction(async (tx) => {
        const now = new Date();
        const { count } = await tx.emailToken.updateMany({
          where: { id: record.id, consumedAt: null, expiresAt: { gt: now } },
          data: { consumedAt: now },
        });
        if (count === 0) throw invalidLink();
        await tx.user.update({
          where: { id: record.userId, pendingEmail: newEmail },
          data: {
            email: newEmail,
            pendingEmail: null,
            emailVerifiedAt: now,
            emailOwnershipClaimable: false,
          },
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') throw emailTaken();
        if (error.code === 'P2025') throw invalidLink();
      }
      throw error;
    }

    await this.securityMail.emailChanged(previousEmail, newEmail);
    await this.audit.record({ action: 'auth.email_changed', actorId: record.userId, client });
    return { success: true };
  }
}

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'node:crypto';
import * as QRCode from 'qrcode';
import { BACKUP_CODE_COUNT, StaffRole } from '@viratec/contracts';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../security/audit.service';
import { RATE_LIMITS, RateLimitService } from '../security/rate-limit.service';
import { STAFF_SESSION_MAX_AGE_MS } from '../common/guards/staff.guard';
import {
  buildOtpauthUrl,
  decryptSecret,
  encryptSecret,
  generateBackupCode,
  generateTotpSecret,
  normalizeBackupCode,
  verifyTotp,
} from '../security/crypto';
import type { ClientContext } from '../common/decorators/client-context.decorator';

const STEP_UP_DURATION_MS = 5 * 60_000;

export type SecondFactorMethod = 'totp' | 'backup';

@Injectable()
export class TwoFactorService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private audit: AuditService,
    private rateLimit: RateLimitService,
  ) {}

  private get encryptionKey() {
    return this.config.getOrThrow<Buffer>('security.totpEncryptionKey');
  }

  private hashBackupCode(code: string) {
    return createHmac('sha256', this.encryptionKey).update(normalizeBackupCode(code)).digest('hex');
  }

  private async replaceBackupCodes(userId: string) {
    const codes = Array.from({ length: BACKUP_CODE_COUNT }, generateBackupCode);
    await this.prisma.$transaction([
      this.prisma.backupCode.deleteMany({ where: { userId } }),
      this.prisma.backupCode.createMany({
        data: codes.map((code) => ({ userId, codeHash: this.hashBackupCode(code) })),
      }),
    ]);
    return codes;
  }

  async beginSetup(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User no longer exists');
    if (user.twoFactorEnabled)
      throw new ConflictException('Two-factor authentication is already enabled');

    const secret = generateTotpSecret();
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorPendingSecret: encryptSecret(secret, this.encryptionKey) },
    });

    const otpauthUrl = buildOtpauthUrl(
      secret,
      user.email,
      this.config.get<string>('security.totpIssuer') ?? 'VIRaTeC',
    );
    const qrCodeSvg = await QRCode.toString(otpauthUrl, {
      type: 'svg',
      margin: 1,
      errorCorrectionLevel: 'M',
    });

    return { otpauthUrl, qrCodeSvg, manualKey: secret.match(/.{1,4}/g)?.join(' ') ?? secret };
  }

  async enable(userId: string, code: string, sessionId: string | undefined, client: ClientContext) {
    await this.rateLimit.consume(`mfa:setup:${userId}`, RATE_LIMITS.mfaPerAccount);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorPendingSecret) {
      throw new BadRequestException('Start two-factor setup first');
    }

    const secret = decryptSecret(user.twoFactorPendingSecret, this.encryptionKey);
    const step = verifyTotp(secret, code.trim(), null);
    if (step === null) throw new BadRequestException('The code is incorrect or expired');

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: user.twoFactorPendingSecret,
        twoFactorPendingSecret: null,
        twoFactorLastStep: step,
      },
    });
    const backupCodes = await this.replaceBackupCodes(userId);
    if (sessionId) {
      await this.prisma.refreshToken.updateMany({
        where: { userId, sessionId, revoked: false },
        data: { mfaVerifiedAt: new Date() },
      });
    }
    await this.rateLimit.reset(`mfa:setup:${userId}`);
    await this.audit.record({ action: 'auth.2fa_enabled', actorId: userId, client });
    return { backupCodes };
  }

  async verifySecondFactor(userId: string, code: string): Promise<SecondFactorMethod | null> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorEnabled || !user.twoFactorSecret) return null;

    const trimmed = code.trim();
    if (/^\d{6}$/.test(trimmed)) {
      const secret = decryptSecret(user.twoFactorSecret, this.encryptionKey);
      const step = verifyTotp(secret, trimmed, user.twoFactorLastStep);
      if (step === null) return null;
      const { count } = await this.prisma.user.updateMany({
        where: {
          id: userId,
          OR: [{ twoFactorLastStep: null }, { twoFactorLastStep: { lt: step } }],
        },
        data: { twoFactorLastStep: step },
      });
      return count === 1 ? 'totp' : null;
    }

    const { count } = await this.prisma.backupCode.updateMany({
      where: { userId, codeHash: this.hashBackupCode(trimmed), usedAt: null },
      data: { usedAt: new Date() },
    });
    return count === 1 ? 'backup' : null;
  }

  async requireSecondFactor(userId: string, code: string, client: ClientContext) {
    const method = await this.verifySecondFactor(userId, code);
    if (!method) {
      await this.audit.record({ action: 'auth.mfa_failed', actorId: userId, client });
      throw new UnauthorizedException('The code is incorrect or expired');
    }
    if (method === 'backup') {
      const remaining = await this.prisma.backupCode.count({ where: { userId, usedAt: null } });
      await this.audit.record({
        action: 'auth.backup_code_used',
        actorId: userId,
        metadata: { remaining },
        client,
      });
    }
    return method;
  }

  async disable(userId: string, code: string, client: ClientContext) {
    await this.rateLimit.consume(`mfa:manage:${userId}`, RATE_LIMITS.mfaPerAccount);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorEnabled)
      throw new BadRequestException('Two-factor authentication is not enabled');
    if (user.staffRole !== StaffRole.NONE) {
      throw new ForbiddenException('Two-factor authentication is mandatory for administrators');
    }

    await this.requireSecondFactor(userId, code, client);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
          twoFactorPendingSecret: null,
          twoFactorLastStep: null,
        },
      }),
      this.prisma.backupCode.deleteMany({ where: { userId } }),
    ]);
    await this.audit.record({ action: 'auth.2fa_disabled', actorId: userId, client });
    return { success: true };
  }

  async regenerateBackupCodes(userId: string, code: string, client: ClientContext) {
    await this.rateLimit.consume(`mfa:manage:${userId}`, RATE_LIMITS.mfaPerAccount);
    await this.requireSecondFactor(userId, code, client);
    const backupCodes = await this.replaceBackupCodes(userId);
    await this.audit.record({ action: 'auth.backup_codes_regenerated', actorId: userId, client });
    return { backupCodes };
  }

  async stepUp(userId: string, sessionId: string | undefined, code: string, client: ClientContext) {
    if (!sessionId) throw new UnauthorizedException('A signed-in session is required');
    await this.rateLimit.consume(`stepup:${userId}`, RATE_LIMITS.stepUpPerAccount);

    const method = await this.verifySecondFactor(userId, code);
    if (!method) {
      await this.audit.record({ action: 'auth.step_up_failed', actorId: userId, client });
      throw new UnauthorizedException('The code is incorrect or expired');
    }

    const now = Date.now();
    const elevatedUntil = new Date(now + STEP_UP_DURATION_MS);
    const publishElevatedUntil = new Date(now + STAFF_SESSION_MAX_AGE_MS);
    await this.prisma.refreshToken.updateMany({
      where: { userId, sessionId, revoked: false },
      data: { elevatedUntil, publishElevatedUntil, mfaVerifiedAt: new Date(now) },
    });
    await this.rateLimit.reset(`stepup:${userId}`);
    await this.audit.record({
      action: 'auth.step_up',
      actorId: userId,
      metadata: { method },
      client,
    });
    return { elevatedUntil: elevatedUntil.toISOString() };
  }
}

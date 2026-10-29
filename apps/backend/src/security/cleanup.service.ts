import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const CLEANUP_INTERVAL_MS = 60 * 60_000;
const FIRST_RUN_DELAY_MS = 60_000;

@Injectable()
export class CleanupService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(CleanupService.name);
  private timers: NodeJS.Timeout[] = [];

  constructor(private prisma: PrismaService) {}

  onApplicationBootstrap() {
    this.timers = [
      setTimeout(() => void this.run(), FIRST_RUN_DELAY_MS),
      setInterval(() => void this.run(), CLEANUP_INTERVAL_MS),
    ];
    for (const timer of this.timers) timer.unref();
  }

  onModuleDestroy() {
    for (const timer of this.timers) clearTimeout(timer);
    this.timers = [];
  }

  async run() {
    const now = new Date();
    try {
      const [tokens, challenges, buckets, emailTokens] = await Promise.all([
        this.prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: now } } }),
        this.prisma.mfaChallenge.deleteMany({ where: { expiresAt: { lt: now } } }),
        this.prisma.rateLimitBucket.deleteMany({ where: { resetAt: { lt: now } } }),
        this.prisma.emailToken.deleteMany({ where: { expiresAt: { lt: now } } }),
      ]);
      this.logger.log(
        `Removed ${tokens.count} refresh tokens, ${challenges.count} MFA challenges, ${buckets.count} rate limit buckets, ${emailTokens.count} email tokens`,
      );
    } catch (error) {
      this.logger.error('Failed to remove expired security records', error as Error);
    }
  }
}

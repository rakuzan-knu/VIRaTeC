import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface BucketRow {
  count: number;
  resetAt: Date;
}

export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

export const RATE_LIMITS = {
  loginPerAccount: { limit: 5, windowMs: 15 * 60_000 },
  loginPerIp: { limit: 30, windowMs: 15 * 60_000 },
  mfaPerAccount: { limit: 8, windowMs: 15 * 60_000 },
  stepUpPerAccount: { limit: 8, windowMs: 15 * 60_000 },
  registerPerIp: { limit: 10, windowMs: 60 * 60_000 },
  translatePerAccount: { limit: 60, windowMs: 60 * 60_000 },
  communityPostPerAccount: { limit: 10, windowMs: 60 * 60_000 },
  communityLikePerAccount: { limit: 120, windowMs: 10 * 60_000 },
  contentMissPerIp: { limit: 60, windowMs: 15 * 60_000 },
  passwordCheckPerAccount: { limit: 5, windowMs: 15 * 60_000 },
  emailVerifyPerAccount: { limit: 3, windowMs: 60 * 60_000 },
  passwordForgotPerEmail: { limit: 3, windowMs: 60 * 60_000 },
  passwordForgotPerIp: { limit: 10, windowMs: 60 * 60_000 },
  passwordResetPerEmail: { limit: 10, windowMs: 15 * 60_000 },
} as const satisfies Record<string, RateLimitRule>;

@Injectable()
export class RateLimitService {
  constructor(private prisma: PrismaService) {}

  async consume(key: string, { limit, windowMs }: RateLimitRule) {
    const resetAt = new Date(Date.now() + windowMs);
    const [bucket] = await this.prisma.$queryRaw<BucketRow[]>`
      INSERT INTO "rate_limit_buckets" ("key", "count", "resetAt")
      VALUES (${key}, 1, ${resetAt})
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "rate_limit_buckets"."resetAt" < NOW() THEN 1 ELSE "rate_limit_buckets"."count" + 1 END,
        "resetAt" = CASE WHEN "rate_limit_buckets"."resetAt" < NOW() THEN ${resetAt} ELSE "rate_limit_buckets"."resetAt" END
      RETURNING "count", "resetAt"
    `;

    if (bucket && bucket.count > limit) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((bucket.resetAt.getTime() - Date.now()) / 1000),
      );
      throw new HttpException(
        { message: 'Too many attempts. Try again later.', retryAfterSeconds },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async reset(key: string) {
    await this.prisma.rateLimitBucket.deleteMany({ where: { key } });
  }
}

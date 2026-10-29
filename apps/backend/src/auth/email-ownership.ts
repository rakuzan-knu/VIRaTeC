import { createHmac, randomInt } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { EMAIL_TOKEN_LIMITS, type EmailTokenPurpose } from '@viratec/contracts';

export const hashEmailToken = (key: Buffer, purpose: EmailTokenPurpose, value: string) =>
  createHmac('sha256', key).update(`email-token:${purpose}:${value}`).digest('hex');

export const generateResetCode = () =>
  String(randomInt(0, 10 ** EMAIL_TOKEN_LIMITS.resetCodeLength)).padStart(
    EMAIL_TOKEN_LIMITS.resetCodeLength,
    '0',
  );

export const UNVERIFIED_ACCOUNT_CLAIM = {
  twoFactorEnabled: false,
  twoFactorSecret: null,
  twoFactorPendingSecret: null,
  twoFactorLastStep: null,
} satisfies Prisma.UserUpdateInput;

export function claimUnverifiedAccountWrites(
  prisma: Prisma.TransactionClient,
  userId: string,
  data: Prisma.UserUpdateInput,
) {
  return [
    prisma.user.update({
      where: { id: userId, emailVerifiedAt: null, emailOwnershipClaimable: true, isBlocked: false },
      data: {
        ...UNVERIFIED_ACCOUNT_CLAIM,
        ...data,
        emailVerifiedAt: new Date(),
        emailOwnershipClaimable: false,
      },
    }),
    prisma.backupCode.deleteMany({ where: { userId } }),
    prisma.refreshToken.updateMany({ where: { userId, revoked: false }, data: { revoked: true } }),
    prisma.emailToken.deleteMany({ where: { userId } }),
  ] as const;
}

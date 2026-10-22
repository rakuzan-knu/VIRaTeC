import type { User } from '@prisma/client';
import { effectiveStaff } from '../security/staff';

const PRIVATE_FIELDS = [
  'passwordHash',
  'googleId',
  'twoFactorSecret',
  'twoFactorPendingSecret',
  'twoFactorLastStep',
  'isBlocked',
  'staffRole',
  'permissions',
  'staffExpiresAt',
] as const satisfies readonly (keyof User)[];

type PrivateField = (typeof PRIVATE_FIELDS)[number];

function withoutPrivateFields(user: User): Omit<User, PrivateField> {
  const copy: Partial<User> = { ...user };
  for (const field of PRIVATE_FIELDS) delete copy[field];
  return copy as Omit<User, PrivateField>;
}

export function toAccount(user: User) {
  const staff = effectiveStaff(user);
  return {
    ...withoutPrivateFields(user),
    hasPassword: Boolean(user.passwordHash),
    hasGoogle: Boolean(user.googleId),
    staffRole: staff.staffRole,
    permissions: staff.permissions,
    staffExpiresAt: staff.staffRole === user.staffRole ? user.staffExpiresAt : null,
  };
}

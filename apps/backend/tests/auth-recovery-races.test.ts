import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Prisma } from '@prisma/client';
import argon2 from 'argon2';
import { hasStatus } from './support.ts';
import { AuthService } from '../dist/auth/auth.service.js';

async function recoveryRace() {
  const account = {
    id: 'recovering-user',
    email: 'owner@example.invalid',
    role: 'STUDENT',
    faculty: 'FIT',
    passwordHash: await argon2.hash('OriginalHorse12!'),
    googleId: null,
    emailVerifiedAt: null as Date | null,
    isBlocked: false,
    twoFactorEnabled: false,
  };
  let sessions = 0;
  const hooks = { beforeSign: () => {}, afterPasswordCheck: () => {} };
  const recover = () => {
    account.passwordHash = 'recovered-owner-hash';
    account.emailVerifiedAt = new Date();
    sessions = 0;
  };
  const service = new AuthService(
    {
      user: {
        findUnique: async () => structuredClone(account),
        update: async ({
          where,
          data,
        }: {
          where: { passwordHash?: string; emailVerifiedAt?: Date | null };
          data: { passwordHash?: string; refreshTokens?: unknown };
        }) => {
          if (
            where.passwordHash !== account.passwordHash ||
            where.emailVerifiedAt !== account.emailVerifiedAt
          ) {
            throw new Prisma.PrismaClientKnownRequestError('Credentials changed', {
              code: 'P2025',
              clientVersion: 'test',
            });
          }
          if (data.passwordHash) account.passwordHash = data.passwordHash;
          if (data.refreshTokens) sessions++;
          return structuredClone(account);
        },
      },
      refreshToken: {
        findUnique: async () => ({
          id: 'old-session',
          sessionId: 's',
          revoked: false,
          expiresAt: new Date(Date.now() + 60000),
          user: structuredClone(account),
        }),
        updateMany: async () => ({ count: 1 }),
      },
    },
    {
      signAsync: async () => {
        hooks.beforeSign();
        return 'signed-token';
      },
    },
    { get: () => undefined },
    {
      revokeAll: async () => {
        sessions = 0;
      },
    },
    undefined,
    { consume: async () => {}, reset: async () => hooks.afterPasswordCheck() },
  );
  return { service, account, hooks, recover, sessions: () => sessions };
}

test('an in-flight password change cannot overwrite recovered credentials', async () => {
  const race = await recoveryRace();
  race.hooks.afterPasswordCheck = race.recover;
  await assert.rejects(
    race.service.changePassword(race.account.id, {
      currentPassword: 'OriginalHorse12!',
      newPassword: 'AttackerHorse12!',
    }),
    hasStatus(409),
  );
  assert.equal(race.account.passwordHash, 'recovered-owner-hash');
  assert.equal(race.sessions(), 0);
});

test('a login cannot issue a new session after its credentials were recovered', async () => {
  const race = await recoveryRace();
  race.hooks.beforeSign = race.recover;
  await assert.rejects(
    race.service.login({
      email: race.account.email,
      password: 'OriginalHorse12!',
    }),
    hasStatus(401),
  );
  assert.equal(race.sessions(), 0);
});

test('refresh cannot issue a new session after credential recovery', async () => {
  const race = await recoveryRace();
  race.hooks.beforeSign = race.recover;
  await assert.rejects(race.service.refreshToken('old-token'), hasStatus(401));
  assert.equal(race.sessions(), 0);
});

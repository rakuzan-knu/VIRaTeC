import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import argon2 from 'argon2';
import { TERMS_VERSION } from '@viratec/contracts';
import { AuthService } from '../dist/auth/auth.service.js';
import { EmailChangeService } from '../dist/auth/email-change.service.js';
import { isGoogleAvatarUrl } from '../dist/auth/google-avatar.js';
import { ReauthenticationService } from '../dist/auth/reauthentication.service.js';
import { CommunityService } from '../dist/community/community.service.js';
import { AUDIT_RETENTION_MS, CleanupService } from '../dist/security/cleanup.service.js';
import { UsersService } from '../dist/users/users.service.js';
import { hasCode, hasStatus } from './support.ts';

const rateLimit = { consume: async () => undefined, reset: async () => undefined };

interface AccountRow {
  id: string;
  email: string;
  passwordHash: string | null;
  googleId: string | null;
  twoFactorEnabled: boolean;
  staffRole: string;
}

const accountRow = (overrides: Partial<AccountRow> = {}): AccountRow => ({
  id: 'u',
  email: 'user@example.invalid',
  passwordHash: null,
  googleId: 'google-sub',
  twoFactorEnabled: false,
  staffRole: 'NONE',
  ...overrides,
});

interface DeletionTrace {
  deleted: boolean;
  auditUpdates: unknown[];
  likeUpdates: unknown[];
  mailed: string[];
}

function deletionService(user: AccountRow, otherOwners = 0, reauthentication?: unknown) {
  const trace: DeletionTrace = { deleted: false, auditUpdates: [], likeUpdates: [], mailed: [] };
  const tx = {
    communityPost: {
      updateMany: async (args: unknown) => {
        trace.likeUpdates.push(args);
      },
    },
    auditLog: {
      updateMany: async (args: unknown) => {
        trace.auditUpdates.push(args);
      },
    },
    user: {
      delete: async () => {
        trace.deleted = true;
      },
    },
  };
  const prisma = {
    user: { findUnique: async () => user, count: async () => otherOwners },
    $transaction: async (run: (client: typeof tx) => Promise<void>) => run(tx),
  };
  const securityMail = {
    accountDeleted: async (to: string) => {
      trace.mailed.push(to);
    },
  };
  const service = new UsersService(
    prisma,
    rateLimit,
    reauthentication ?? new ReauthenticationService(rateLimit),
    securityMail,
  );
  return { service, trace };
}

test('the last owner cannot delete the account', async () => {
  const { service, trace } = deletionService(accountRow({ staffRole: 'OWNER' }));
  await assert.rejects(
    service.deleteAccount('u', { confirmation: 'user@example.invalid' }),
    hasCode(409, 'LAST_OWNER'),
  );
  assert.equal(trace.deleted, false);
});

test('a Google-only account needs a fresh Google confirmation to be deleted', async () => {
  const { service, trace } = deletionService(accountRow());
  await assert.rejects(
    service.deleteAccount('u', { confirmation: 'user@example.invalid' }),
    hasCode(403, 'GOOGLE_REAUTH_REQUIRED'),
  );
  assert.equal(trace.deleted, false);
});

test('a stale or foreign Google credential is rejected', async () => {
  const now = Math.floor(Date.now() / 1000);
  for (const payload of [
    { sub: 'google-sub', iat: now - 3600 },
    { sub: 'someone-else', iat: now },
  ]) {
    const auth = { verifyGoogleCredential: async () => payload };
    const reauthentication = new ReauthenticationService(rateLimit, undefined, auth);
    await assert.rejects(
      reauthentication.confirm(accountRow(), { googleCredential: 'token' }),
      hasCode(403, 'GOOGLE_REAUTH_REQUIRED'),
    );
  }
});

test('two-factor accounts need a code after the password', async () => {
  const passwordHash = await argon2.hash('CorrectHorse1!');
  const user = accountRow({ passwordHash, twoFactorEnabled: true });
  const reauthentication = new ReauthenticationService(rateLimit, {
    requireSecondFactor: async () => 'totp',
  });
  await assert.rejects(
    reauthentication.confirm(user, { password: 'CorrectHorse1!' }),
    hasCode(403, 'TWO_FACTOR_REQUIRED'),
  );
  await reauthentication.confirm(user, { password: 'CorrectHorse1!', code: '123456' });
});

test('deleting an account erases its audit identifiers and fixes like counters', async () => {
  const passwordHash = await argon2.hash('CorrectHorse1!');
  const { service, trace } = deletionService(accountRow({ passwordHash }));
  await service.deleteAccount('u', {
    confirmation: 'user@example.invalid',
    password: 'CorrectHorse1!',
  });
  assert.equal(trace.deleted, true);
  assert.deepEqual(trace.auditUpdates, [
    { where: { actorId: 'u' }, data: { ipAddress: null, userAgent: null } },
    { where: { targetId: 'u' }, data: { targetId: null } },
  ]);
  assert.deepEqual(trace.likeUpdates, [
    {
      where: { authorId: { not: 'u' }, likes: { some: { userId: 'u' } } },
      data: { likesCount: { decrement: 1 } },
    },
  ]);
  assert.deepEqual(trace.mailed, ['user@example.invalid']);
});

test('cleanup removes audit entries older than the retention period', async () => {
  const removed: Array<{ createdAt: { lt: Date } }> = [];
  const empty = { deleteMany: async () => ({ count: 0 }) };
  const cleanup = new CleanupService({
    refreshToken: empty,
    mfaChallenge: empty,
    rateLimitBucket: empty,
    emailToken: empty,
    editorPresence: empty,
    auditLog: {
      deleteMany: async ({ where }: { where: { createdAt: { lt: Date } } }) => {
        removed.push(where);
        return { count: 3 };
      },
    },
    user: { updateMany: async () => ({ count: 0 }) },
  });
  const before = Date.now();
  await cleanup.run();
  assert.equal(removed.length, 1);
  assert.ok(removed[0].createdAt.lt.getTime() >= before - AUDIT_RETENTION_MS);
  assert.ok(removed[0].createdAt.lt.getTime() <= Date.now() - AUDIT_RETENTION_MS);
});

test('terms cannot be accepted for an outdated version', async () => {
  const service = new AuthService({}, {}, {});
  await assert.rejects(service.acceptTerms('u', '0.1'), hasCode(409, 'TERMS_VERSION_OUTDATED'));
});

test('accepting the current terms stores the version', async () => {
  let stored: { termsVersion?: string } = {};
  const service = new AuthService(
    {
      user: {
        update: async ({ data }: { data: { termsVersion: string } }) => {
          stored = data;
          return { ...accountRow(), ...data, permissions: [] };
        },
      },
    },
    {},
    {},
  );
  await service.acceptTerms('u', TERMS_VERSION);
  assert.equal(stored.termsVersion, TERMS_VERSION);
});

test('only Google photo hosts are copied', () => {
  assert.equal(isGoogleAvatarUrl('https://lh3.googleusercontent.com/a/photo'), true);
  assert.equal(isGoogleAvatarUrl('http://lh3.googleusercontent.com/a/photo'), false);
  assert.equal(isGoogleAvatarUrl('https://googleusercontent.com.evil.example/a'), false);
  assert.equal(isGoogleAvatarUrl('/api/v1/users/u/avatar?v=1'), false);
  assert.equal(isGoogleAvatarUrl(null), false);
});

test('only the author can delete a community post', async () => {
  let deleted = false;
  const service = new CommunityService(
    {
      communityPost: {
        findUnique: async () => ({ authorId: 'author' }),
        delete: async () => {
          deleted = true;
        },
      },
    },
    rateLimit,
  );
  await assert.rejects(service.remove('post', 'stranger'), hasStatus(403));
  assert.equal(deleted, false);
  await service.remove('post', 'author');
  assert.equal(deleted, true);
});

const emailChangeConfig = { getOrThrow: () => Buffer.alloc(32, 7) };
const noAudit = { record: async () => undefined };
const passingReauth = { confirm: async () => undefined };

function emailChangeService(prisma: unknown, sent: string[], securityMail: unknown) {
  const mail = {
    assertAvailable: () => undefined,
    buildLink: () => 'https://example.invalid/link',
    send: async ({ to }: { to: string }) => {
      sent.push(to);
    },
  };
  return new EmailChangeService(
    prisma,
    emailChangeConfig,
    mail,
    noAudit,
    rateLimit,
    passingReauth,
    securityMail,
  );
}

test('an email already in use is refused and no link is sent', async () => {
  const sent: string[] = [];
  const service = emailChangeService(
    {
      user: {
        findUnique: async ({ where }: { where: { id?: string; email?: string } }) =>
          where.id ? accountRow() : { id: 'other' },
      },
    },
    sent,
    {},
  );
  await assert.rejects(
    service.request('u', { newEmail: 'taken@example.invalid' }),
    hasCode(409, 'EMAIL_TAKEN'),
  );
  assert.deepEqual(sent, []);
});

test('the same address is refused before identity is checked', async () => {
  const service = emailChangeService({ user: { findUnique: async () => accountRow() } }, [], {});
  await assert.rejects(
    service.request('u', { newEmail: 'USER@example.invalid' }),
    hasCode(400, 'EMAIL_UNCHANGED'),
  );
});

test('confirming a change moves the account and warns the old address', async () => {
  const notices: Array<[string, string]> = [];
  let updated: { email?: string; pendingEmail?: string | null } = {};
  const tx = {
    emailToken: { updateMany: async () => ({ count: 1 }) },
    user: {
      update: async ({ data }: { data: typeof updated }) => {
        updated = data;
      },
    },
  };
  const service = emailChangeService(
    {
      emailToken: {
        findUnique: async () => ({
          id: 'token',
          userId: 'u',
          purpose: 'CHANGE_EMAIL',
          expiresAt: new Date(Date.now() + 60_000),
          consumedAt: null,
          user: { email: 'old@example.invalid', pendingEmail: 'new@example.invalid' },
        }),
      },
      $transaction: async (run: (client: typeof tx) => Promise<void>) => run(tx),
    },
    [],
    {
      emailChanged: async (to: string, next: string) => {
        notices.push([to, next]);
      },
    },
  );
  await service.confirm('raw-token');
  assert.equal(updated.email, 'new@example.invalid');
  assert.equal(updated.pendingEmail, null);
  assert.deepEqual(notices, [['old@example.invalid', 'new@example.invalid']]);
});

test('a token of another purpose cannot change the email', async () => {
  const service = emailChangeService(
    {
      emailToken: {
        findUnique: async () => ({
          id: 'token',
          userId: 'u',
          purpose: 'VERIFY_EMAIL',
          expiresAt: new Date(Date.now() + 60_000),
          consumedAt: null,
          user: { email: 'old@example.invalid', pendingEmail: 'new@example.invalid' },
        }),
      },
    },
    [],
    {},
  );
  await assert.rejects(service.confirm('raw-token'), hasCode(400, 'EMAIL_TOKEN_INVALID'));
});

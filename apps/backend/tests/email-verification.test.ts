import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomBytes } from 'node:crypto';
import argon2 from 'argon2';
import { hasCode, hasStatus } from './support.ts';
import { EmailVerificationService } from '../dist/auth/email-verification.service.js';
import { PasswordResetService } from '../dist/auth/password-reset.service.js';
import { AuthService } from '../dist/auth/auth.service.js';
import { MailClient, buildMimeMessage } from '../dist/auth/mail.client.js';
import { VerifiedEmailGuard } from '../dist/common/guards/verified-email.guard.js';
import { UsersService } from '../dist/users/users.service.js';
import { AdminService } from '../dist/admin/admin.service.js';
import { toAccount } from '../dist/security/account.js';

interface FakeUser {
  id: string;
  email: string;
  passwordHash: string | null;
  googleId: string | null;
  emailVerifiedAt: Date | null;
  emailOwnershipClaimable: boolean;
  isBlocked: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  staffRole: string;
  permissions: string[];
  staffExpiresAt: Date | null;
}

interface FakeEmailToken {
  id: string;
  userId: string;
  purpose: string;
  tokenHash: string;
  attempts: number;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
}

interface SentMail {
  to: string;
  subject: string;
  text: string;
}

const KEY = randomBytes(32);

const config = {
  getOrThrow: (key: string) => {
    if (key === 'security.totpEncryptionKey') return KEY;
    throw new Error(`Unexpected config ${key}`);
  },
  get: () => undefined,
};

const user = (overrides: Partial<FakeUser> = {}): FakeUser => ({
  id: 'user-1',
  email: 'student@example.invalid',
  passwordHash: 'old-hash',
  googleId: null,
  emailVerifiedAt: new Date('2026-01-01T00:00:00Z'),
  emailOwnershipClaimable: false,
  isBlocked: false,
  twoFactorEnabled: false,
  twoFactorSecret: null,
  staffRole: 'NONE',
  permissions: [],
  staffExpiresAt: null,
  ...overrides,
});

const matches = (row: object, where: Record<string, unknown>) =>
  Object.entries(where).every(([key, expected]) => {
    const actual = (row as Record<string, unknown>)[key];
    if (expected && typeof expected === 'object' && !(expected instanceof Date)) {
      const condition = expected as { gt?: Date; not?: null };
      if ('gt' in condition && condition.gt) return actual instanceof Date && actual > condition.gt;
      return true;
    }
    return actual === expected;
  });

function fakeDatabase(users: FakeUser[]) {
  const tokens: FakeEmailToken[] = [];
  const revoked: string[] = [];
  const clearedBackupCodes: string[] = [];
  let nextId = 0;
  const findUser = (where: Partial<FakeUser>) =>
    users.find((row) => matches(row, where as Record<string, unknown>)) ?? null;

  const tables = {
    user: {
      findUnique: async ({ where }: { where: Partial<FakeUser> }) => findUser(where),
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<FakeUser> & { refreshTokens?: unknown };
      }) => {
        const row = findUser(where);
        if (!row) throw new Error('missing user');
        if (data.refreshTokens) return row;
        Object.assign(row, data);
        return row;
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: Partial<FakeUser>;
        data: Partial<FakeUser>;
      }) => {
        const rows = users.filter((row) => matches(row, where as Record<string, unknown>));
        rows.forEach((row) => Object.assign(row, data));
        return { count: rows.length };
      },
    },
    emailToken: {
      create: async ({
        data,
      }: {
        data: Omit<FakeEmailToken, 'id' | 'attempts' | 'consumedAt' | 'createdAt'>;
      }) => {
        const row = {
          id: `token-${++nextId}`,
          attempts: 0,
          consumedAt: null,
          createdAt: new Date(),
          ...data,
        };
        tokens.push(row);
        return row;
      },
      deleteMany: async ({ where }: { where: Partial<FakeEmailToken> }) => {
        const before = tokens.length;
        for (let index = tokens.length - 1; index >= 0; index--) {
          if (matches(tokens[index], where as Record<string, unknown>)) tokens.splice(index, 1);
        }
        return { count: before - tokens.length };
      },
      findUnique: async ({ where }: { where: { tokenHash: string } }) =>
        tokens.find((row) => row.tokenHash === where.tokenHash) ?? null,
      findFirst: async ({ where }: { where: Record<string, unknown> }) =>
        tokens.filter((row) => matches(row, where)).at(-1) ?? null,
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: { attempts: { increment: number } };
      }) => {
        const row = tokens.find((token) => token.id === where.id);
        if (!row) throw new Error('missing token');
        row.attempts += data.attempts.increment;
        return row;
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: Partial<FakeEmailToken>;
        data: Partial<FakeEmailToken>;
      }) => {
        const rows = tokens.filter((row) => matches(row, where as Record<string, unknown>));
        rows.forEach((row) => Object.assign(row, data));
        return { count: rows.length };
      },
    },
    refreshToken: {
      updateMany: async ({ where }: { where: { userId: string } }) => {
        revoked.push(where.userId);
        return { count: 1 };
      },
    },
    backupCode: {
      deleteMany: async ({ where }: { where: { userId: string } }) => {
        clearedBackupCodes.push(where.userId);
        return { count: 1 };
      },
    },
  };
  const prisma = {
    ...tables,
    $transaction: async <T>(
      operations: Promise<unknown>[] | ((tx: typeof tables) => Promise<T>),
    ) => {
      if (typeof operations !== 'function') return Promise.all(operations);
      const snapshot = structuredClone({ users, tokens, revoked, clearedBackupCodes });
      try {
        return await operations(tables);
      } catch (error) {
        users.forEach((row, index) => Object.assign(row, snapshot.users[index]));
        tokens.splice(0, tokens.length, ...snapshot.tokens);
        revoked.splice(0, revoked.length, ...snapshot.revoked);
        clearedBackupCodes.splice(0, clearedBackupCodes.length, ...snapshot.clearedBackupCodes);
        throw error;
      }
    },
  };
  return { prisma, tokens, revoked, clearedBackupCodes };
}

function fakeMail(available = true) {
  const sent: SentMail[] = [];
  const mail = {
    assertAvailable: () => {
      if (!available) throw Object.assign(new Error('unavailable'), { status: 503 });
    },
    send: async (message: SentMail) => {
      sent.push(message);
    },
    buildLink: (path: string, params: Record<string, string>) =>
      `https://viratec.example${path}?${new URLSearchParams(params).toString()}`,
  };
  return { mail, sent };
}

const audit = { record: async () => undefined };
const rateLimit = { consume: async () => undefined, reset: async () => undefined };

const tokenFromMail = (mail: SentMail) => {
  const link = mail.text.split('\n').find((line) => line.startsWith('https://'));
  return new URL(link ?? '').searchParams.get('token') ?? '';
};

const codeFromMail = (mail: SentMail) => /(\d{6})/.exec(mail.text)?.[1] ?? '';

test('a verification link confirms the email exactly once', async () => {
  const account = user({ emailVerifiedAt: null });
  const { prisma, tokens } = fakeDatabase([account]);
  const { mail, sent } = fakeMail();
  const service = new EmailVerificationService(prisma, config, mail, audit, rateLimit);

  await service.send(account);
  const token = tokenFromMail(sent[0]);
  assert.equal(tokens.length, 1);
  assert.notEqual(tokens[0].tokenHash, token);

  await service.verify(token);
  assert.ok(account.emailVerifiedAt instanceof Date);
  await assert.rejects(service.verify(token), hasCode(400, 'EMAIL_TOKEN_INVALID'));
});

test('expired or unknown verification links are rejected', async () => {
  const account = user({ emailVerifiedAt: null });
  const { prisma, tokens } = fakeDatabase([account]);
  const { mail, sent } = fakeMail();
  const service = new EmailVerificationService(prisma, config, mail, audit, rateLimit);

  await service.send(account);
  tokens[0].expiresAt = new Date(Date.now() - 1000);
  await assert.rejects(service.verify(tokenFromMail(sent[0])), hasCode(400, 'EMAIL_TOKEN_INVALID'));
  await assert.rejects(service.verify('made-up-token'), hasCode(400, 'EMAIL_TOKEN_INVALID'));
  assert.equal(account.emailVerifiedAt, null);
});

test('a failed verification transaction leaves the link reusable', async () => {
  const account = user({ emailVerifiedAt: null });
  const { prisma, tokens } = fakeDatabase([account]);
  const { mail, sent } = fakeMail();
  const service = new EmailVerificationService(prisma, config, mail, audit, rateLimit);
  await service.send(account);
  const token = tokenFromMail(sent[0]);
  const update = prisma.user.updateMany;
  prisma.user.updateMany = async () => {
    throw new Error('database unavailable');
  };
  await assert.rejects(service.verify(token), /database unavailable/);
  assert.equal(account.emailVerifiedAt, null);
  assert.equal(tokens[0].consumedAt, null);
  prisma.user.updateMany = update;
  await service.verify(token);
  assert.ok(account.emailVerifiedAt);
});

test('a new verification link replaces the previous one', async () => {
  const account = user({ emailVerifiedAt: null });
  const { prisma, tokens } = fakeDatabase([account]);
  const { mail, sent } = fakeMail();
  const service = new EmailVerificationService(prisma, config, mail, audit, rateLimit);

  await service.send(account);
  await service.send(account);
  assert.equal(tokens.length, 1);
  await assert.rejects(service.verify(tokenFromMail(sent[0])), hasStatus(400));
  await service.verify(tokenFromMail(sent[1]));
});

test('registration still succeeds when the verification email cannot be sent', async () => {
  const account = user({ emailVerifiedAt: null });
  const { prisma } = fakeDatabase([account]);
  const { mail } = fakeMail(false);
  const service = new EmailVerificationService(prisma, config, mail, audit, rateLimit);

  await service.sendAfterRegistration(account);
});

test('password reset requests look the same for unknown emails and never send mail', async () => {
  const { prisma, tokens } = fakeDatabase([user()]);
  const { mail, sent } = fakeMail();
  const service = new PasswordResetService(prisma, config, mail, audit, rateLimit);

  assert.deepEqual(await service.request('nobody@example.invalid'), { success: true });
  assert.deepEqual(await service.request('STUDENT@example.invalid'), { success: true });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'student@example.invalid');
  assert.equal(tokens.length, 1);
  assert.equal(tokens[0].tokenHash.includes(codeFromMail(sent[0])), false);
});

test('without email delivery in production the reset request fails before any lookup', async () => {
  let lookups = 0;
  const { prisma } = fakeDatabase([user()]);
  prisma.user.findUnique = async () => {
    lookups++;
    return null;
  };
  const { mail } = fakeMail(false);
  const service = new PasswordResetService(prisma, config, mail, audit, rateLimit);

  await assert.rejects(service.request('student@example.invalid'));
  assert.equal(lookups, 0);
});

test('a reset code sets the password once and signs out every device', async () => {
  const account = user();
  const { prisma, revoked } = fakeDatabase([account]);
  const { mail, sent } = fakeMail();
  const service = new PasswordResetService(prisma, config, mail, audit, rateLimit);

  await service.request(account.email);
  const code = codeFromMail(sent[0]);
  await service.reset({ email: account.email, code, newPassword: 'NewHorse12!' });

  assert.ok(account.passwordHash && (await argon2.verify(account.passwordHash, 'NewHorse12!')));
  assert.deepEqual(revoked, [account.id]);
  await assert.rejects(
    service.reset({ email: account.email, code, newPassword: 'Another12!' }),
    hasCode(400, 'RESET_CODE_INVALID'),
  );
});

test('a reset code stops working after five wrong guesses', async () => {
  const account = user();
  const { prisma } = fakeDatabase([account]);
  const { mail, sent } = fakeMail();
  const service = new PasswordResetService(prisma, config, mail, audit, rateLimit);

  await service.request(account.email);
  const code = codeFromMail(sent[0]);
  const wrong = code === '000000' ? '111111' : '000000';
  for (let attempt = 0; attempt < 5; attempt++) {
    await assert.rejects(
      service.reset({ email: account.email, code: wrong, newPassword: 'NewHorse12!' }),
      hasCode(400, 'RESET_CODE_INVALID'),
    );
  }
  await assert.rejects(
    service.reset({ email: account.email, code, newPassword: 'NewHorse12!' }),
    hasCode(400, 'RESET_CODE_INVALID'),
  );
  assert.equal(account.passwordHash, 'old-hash');
});

test('a failed password reset transaction leaves the code reusable and sessions intact', async () => {
  const account = user();
  const { prisma, tokens, revoked } = fakeDatabase([account]);
  const { mail, sent } = fakeMail();
  const service = new PasswordResetService(prisma, config, mail, audit, rateLimit);
  await service.request(account.email);
  const input = { email: account.email, code: codeFromMail(sent[0]), newPassword: 'NewHorse12!' };
  const revoke = prisma.refreshToken.updateMany;
  prisma.refreshToken.updateMany = async () => {
    throw new Error('database unavailable');
  };
  await assert.rejects(service.reset(input), /database unavailable/);
  assert.equal(account.passwordHash, 'old-hash');
  assert.equal(tokens[0].consumedAt, null);
  assert.deepEqual(revoked, []);
  prisma.refreshToken.updateMany = revoke;
  await service.reset(input);
  assert.ok(account.passwordHash && (await argon2.verify(account.passwordHash, input.newPassword)));
});

test('email recovery preserves legacy MFA, backup codes and Google connection', async () => {
  const account = user({
    emailVerifiedAt: null,
    emailOwnershipClaimable: false,
    googleId: 'legacy-google',
    twoFactorEnabled: true,
    twoFactorSecret: 'legacy-secret',
    staffRole: 'OWNER',
  });
  const { prisma, clearedBackupCodes, revoked } = fakeDatabase([account]);
  const { mail, sent } = fakeMail();
  const service = new PasswordResetService(prisma, config, mail, audit, rateLimit);
  await service.request(account.email);
  await service.reset({
    email: account.email,
    code: codeFromMail(sent[0]),
    newPassword: 'NewHorse12!',
  });
  assert.equal(account.googleId, 'legacy-google');
  assert.equal(account.twoFactorEnabled, true);
  assert.equal(account.twoFactorSecret, 'legacy-secret');
  assert.equal(account.staffRole, 'OWNER');
  assert.deepEqual(clearedBackupCodes, []);
  assert.deepEqual(revoked, [account.id]);
  assert.ok(account.emailVerifiedAt);
});

test('resetting the password of an unverified account removes what a squatter attached', async () => {
  const account = user({
    emailVerifiedAt: null,
    emailOwnershipClaimable: true,
    googleId: 'squatter-google',
    twoFactorEnabled: true,
    twoFactorSecret: 'v1:secret',
  });
  const { prisma, revoked, clearedBackupCodes } = fakeDatabase([account]);
  const { mail, sent } = fakeMail();
  const service = new PasswordResetService(prisma, config, mail, audit, rateLimit);

  await service.request(account.email);
  await service.reset({
    email: account.email,
    code: codeFromMail(sent[0]),
    newPassword: 'NewHorse12!',
  });

  assert.equal(account.googleId, null);
  assert.equal(account.twoFactorEnabled, false);
  assert.equal(account.twoFactorSecret, null);
  assert.ok(account.emailVerifiedAt instanceof Date);
  assert.deepEqual(revoked, [account.id]);
  assert.deepEqual(clearedBackupCodes, [account.id]);
});

test('Google sign-in takes over an unverified account with the same email', async () => {
  const account = user({
    email: 'google@example.invalid',
    emailVerifiedAt: null,
    emailOwnershipClaimable: true,
  });
  const { prisma, revoked } = fakeDatabase([account]);
  const service = new AuthService(
    {
      ...prisma,
      refreshToken: { ...prisma.refreshToken, create: async () => undefined },
    },
    { signAsync: async () => 'token' },
    { get: (key: string) => (key === 'google.clientId' ? 'client-id' : undefined) },
    {},
    audit,
  );
  service.googleClient = {
    verifyIdToken: async () => ({
      getPayload: () => ({
        sub: 'owner-google',
        email: 'Google@example.invalid',
        email_verified: true,
        name: 'Owner',
      }),
    }),
  };

  const result = await service.googleAuth({ credential: 'token' });

  assert.equal(result.user.id, account.id);
  assert.equal(result.user.emailVerified, true);
  assert.equal(account.googleId, 'owner-google');
  assert.equal(account.passwordHash, null);
  assert.deepEqual(revoked, [account.id]);
});

test('the verified-email guard blocks unconfirmed accounts', () => {
  const guard = new VerifiedEmailGuard();
  const context = (current: object | undefined) =>
    ({ switchToHttp: () => ({ getRequest: () => ({ user: current }) }) }) as never;

  assert.throws(
    () => guard.canActivate(context({ id: 'u', emailVerified: false })),
    hasCode(403, 'EMAIL_NOT_VERIFIED'),
  );
  assert.throws(() => guard.canActivate(context(undefined)), hasStatus(403));
  assert.equal(guard.canActivate(context({ id: 'u', emailVerified: true })), true);
});

const profileRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'owner',
  name: 'Profile Owner',
  email: 'owner@example.invalid',
  showEmail: false,
  visibility: 'MEMBERS',
  emailVerifiedAt: new Date(),
  projects: [],
  papers: [],
  ...overrides,
});

test('unverified profiles are hidden and unverified viewers cannot open member profiles', async () => {
  const service = (row: ReturnType<typeof profileRow>) =>
    new UsersService({ user: { findUnique: async () => row } });

  const unverified = service(profileRow({ visibility: 'PUBLIC', emailVerifiedAt: null }));
  await assert.rejects(unverified.findPublicProfile('owner', null, null), hasStatus(404));
  await assert.rejects(unverified.findPublicProfile('owner', 'other', 'other'), hasStatus(404));
  assert.equal((await unverified.findPublicProfile('owner', 'owner', null)).isOwner, true);

  const members = service(profileRow());
  await assert.rejects(
    members.findPublicProfile('owner', 'viewer', null),
    hasCode(403, 'EMAIL_NOT_VERIFIED'),
  );
  const visible = await members.findPublicProfile('owner', 'viewer', 'viewer');
  assert.equal('emailVerifiedAt' in visible, false);
});

test('administrator access is never granted to an unverified account', async () => {
  let updated = false;
  const target = user({ id: 'target', emailVerifiedAt: null });
  const service = new AdminService(
    {
      user: {
        findUnique: async () => target,
        update: async () => {
          updated = true;
        },
      },
    },
    audit,
  );
  const owner = { id: 'owner', staffRole: 'OWNER', permissions: [] };

  await assert.rejects(
    service.updateAccess(owner, 'target', { staffRole: 'ADMIN', permissions: ['USERS_VIEW'] }, {}),
    hasCode(409, 'EMAIL_NOT_VERIFIED'),
  );
  await assert.rejects(
    service.transferOwnership(owner, 'target', {}),
    hasCode(409, 'EMAIL_NOT_VERIFIED'),
  );
  assert.equal(updated, false);
});

test('accounts expose whether the email is confirmed but not when', () => {
  const account = toAccount(user({ emailVerifiedAt: null }));
  assert.equal(account.emailVerified, false);
  assert.equal('emailVerifiedAt' in account, false);
  assert.equal('emailOwnershipClaimable' in account, false);
  assert.equal(toAccount(user()).emailVerified, true);
});

test('mail headers cannot be injected through the recipient or subject', () => {
  assert.throws(() =>
    buildMimeMessage('VIRaTeC <coil.knu@gmail.com>', {
      to: 'victim@example.invalid\r\nBcc: everyone@example.invalid',
      subject: 'Hi',
      text: 'Body',
    }),
  );
  const message = buildMimeMessage('VIRaTeC <coil.knu@gmail.com>', {
    to: 'student@example.invalid',
    subject: 'Підтвердьте пошту',
    text: 'Текст',
  });
  assert.match(message, /^Subject: =\?UTF-8\?B\?/m);
});

test('outside production an unconfigured mail client logs instead of failing', async () => {
  const mailConfig = {
    from: '',
    frontendUrl: 'http://localhost:5173',
    gmail: { clientId: '', clientSecret: '', refreshToken: '' },
  };
  const client = (isProduction: boolean) =>
    new MailClient({
      getOrThrow: () => mailConfig,
      get: (key: string) => (key === 'security.isProduction' ? isProduction : undefined),
    });

  await client(false).send({ to: 'a@example.invalid', subject: 'S', text: 'T' });
  await assert.rejects(
    client(true).send({ to: 'a@example.invalid', subject: 'S', text: 'T' }),
    hasCode(503, 'EMAIL_UNAVAILABLE'),
  );
  assert.equal(
    client(false).buildLink('/verify-email', { token: 'abc' }),
    'http://localhost:5173/verify-email?token=abc',
  );
});

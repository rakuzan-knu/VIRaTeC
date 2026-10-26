import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hasStatus } from './support.ts';
import { Prisma } from '@prisma/client';
import { AuthService } from '../dist/auth/auth.service.js';

const payload = {
  sub: 'google-subject',
  email: 'Google@Example.invalid',
  email_verified: true,
  name: 'Google User',
  picture: 'https://example.invalid/avatar.png',
};

interface GoogleUser {
  id: string;
  email?: string;
  googleId?: string | null;
  passwordHash?: string | null;
  role?: string;
  faculty?: string;
  name?: string;
  termsVersion?: string;
  termsAcceptedAt?: Date;
}

interface CreateUserArgs {
  data: Omit<GoogleUser, 'id'>;
}

interface VerifyOptions {
  idToken: string;
  audience: string;
}

interface SetupOptions {
  users?: GoogleUser[];
  tokenPayload?: typeof payload;
  configured?: boolean;
  verifyError?: Error;
  createError?: Error;
}

function setup({
  users = [],
  tokenPayload = payload,
  configured = true,
  verifyError,
  createError,
}: SetupOptions = {}) {
  const calls = { reads: 0, creates: 0, tokens: 0, refreshTokens: 0 };
  let verifiedOptions: VerifyOptions | undefined;
  const service = new AuthService(
    {
      user: {
        findUnique: async ({ where }: { where: { googleId?: string } }) => {
          calls.reads++;
          return users.find((user) => user.googleId === where.googleId) ?? null;
        },
        create: async ({ data }: CreateUserArgs) => {
          calls.creates++;
          if (createError) throw createError;
          if (users.some((user) => user.email === data.email)) {
            throw new Prisma.PrismaClientKnownRequestError('Unique email', {
              code: 'P2002',
              clientVersion: 'test',
            });
          }
          const user: GoogleUser = {
            id: 'new-user',
            passwordHash: null,
            role: 'STUDENT',
            faculty: 'FIT',
            ...data,
          };
          users.push(user);
          return user;
        },
      },
      refreshToken: {
        deleteMany: async () => ({ count: 0 }),
        create: async () => {
          calls.refreshTokens++;
        },
      },
    },
    { signAsync: async () => `token-${++calls.tokens}` },
    { get: () => (configured ? 'expected-client-id' : undefined) },
  );
  service.googleClient = {
    verifyIdToken: async (options: VerifyOptions) => {
      verifiedOptions = options;
      if (verifyError) throw verifyError;
      return { getPayload: () => tokenPayload };
    },
  };
  return { service, users, calls, options: () => verifiedOptions };
}

test('Google registration verifies the configured audience and returns a sanitized student session', async () => {
  const { service, users, calls, options } = setup();
  const result = await service.googleAuth({ credential: 'google-id-token', acceptTerms: true });
  assert.deepEqual(options(), { idToken: 'google-id-token', audience: 'expected-client-id' });
  assert.equal(users[0].email, 'google@example.invalid');
  assert.equal(users[0].googleId, payload.sub);
  assert.equal(users[0].name, payload.name);
  assert.equal(users[0].termsVersion, '1.1');
  assert.ok(users[0].termsAcceptedAt instanceof Date);
  assert.equal(result.user.role, 'STUDENT');
  assert.equal(result.user.googleId, undefined);
  assert.equal(result.user.passwordHash, undefined);
  assert.equal(calls.refreshTokens, 1);
  assert.ok(result.accessToken);
  assert.ok(result.refreshToken);
});

test('new Google account is not created without accepting the terms', async () => {
  const { service, calls } = setup();
  await assert.rejects(service.googleAuth({ credential: 'token' }), hasStatus(400));
  assert.equal(calls.creates, 0);
  assert.equal(calls.tokens, 0);
});

test('returning Google user signs in without re-sending terms acceptance', async () => {
  const user = { id: 'existing', email: 'google@example.invalid', googleId: payload.sub };
  const { service, calls } = setup({ users: [user] });
  const result = await service.googleAuth({ credential: 'token' });
  assert.equal(result.user.id, user.id);
  assert.equal(calls.creates, 0);
});

test('returning Google user is identified by subject even if their Google email changed', async () => {
  const user = {
    id: 'existing',
    email: 'old@example.invalid',
    googleId: payload.sub,
    role: 'PARTNER',
  };
  const { service, calls } = setup({ users: [user] });
  const result = await service.googleAuth({ credential: 'token', acceptTerms: true });
  assert.equal(result.user.id, user.id);
  assert.equal(result.user.role, 'PARTNER');
  assert.equal(calls.creates, 0);
});

for (const googleId of [null, 'another-google-subject']) {
  test(`email collision cannot grant access or link an account with googleId=${googleId}`, async () => {
    const user = {
      id: 'victim',
      email: 'google@example.invalid',
      googleId,
      passwordHash: 'existing-password',
      role: 'ADMIN',
    };
    const before = { ...user };
    const { service, users, calls } = setup({ users: [user] });
    await assert.rejects(
      service.googleAuth({ credential: 'token', acceptTerms: true }),
      hasStatus(409),
    );
    assert.deepEqual(users, [before]);
    assert.equal(calls.tokens, 0);
    assert.equal(calls.refreshTokens, 0);
  });
}

for (const tokenPayload of [
  undefined,
  { ...payload, sub: '' },
  { ...payload, email: '' },
  { ...payload, email_verified: false },
]) {
  test(`invalid Google payload is rejected before database access: ${JSON.stringify(tokenPayload)}`, async () => {
    const { service, calls } = setup();
    service.googleClient = { verifyIdToken: async () => ({ getPayload: () => tokenPayload }) };
    await assert.rejects(
      service.googleAuth({ credential: 'token', acceptTerms: true }),
      hasStatus(401),
    );
    assert.equal(calls.reads, 0);
    assert.equal(calls.creates, 0);
    assert.equal(calls.tokens, 0);
  });
}

test('invalid, expired or wrong-audience token is rejected before database access', async () => {
  const { service, calls } = setup({ verifyError: new Error('Token verification failed') });
  await assert.rejects(
    service.googleAuth({ credential: 'token', acceptTerms: true }),
    hasStatus(401),
  );
  assert.equal(calls.reads, 0);
  assert.equal(calls.tokens, 0);
});

test('missing Google configuration returns 503 without database access', async () => {
  const { service, calls, options } = setup({ configured: false });
  await assert.rejects(
    service.googleAuth({ credential: 'token', acceptTerms: true }),
    hasStatus(503),
  );
  assert.equal(options(), undefined);
  assert.equal(calls.reads, 0);
});

test('concurrent creation recovers only the same Google subject', async () => {
  const { service, users, calls } = setup();
  service.prisma.user.create = async ({ data }: CreateUserArgs) => {
    users.push({ id: 'concurrently-created', role: 'STUDENT', ...data });
    throw new Prisma.PrismaClientKnownRequestError('Unique Google subject', {
      code: 'P2002',
      clientVersion: 'test',
    });
  };
  const result = await service.googleAuth({ credential: 'token', acceptTerms: true });
  assert.equal(result.user.id, 'concurrently-created');
  assert.equal(calls.refreshTokens, 1);
});

test('database failures propagate without issuing a session', async () => {
  const error = new Error('Database unavailable');
  const { service, calls } = setup({ createError: error });
  await assert.rejects(service.googleAuth({ credential: 'token', acceptTerms: true }), error);
  assert.equal(calls.tokens, 0);
});

test('Google-only accounts cannot sign in with a password', async () => {
  const { service, calls } = setup();
  service.prisma.user.findUnique = async () => ({ passwordHash: null });
  await assert.rejects(
    service.login({ email: 'google@example.invalid', password: 'anything' }),
    hasStatus(401),
  );
  assert.equal(calls.tokens, 0);
});

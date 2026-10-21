const assert = require('node:assert/strict');
const { test } = require('node:test');
const { Prisma } = require('@prisma/client');
const { AuthService } = require('../dist/auth/auth.service.js');

const payload = {
  sub: 'google-subject',
  email: 'Google@Example.invalid',
  email_verified: true,
  name: 'Google User',
  picture: 'https://example.invalid/avatar.png',
};

function setup({
  users = [],
  tokenPayload = payload,
  configured = true,
  verifyError,
  createError,
} = {}) {
  const calls = { reads: 0, creates: 0, tokens: 0, refreshTokens: 0 };
  let verifiedOptions;
  const service = new AuthService(
    {
      user: {
        findUnique: async ({ where }) => {
          calls.reads++;
          return users.find((user) => user.googleId === where.googleId) ?? null;
        },
        create: async ({ data }) => {
          calls.creates++;
          if (createError) throw createError;
          if (users.some((user) => user.email === data.email)) {
            throw new Prisma.PrismaClientKnownRequestError('Unique email', {
              code: 'P2002',
              clientVersion: 'test',
            });
          }
          const user = {
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
        create: async () => {
          calls.refreshTokens++;
        },
      },
    },
    { signAsync: async () => `token-${++calls.tokens}` },
    { get: () => (configured ? 'expected-client-id' : undefined) },
  );
  service.googleClient = {
    verifyIdToken: async (options) => {
      verifiedOptions = options;
      if (verifyError) throw verifyError;
      return { getPayload: () => tokenPayload };
    },
  };
  return { service, users, calls, options: () => verifiedOptions };
}

test('Google registration verifies the configured audience and returns a sanitized student session', async () => {
  const { service, users, calls, options } = setup();
  const result = await service.googleAuth({ credential: 'google-id-token' });
  assert.deepEqual(options(), { idToken: 'google-id-token', audience: 'expected-client-id' });
  assert.equal(users[0].email, 'google@example.invalid');
  assert.equal(users[0].googleId, payload.sub);
  assert.equal(users[0].name, payload.name);
  assert.equal(result.user.role, 'STUDENT');
  assert.equal(result.user.googleId, undefined);
  assert.equal(result.user.passwordHash, undefined);
  assert.equal(calls.refreshTokens, 1);
  assert.ok(result.accessToken);
  assert.ok(result.refreshToken);
});

test('returning Google user is identified by subject even if their Google email changed', async () => {
  const user = {
    id: 'existing',
    email: 'old@example.invalid',
    googleId: payload.sub,
    role: 'PARTNER',
  };
  const { service, calls } = setup({ users: [user] });
  const result = await service.googleAuth({ credential: 'token' });
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
      service.googleAuth({ credential: 'token' }),
      (error) => error.getStatus() === 409,
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
      service.googleAuth({ credential: 'token' }),
      (error) => error.getStatus() === 401,
    );
    assert.equal(calls.reads, 0);
    assert.equal(calls.creates, 0);
    assert.equal(calls.tokens, 0);
  });
}

test('invalid, expired or wrong-audience token is rejected before database access', async () => {
  const { service, calls } = setup({ verifyError: new Error('Token verification failed') });
  await assert.rejects(
    service.googleAuth({ credential: 'token' }),
    (error) => error.getStatus() === 401,
  );
  assert.equal(calls.reads, 0);
  assert.equal(calls.tokens, 0);
});

test('missing Google configuration returns 503 without database access', async () => {
  const { service, calls, options } = setup({ configured: false });
  await assert.rejects(
    service.googleAuth({ credential: 'token' }),
    (error) => error.getStatus() === 503,
  );
  assert.equal(options(), undefined);
  assert.equal(calls.reads, 0);
});

test('concurrent creation recovers only the same Google subject', async () => {
  const { service, users, calls } = setup();
  service.prisma.user.create = async ({ data }) => {
    users.push({ id: 'concurrently-created', role: 'STUDENT', ...data });
    throw new Prisma.PrismaClientKnownRequestError('Unique Google subject', {
      code: 'P2002',
      clientVersion: 'test',
    });
  };
  const result = await service.googleAuth({ credential: 'token' });
  assert.equal(result.user.id, 'concurrently-created');
  assert.equal(calls.refreshTokens, 1);
});

test('database failures propagate without issuing a session', async () => {
  const error = new Error('Database unavailable');
  const { service, calls } = setup({ createError: error });
  await assert.rejects(service.googleAuth({ credential: 'token' }), error);
  assert.equal(calls.tokens, 0);
});

test('Google-only accounts cannot sign in with a password', async () => {
  const { service, calls } = setup();
  service.prisma.user.findUnique = async () => ({ passwordHash: null });
  await assert.rejects(
    service.login({ email: 'google@example.invalid', password: 'anything' }),
    (error) => error.getStatus() === 401,
  );
  assert.equal(calls.tokens, 0);
});

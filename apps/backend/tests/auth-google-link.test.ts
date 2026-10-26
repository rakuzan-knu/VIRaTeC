import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hasStatus } from './support.ts';
import { AuthService } from '../dist/auth/auth.service.js';

const payload = {
  sub: 'google-subject',
  email: 'other@example.invalid',
  email_verified: true,
  picture: 'https://example.invalid/avatar.png',
};

interface LinkUser {
  id: string;
  email?: string;
  passwordHash: string | null;
  googleId: string | null;
  avatarUrl?: string | null;
}

interface UserWhere {
  id?: string;
  googleId?: string;
}

function setup(users: LinkUser[]) {
  const service = new AuthService(
    {
      user: {
        findUnique: async ({ where }: { where: UserWhere }) =>
          users.find((user) =>
            where.id !== undefined ? user.id === where.id : user.googleId === where.googleId,
          ) ?? null,
        update: async ({ where, data }: { where: UserWhere; data: Partial<LinkUser> }) => {
          const user = users.find((item) => item.id === where.id);
          assert.ok(user);
          Object.assign(user, data);
          return user;
        },
      },
    },
    {},
    { get: () => 'expected-client-id' },
  );
  service.googleClient = { verifyIdToken: async () => ({ getPayload: () => payload }) };
  return service;
}

const passwordUser = (): LinkUser => ({
  id: 'password-user',
  email: 'student@example.invalid',
  passwordHash: 'hash',
  googleId: null,
  avatarUrl: null,
});

test('linking stores the Google subject and reports the connection', async () => {
  const users = [passwordUser()];
  const account = await setup(users).linkGoogle('password-user', { credential: 'token' });

  assert.equal(users[0].googleId, 'google-subject');
  assert.equal(account.hasGoogle, true);
  assert.equal(account.hasPassword, true);
  assert.equal(account.googleId, undefined);
  assert.equal(account.avatarUrl, payload.picture);
});

test('linking refuses a Google account owned by another user', async () => {
  const users = [passwordUser(), { id: 'owner', googleId: 'google-subject', passwordHash: null }];

  await assert.rejects(
    setup(users).linkGoogle('password-user', { credential: 'token' }),
    hasStatus(409),
  );
  assert.equal(users[0].googleId, null);
});

test('linking refuses when Google is already connected', async () => {
  const users = [{ ...passwordUser(), googleId: 'existing-subject' }];

  await assert.rejects(
    setup(users).linkGoogle('password-user', { credential: 'token' }),
    hasStatus(409),
  );
  assert.equal(users[0].googleId, 'existing-subject');
});

test('unlinking keeps accounts that would lose their only sign-in method', async () => {
  const users = [{ ...passwordUser(), passwordHash: null, googleId: 'google-subject' }];

  await assert.rejects(setup(users).unlinkGoogle('password-user'), hasStatus(400));
  assert.equal(users[0].googleId, 'google-subject');
});

test('unlinking removes Google from accounts with a password', async () => {
  const users = [{ ...passwordUser(), googleId: 'google-subject' }];
  const account = await setup(users).unlinkGoogle('password-user');

  assert.equal(users[0].googleId, null);
  assert.equal(account.hasGoogle, false);
});

test('linking reports an invalid Google credential as a bad request', async () => {
  const users = [passwordUser()];
  const service = setup(users);
  service.googleClient = {
    verifyIdToken: async () => {
      throw new Error('invalid token');
    },
  };

  await assert.rejects(
    service.linkGoogle('password-user', { credential: 'token' }),
    hasStatus(400),
  );
  assert.equal(users[0].googleId, null);
});

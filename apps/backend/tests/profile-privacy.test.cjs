const assert = require('node:assert/strict');
const { test } = require('node:test');
const { UsersService } = require('../dist/users/users.service.js');
const { AuthService } = require('../dist/auth/auth.service.js');

const profile = (visibility, overrides = {}) => ({
  id: 'owner',
  name: 'Profile Owner',
  email: 'owner@example.invalid',
  showEmail: false,
  visibility,
  projects: [],
  papers: [],
  ...overrides,
});

const usersService = (user) => new UsersService({ user: { findUnique: async () => user } });

test('private profiles are hidden from everyone except the owner', async () => {
  const service = usersService(profile('PRIVATE'));

  await assert.rejects(service.findPublicProfile('owner', null), (e) => e.getStatus() === 404);
  await assert.rejects(service.findPublicProfile('owner', 'member'), (e) => e.getStatus() === 404);
  assert.equal((await service.findPublicProfile('owner', 'owner')).isOwner, true);
});

test('members-only profiles require a signed-in viewer', async () => {
  const service = usersService(profile('MEMBERS'));

  await assert.rejects(service.findPublicProfile('owner', null), (e) => e.getStatus() === 401);
  assert.equal((await service.findPublicProfile('owner', 'member')).isOwner, false);
});

test('public profiles never expose the email unless the owner opted in', async () => {
  const hidden = await usersService(profile('PUBLIC')).findPublicProfile('owner', null);
  const shown = await usersService(profile('PUBLIC', { showEmail: true })).findPublicProfile(
    'owner',
    null,
  );

  assert.equal(hidden.email, null);
  assert.equal(shown.email, 'owner@example.invalid');
  assert.equal('showEmail' in shown, false);
});

test('profile updates reject malformed academic links', async () => {
  let updated = false;
  const service = new UsersService({
    user: {
      update: async () => {
        updated = true;
      },
    },
  });

  await assert.rejects(
    service.updateProfile('owner', { links: { orcid: 'not-an-orcid' } }),
    (e) => e.getStatus() === 400,
  );
  assert.equal(updated, false);
});

function authWithToken(record) {
  const created = [];
  const service = new AuthService(
    {
      refreshToken: {
        deleteMany: async () => ({ count: 0 }),
        findUnique: async () => record,
        updateMany: async () => {
          const wasActive = !record.revoked;
          record.revoked = true;
          return { count: wasActive ? 1 : 0 };
        },
        create: async ({ data }) => created.push(data),
      },
    },
    { signAsync: async () => `token-${created.length}-${Math.random()}` },
    { get: () => undefined },
  );
  return { service, created };
}

const tokenRecord = () => ({
  id: 'token-row',
  sessionId: 'session-1',
  revoked: false,
  expiresAt: new Date(Date.now() + 60_000),
  user: {
    id: 'owner',
    email: 'owner@example.invalid',
    role: 'STUDENT',
    faculty: 'FIT',
    passwordHash: 'hash',
    googleId: null,
  },
});

test('refreshing keeps the session and records the device', async () => {
  const { service, created } = authWithToken(tokenRecord());

  await service.refreshToken('refresh', { userAgent: 'Agent/2', ipAddress: '203.0.113.7' });

  assert.equal(created.length, 1);
  assert.equal(created[0].sessionId, 'session-1');
  assert.equal(created[0].userAgent, 'Agent/2');
  assert.equal(created[0].ipAddress, '203.0.113.7');
});

test('a refresh token cannot be used twice', async () => {
  const { service, created } = authWithToken(tokenRecord());

  await service.refreshToken('refresh');
  await assert.rejects(service.refreshToken('refresh'), (e) => e.getStatus() === 401);
  assert.equal(created.length, 1);
});

function directoryService() {
  const calls = [];
  const service = new UsersService({
    $transaction: async (queries) => Promise.all(queries),
    user: {
      count: async (args) => {
        calls.push(args.where);
        return 0;
      },
      findMany: async () => [],
    },
  });
  return { service, calls };
}

test('the directory shows guests only public profiles', async () => {
  const { service, calls } = directoryService();

  await service.findAll(null, { page: 1, pageSize: 12 });

  assert.deepEqual(calls[0].AND[0], { visibility: 'PUBLIC' });
});

test('the directory never lists private profiles of other members', async () => {
  const { service, calls } = directoryService();

  await service.findAll('member', { page: 1, pageSize: 12, openTo: 'COIL_PROJECT' });

  assert.deepEqual(calls[0].AND[0], {
    OR: [{ visibility: { in: ['PUBLIC', 'MEMBERS'] } }, { id: 'member' }],
  });
  assert.deepEqual(calls[0].AND[1], { openTo: { has: 'COIL_PROJECT' } });
});

test('erasing other sessions keeps only the current device', async () => {
  let where;
  const service = new AuthService(
    {
      refreshToken: {
        deleteMany: async (args) => {
          where = args.where;
          return { count: 3 };
        },
      },
    },
    {},
    { get: () => undefined },
  );

  const result = await service.eraseOtherSessions('owner', 'session-1');

  assert.deepEqual(where, { userId: 'owner', sessionId: { not: 'session-1' } });
  assert.equal(result.removed, 3);
});

import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Reflector } from '@nestjs/core';
import { GUARDS_METADATA } from '@nestjs/common/constants.js';
import argon2 from 'argon2';
import { hasCode, hasStatus } from './support.ts';
import { StaffGuard } from '../dist/common/guards/staff.guard.js';
import { ProjectsController } from '../dist/projects/projects.controller.js';
import { ResearchController } from '../dist/research/research.controller.js';
import { EventsController } from '../dist/events/events.controller.js';
import { ContentService } from '../dist/content/content.service.js';
import { RecordEditorService } from '../dist/content/record-editor.service.js';
import { AuthService } from '../dist/auth/auth.service.js';
import { UsersService } from '../dist/users/users.service.js';

interface ConsumedKey {
  key: string;
  limit: number;
}

const staff = {
  id: 'staff-1',
  staffRole: 'ADMIN',
  twoFactorEnabled: true,
  mfaVerifiedAt: new Date(),
  elevatedUntil: null,
};

const handlerContext = (controller: object, handler: unknown, user: object) => ({
  switchToHttp: () => ({ getRequest: () => ({ user }) }),
  getHandler: () => handler,
  getClass: () => controller,
});

const catalogEndpoints = [
  { name: 'projects', controller: ProjectsController, permission: 'CONTENT_EDIT' },
  { name: 'research', controller: ResearchController, permission: 'CONTENT_EDIT' },
  { name: 'events', controller: EventsController, permission: 'EVENTS_MANAGE' },
];

for (const { name, controller, permission } of catalogEndpoints) {
  test(`POST /${name} is limited to staff with ${permission}`, () => {
    const handler = controller.prototype.create;
    const guards: unknown[] = Reflect.getMetadata(GUARDS_METADATA, handler) ?? [];
    assert.ok(guards.includes(StaffGuard));

    const guard = new StaffGuard(new Reflector());
    const canActivate = (user: object) =>
      guard.canActivate(handlerContext(controller, handler, user) as never);

    assert.throws(
      () => canActivate({ ...staff, staffRole: 'NONE', permissions: [] }),
      hasCode(403, 'ADMIN_ACCESS_REQUIRED'),
    );
    assert.throws(
      () => canActivate({ ...staff, permissions: ['DASHBOARD_VIEW'] }),
      hasCode(403, 'PERMISSION_DENIED'),
    );
    assert.equal(canActivate({ ...staff, permissions: [permission] }), true);
  });
}

function contentService(consumed: ConsumedKey[], fail = false) {
  let upstreamCalls = 0;
  const contentful = {
    config: { locales: { en: 'en', uk: 'uk' } },
    request: async () => {
      upstreamCalls++;
      return { total: 0, items: [] };
    },
  };
  const prisma = { contentCacheState: { findUnique: async () => ({ revision: 1 }) } };
  const rateLimit = {
    consume: async (key: string, { limit }: { limit: number }) => {
      consumed.push({ key, limit });
      if (fail) throw Object.assign(new Error('limited'), { status: 429 });
    },
  };
  const service = new ContentService(contentful, prisma, rateLimit);
  return { service, upstream: () => upstreamCalls };
}

test('uncached content requests are rate limited per IP, cached ones are not', async () => {
  const consumed: ConsumedKey[] = [];
  const { service, upstream } = contentService(consumed);
  const client = { ipAddress: '203.0.113.9' };

  await service.getEntries(['homePage'], client);
  await service.getEntries(['homePage'], client);
  await service.getEntries(['partner'], client);

  assert.deepEqual(
    consumed.map(({ key }) => key),
    ['content:miss:ip:203.0.113.9', 'content:miss:ip:203.0.113.9'],
  );
  assert.equal(upstream(), 2);
});

test('a rate-limited content miss never reaches Contentful', async () => {
  const { service, upstream } = contentService([], true);

  await assert.rejects(service.getEntries(['randomType'], { ipAddress: '203.0.113.9' }));
  assert.equal(upstream(), 0);
});

const projectRecord = (url: string) => ({
  status: 'IN_PROGRESS',
  faculties: ['FIT'],
  tags: [],
  repositoryUrl: url,
  demoUrl: null,
  translations: {
    en: { title: 'Project', description: 'Description' },
    uk: { title: 'Проєкт', description: 'Опис' },
  },
});

test('record links only accept http and https URLs', async () => {
  const editor = new RecordEditorService({}, {}, {}, {}, {});
  const actor = { ...staff, permissions: ['CONTENT_EDIT'] };

  for (const url of ['javascript:alert(1)', 'JavaScript:alert(1)', 'data:text/html,x']) {
    await assert.rejects(
      editor.createRecord(actor, 'project', { data: projectRecord(url) }, {}),
      (error: unknown) =>
        hasStatus(400)(error) && (error as Error).message.startsWith('repositoryUrl'),
    );
  }
});

test('login failures look the same for unknown, Google-only and wrong-password accounts', async () => {
  const passwordHash = await argon2.hash('CorrectHorse1!');
  const accounts: Record<string, object | null> = {
    'missing@example.invalid': null,
    'google@example.invalid': { id: 'g', passwordHash: null, isBlocked: false },
    'user@example.invalid': { id: 'u', passwordHash, isBlocked: false },
  };
  const service = new AuthService(
    {
      user: {
        findUnique: async ({ where }: { where: { email: string } }) => accounts[where.email],
      },
    },
    {},
    { get: () => undefined },
  );

  const messages = new Set<string>();
  for (const email of Object.keys(accounts)) {
    await assert.rejects(service.login({ email, password: 'WrongHorse1!' }), (error: unknown) => {
      assert.ok(hasStatus(401)(error));
      messages.add((error as Error).message);
      return true;
    });
  }
  assert.deepEqual([...messages], ['Invalid email or password']);
});

const limitedRateLimit = (consumed: ConsumedKey[]) => ({
  consume: async (key: string, { limit }: { limit: number }) => {
    consumed.push({ key, limit });
    if (consumed.length > limit) throw Object.assign(new Error('limited'), { status: 429 });
  },
  reset: async () => undefined,
});

test('changing the password rate limits current-password guesses', async () => {
  const passwordHash = await argon2.hash('CorrectHorse1!');
  const consumed: ConsumedKey[] = [];
  const service = new AuthService(
    { user: { findUnique: async () => ({ id: 'u', passwordHash }) } },
    {},
    { get: () => undefined },
    {},
    undefined,
    limitedRateLimit(consumed),
  );

  await assert.rejects(
    service.changePassword('u', { currentPassword: 'Wrong1!', newPassword: 'NewHorse12!' }),
    hasStatus(403),
  );
  assert.equal(consumed[0].key, 'password:check:u');
});

test('deleting the account rate limits password guesses', async () => {
  const passwordHash = await argon2.hash('CorrectHorse1!');
  const consumed: ConsumedKey[] = [];
  let deleted = false;
  const service = new UsersService(
    {
      user: {
        findUnique: async () => ({ id: 'u', email: 'user@example.invalid', passwordHash }),
        delete: async () => {
          deleted = true;
        },
      },
    },
    limitedRateLimit(consumed),
  );

  const attempt = () =>
    service.deleteAccount('u', { confirmation: 'user@example.invalid', password: 'Wrong1!' });
  await assert.rejects(attempt(), hasStatus(403));
  const limit = consumed[0].limit;
  for (let index = 1; index < limit; index++) {
    await assert.rejects(attempt(), hasStatus(403));
  }
  await assert.rejects(attempt(), (error: unknown) => !hasStatus(403)(error));
  assert.equal(consumed[0].key, 'password:check:u');
  assert.equal(deleted, false);
});

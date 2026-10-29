import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PresenceService } from '../dist/content/presence.service.js';

interface PresenceRow {
  userId: string;
  resourceKey: string;
  updatedAt: Date;
}

interface PresenceWhere {
  userId?: string | { not: string };
  resourceKey?: { in?: string[]; notIn?: string[] };
  updatedAt?: { gte: Date };
}

const NAMES: Record<string, string> = { 'editor-1': 'Olena', 'editor-2': 'Taras' };

const matches = (row: PresenceRow, where: PresenceWhere) => {
  if (typeof where.userId === 'string' && row.userId !== where.userId) return false;
  if (typeof where.userId === 'object' && row.userId === where.userId.not) return false;
  if (where.resourceKey?.in && !where.resourceKey.in.includes(row.resourceKey)) return false;
  if (where.resourceKey?.notIn?.includes(row.resourceKey)) return false;
  if (where.updatedAt && row.updatedAt < where.updatedAt.gte) return false;
  return true;
};

const setup = (initial: PresenceRow[]) => {
  let rows = [...initial];
  const editorPresence = {
    deleteMany: async ({ where }: { where: PresenceWhere }) => {
      rows = rows.filter((row) => !matches(row, where));
    },
    upsert: async ({ create }: { create: { userId: string; resourceKey: string } }) => {
      rows = rows.filter(
        (row) => row.userId !== create.userId || row.resourceKey !== create.resourceKey,
      );
      rows.push({ ...create, updatedAt: new Date() });
    },
    findMany: async ({ where }: { where: PresenceWhere }) =>
      rows
        .filter((row) => matches(row, where))
        .map((row) => ({
          resourceKey: row.resourceKey,
          userId: row.userId,
          user: { name: NAMES[row.userId] ?? '' },
        })),
  };
  const prisma = {
    editorPresence,
    $transaction: async (operations: Promise<unknown>[]) => Promise.all(operations),
  };
  return { service: new PresenceService(prisma), rows: () => rows };
};

test('presence lists other editors active on the same item, never the caller', async () => {
  const { service } = setup([
    { userId: 'editor-2', resourceKey: 'entry:hero', updatedAt: new Date() },
    { userId: 'editor-2', resourceKey: 'entry:footer', updatedAt: new Date() },
  ]);
  const others = await service.heartbeat('editor-1', { resourceKeys: ['entry:hero'] });
  assert.deepEqual(others, [{ resourceKey: 'entry:hero', userId: 'editor-2', name: 'Taras' }]);
});

test('editors who stopped sending heartbeats are not shown', async () => {
  const { service } = setup([
    { userId: 'editor-2', resourceKey: 'entry:hero', updatedAt: new Date(Date.now() - 120_000) },
  ]);
  const others = await service.heartbeat('editor-1', { resourceKeys: ['entry:hero'] });
  assert.deepEqual(others, []);
});

test('closing an item removes the caller from it', async () => {
  const { service, rows } = setup([
    { userId: 'editor-1', resourceKey: 'entry:hero', updatedAt: new Date() },
  ]);
  const others = await service.heartbeat('editor-1', { resourceKeys: [] });
  assert.deepEqual(others, []);
  assert.deepEqual(rows(), []);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ContentEditorService } from '../dist/content/content-editor.service.js';

interface Call {
  path: string;
  method: string;
  version?: number;
}

interface ChangeRow {
  id: string;
  resourceType: string;
  resourceId: string;
  contentTypeId: string | null;
  label: string | null;
  isNew: boolean;
  isDeleted: boolean;
  fieldIds: string[];
  createdAt: Date;
}

interface RequestOptions {
  method?: string;
  version?: number;
}

const actor = { id: 'editor-1' };
const client = { ip: '127.0.0.1', userAgent: 'test' };

const setup = (publishedVersion: number | null) => {
  const calls: Call[] = [];
  const rows: ChangeRow[] = [];
  let version = 5;
  const entry = () => ({
    sys: {
      id: 'milestone-1',
      version,
      publishedVersion: publishedVersion ?? undefined,
      updatedAt: '2026-10-28T10:00:00.000Z',
      contentType: { sys: { id: 'milestone' } },
    },
    fields: {},
  });
  const contentful = {
    config: { locales: { en: 'en-US', uk: 'uk' } },
    toHttpError: (error: unknown) => error,
    request: async (_api: string, path: string, options: RequestOptions = {}) => {
      const method = options.method ?? 'GET';
      calls.push({ path, method, version: options.version });
      if (method === 'DELETE' && path.endsWith('/published')) {
        publishedVersion = null;
        version += 1;
      }
      return entry();
    },
  };
  const prisma = {
    contentChange: {
      upsert: async (args: {
        create: Omit<ChangeRow, 'id' | 'isNew' | 'fieldIds' | 'createdAt'>;
      }) => {
        rows.push({
          id: 'change-1',
          isNew: false,
          fieldIds: [],
          createdAt: new Date(),
          ...args.create,
        });
      },
      deleteMany: async () => {
        rows.length = 0;
      },
      findMany: async () => rows,
      delete: async ({ where }: { where: { id: string } }) => {
        const index = rows.findIndex((row) => row.id === where.id);
        if (index >= 0) rows.splice(index, 1);
      },
    },
  };
  const audit = { record: async () => undefined };
  const content = { invalidate: async () => undefined };
  const records = { applyChange: async () => undefined };
  const service = new ContentEditorService(contentful, content, prisma, audit, records);
  return { service, calls, rows };
};

test('deleting an entry that was never published removes it from Contentful at once', async () => {
  const { service, calls, rows } = setup(null);
  await service.deleteEntry(actor, 'milestone-1', 'Milestone: 2024', client);
  assert.deepEqual(
    calls.map((call) => `${call.method} ${call.path}`),
    ['GET /entries/milestone-1', 'DELETE /entries/milestone-1'],
  );
  assert.equal(rows.length, 0);
});

test('deleting a published entry only marks it as a deletion draft', async () => {
  const { service, calls, rows } = setup(4);
  await service.deleteEntry(actor, 'milestone-1', 'Milestone: 2024', client);
  assert.deepEqual(
    calls.map((call) => call.method),
    ['GET'],
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0]?.isDeleted, true);
  assert.equal(rows[0]?.contentTypeId, 'milestone');
});

test('publishing a deletion unpublishes and archives the entry', async () => {
  const { service, calls, rows } = setup(4);
  await service.deleteEntry(actor, 'milestone-1', 'Milestone: 2024', client);
  calls.length = 0;
  const result = await service.publish(actor, {}, client);
  assert.deepEqual(result, { published: ['change-1'], failed: [] });
  assert.deepEqual(
    calls.map((call) => `${call.method} ${call.path} v${call.version ?? ''}`),
    [
      'GET /entries/milestone-1 v',
      'DELETE /entries/milestone-1/published v5',
      'PUT /entries/milestone-1/archived v6',
    ],
  );
  assert.equal(rows.length, 0);
});

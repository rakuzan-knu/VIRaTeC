import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hasStatus } from './support.ts';
import { ContentEditorService } from '../dist/content/content-editor.service.js';
import { RevisionsService } from '../dist/content/revisions.service.js';

interface RevisionRow {
  id: string;
  resourceType: string;
  resourceId: string;
  label: string | null;
  data: Record<string, unknown>;
  actorId: string;
  createdAt: Date;
}

interface ChangeRow {
  id: string;
  resourceType: string;
  resourceId: string;
  contentTypeId: string | null;
  label: string | null;
  isNew: boolean;
  isDeleted: boolean;
  createdAt: Date;
}

const actor = { id: 'editor-1' };
const client = { ip: '127.0.0.1', userAgent: 'test' };
const projectData = { status: 'IDEA', translations: { en: { title: 'Campus' } } };

const setup = () => {
  const revisions: RevisionRow[] = [];
  const changes: ChangeRow[] = [
    {
      id: 'change-1',
      resourceType: 'PROJECT',
      resourceId: 'project-1',
      contentTypeId: 'project',
      label: 'Project: Campus',
      isNew: false,
      isDeleted: false,
      createdAt: new Date(),
    },
  ];
  const saved: unknown[] = [];
  const prisma = {
    contentRevision: {
      create: async ({ data }: { data: Omit<RevisionRow, 'id' | 'createdAt'> }) => {
        revisions.push({ ...data, id: `revision-${revisions.length + 1}`, createdAt: new Date() });
      },
      findFirst: async ({
        where,
      }: {
        where: { id: string; resourceType: string; resourceId: string };
      }) =>
        revisions.find(
          (row) =>
            row.id === where.id &&
            row.resourceType === where.resourceType &&
            row.resourceId === where.resourceId,
        ) ?? null,
    },
    contentChange: {
      findMany: async () => changes,
      delete: async () => undefined,
    },
  };
  const contentful = {
    config: { locales: { en: 'en-US', uk: 'uk' } },
    toHttpError: (error: unknown) => error,
    request: async () => ({}),
  };
  const records = {
    applyChange: async () => undefined,
    getRecord: async () => ({ published: projectData, updatedAt: '2026-10-29T10:00:00.000Z' }),
    saveRecord: async (...args: unknown[]) => void saved.push(args),
  };
  const revisionService = new RevisionsService(prisma, contentful);
  const editor = new ContentEditorService(
    contentful,
    { invalidate: async () => undefined },
    prisma,
    { record: async () => undefined },
    records,
    revisionService,
  );
  return { editor, revisions, saved };
};

test('publishing a record stores the published data as a version', async () => {
  const { editor, revisions } = setup();
  const result = await editor.publish(actor, {}, client);
  assert.deepEqual(result.published, ['change-1']);
  assert.equal(revisions.length, 1);
  assert.equal(revisions[0]?.resourceId, 'project-1');
  assert.deepEqual(revisions[0]?.data, projectData);
  assert.equal(revisions[0]?.actorId, 'editor-1');
});

test('restoring a version saves it as a draft, not as published content', async () => {
  const { editor, saved } = setup();
  await editor.publish(actor, {}, client);
  await editor.restoreRevision(
    actor,
    { resourceType: 'PROJECT', resourceId: 'project-1', revisionId: 'revision-1', label: 'Back' },
    client,
  );
  const [call] = saved as [unknown, string, string, { data: unknown; label: string }][];
  assert.equal(call?.[1], 'project');
  assert.equal(call?.[2], 'project-1');
  assert.deepEqual(call?.[3].data, projectData);
});

test('a version of another record cannot be restored', async () => {
  const { editor } = setup();
  await editor.publish(actor, {}, client);
  await assert.rejects(
    editor.restoreRevision(
      actor,
      { resourceType: 'PROJECT', resourceId: 'project-2', revisionId: 'revision-1' },
      client,
    ),
    hasStatus(404),
  );
});

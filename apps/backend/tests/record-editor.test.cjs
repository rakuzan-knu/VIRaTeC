const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
  RecordEditorService,
  RecordPublishError,
} = require('../dist/content/record-editor.service.js');

const PROJECT_ID = '0b6f8a52-8d5c-4d1f-9b8e-2f3a4c5d6e7f';
const UPDATED_AT = new Date('2026-10-20T10:00:00.000Z');

const projectRow = (overrides = {}) => ({
  id: PROJECT_ID,
  title: 'Old title',
  description: 'Old description',
  status: 'IDEA',
  faculties: ['FIT'],
  tags: ['ai'],
  repositoryUrl: null,
  demoUrl: null,
  translations: {
    en: { title: 'Old title', description: 'Old description' },
    uk: { title: 'Стара назва', description: 'Старий опис' },
  },
  updatedAt: UPDATED_AT,
  ...overrides,
});

const projectData = (overrides = {}) => ({
  status: 'IN_PROGRESS',
  faculties: ['FIT'],
  tags: ['ai'],
  repositoryUrl: null,
  demoUrl: null,
  translations: {
    en: { title: 'New title', description: 'New description' },
    uk: { title: 'Нова назва', description: 'Новий опис' },
  },
  ...overrides,
});

const editor = { id: 'editor', permissions: ['CONTENT_VIEW', 'CONTENT_EDIT'] };
const viewer = { id: 'viewer', permissions: ['CONTENT_VIEW'] };
const eventsModerator = { id: 'moderator', permissions: ['CONTENT_VIEW', 'EVENTS_MANAGE'] };

const setup = ({ project = projectRow(), change = null } = {}) => {
  const calls = { upserts: [], deletes: [], updates: [], cleared: 0 };
  const prisma = {
    contentChange: {
      findUnique: async () => change,
      upsert: async (args) => calls.upserts.push(args),
      delete: async (args) => calls.deletes.push(args),
      create: async () => undefined,
    },
    project: {
      findUnique: async () => project,
      update: async (args) => calls.updates.push(args),
      create: async () => undefined,
      delete: async () => undefined,
    },
    event: { findUnique: async () => null },
    publication: { findUnique: async () => null },
  };
  prisma.$transaction = async (run) => run(prisma);
  const cache = { clearCache: () => (calls.cleared += 1) };
  const service = new RecordEditorService(
    prisma,
    { record: async () => undefined },
    cache,
    cache,
    cache,
  );
  return { service, calls };
};

test('saving a record draft needs the edit permission', async () => {
  const { service, calls } = setup();

  await assert.rejects(
    service.saveRecord(
      viewer,
      'project',
      PROJECT_ID,
      {
        data: projectData(),
        baseUpdatedAt: UPDATED_AT.toISOString(),
      },
      {},
    ),
    (e) => e.getStatus() === 403,
  );
  assert.equal(calls.upserts.length, 0);
});

test('events managers can draft events but not projects', async () => {
  const { service } = setup();

  await assert.rejects(
    service.saveRecord(
      eventsModerator,
      'project',
      PROJECT_ID,
      {
        data: projectData(),
        baseUpdatedAt: UPDATED_AT.toISOString(),
      },
      {},
    ),
    (e) => e.getStatus() === 403,
  );
  await assert.rejects(
    service.saveRecord(eventsModerator, 'event', PROJECT_ID, { data: {}, baseUpdatedAt: null }, {}),
    (e) => e.getStatus() === 400,
  );
});

test('a draft based on an outdated record is rejected as a conflict', async () => {
  const { service, calls } = setup();

  await assert.rejects(
    service.saveRecord(
      editor,
      'project',
      PROJECT_ID,
      {
        data: projectData(),
        baseUpdatedAt: '2026-10-01T00:00:00.000Z',
      },
      {},
    ),
    (e) => e.getStatus() === 409,
  );
  assert.equal(calls.upserts.length, 0);
});

test('a draft stores only the changed paths', async () => {
  const { service, calls } = setup();

  await service.saveRecord(
    editor,
    'project',
    PROJECT_ID,
    {
      data: projectData({ status: 'IDEA' }),
      baseUpdatedAt: UPDATED_AT.toISOString(),
    },
    {},
  );

  assert.deepEqual(calls.upserts[0].create.fieldIds.sort(), [
    'translations.en.description',
    'translations.en.title',
    'translations.uk.description',
    'translations.uk.title',
  ]);
});

test('invalid record data never reaches the database', async () => {
  const { service, calls } = setup();

  await assert.rejects(
    service.saveRecord(
      editor,
      'project',
      PROJECT_ID,
      {
        data: projectData({ repositoryUrl: 'not a url' }),
        baseUpdatedAt: UPDATED_AT.toISOString(),
      },
      {},
    ),
    (e) => e.getStatus() === 400,
  );
  assert.equal(calls.upserts.length, 0);
});

const draftChange = (overrides = {}) => ({
  id: 'change',
  resourceType: 'PROJECT',
  resourceId: PROJECT_ID,
  isNew: false,
  isDeleted: false,
  draft: projectData(),
  baseUpdatedAt: UPDATED_AT,
  ...overrides,
});

test('publishing a draft writes the English text to the base columns', async () => {
  const { service, calls } = setup();

  await service.applyChange(draftChange());

  assert.equal(calls.updates[0].data.title, 'New title');
  assert.equal(calls.updates[0].data.description, 'New description');
  assert.equal(calls.updates[0].data.status, 'IN_PROGRESS');
  assert.equal(calls.deletes.length, 1);
  assert.equal(calls.cleared, 1);
});

test('publishing refuses a draft when the record changed after it was saved', async () => {
  const { service, calls } = setup({
    project: projectRow({ updatedAt: new Date('2026-10-25T00:00:00.000Z') }),
  });

  await assert.rejects(service.applyChange(draftChange()), RecordPublishError);
  assert.equal(calls.updates.length, 0);
  assert.equal(calls.deletes.length, 0);
});

test('publishing refuses drafts with empty required fields', async () => {
  const { service, calls } = setup();
  const data = projectData();
  data.translations.uk.title = '  ';

  await assert.rejects(
    service.applyChange(draftChange({ draft: data })),
    (e) => e instanceof RecordPublishError && e.message.includes('translations.uk.title'),
  );
  assert.equal(calls.updates.length, 0);
});

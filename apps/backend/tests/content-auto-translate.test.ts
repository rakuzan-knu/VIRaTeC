import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AutoTranslateService } from '../dist/content/auto-translate.service.js';

interface MemoryRow {
  resourceKey: string;
  locale: string;
  path: string;
  sourceHash: string;
  valueHash: string;
  value?: unknown;
}

interface UpsertArgs {
  where: { resourceKey_locale_path: { resourceKey: string; locale: string; path: string } };
  create: MemoryRow;
  update: { sourceHash: string; valueHash: string; value: unknown };
}

interface TranslateArgs {
  to: string;
  texts: string[];
}

const setup = (options: { configured?: boolean; failFor?: string } = {}) => {
  const rows: MemoryRow[] = [];
  const requests: TranslateArgs[] = [];
  const prisma = {
    contentTranslation: {
      findMany: async ({ where }: { where: { resourceKey: string } }) =>
        rows.filter((row) => row.resourceKey === where.resourceKey),
      upsert: (args: UpsertArgs) => {
        const key = args.where.resourceKey_locale_path;
        const index = rows.findIndex(
          (row) =>
            row.resourceKey === key.resourceKey &&
            row.locale === key.locale &&
            row.path === key.path,
        );
        if (index >= 0) rows[index] = { ...rows[index], ...args.update };
        else rows.push(args.create);
        return Promise.resolve();
      },
    },
    $transaction: async (operations: Promise<void>[]) => Promise.all(operations),
  };
  const translation = {
    isConfigured: () => options.configured ?? true,
    translateForPublish: async (_actorId: string, dto: TranslateArgs) => {
      requests.push(dto);
      if (dto.to === options.failFor) throw new Error('unavailable');
      return { translations: dto.texts.map((text) => `${dto.to}:${text}`) };
    },
  };
  return { service: new AutoTranslateService(prisma, translation), rows, requests };
};

const projectData = (extra: Record<string, unknown> = {}) => ({
  status: 'IN_PROGRESS',
  faculties: [],
  tags: [],
  repositoryUrl: null,
  demoUrl: null,
  coverUrl: null,
  coverFocus: null,
  translations: {
    en: { title: 'Robots', description: 'Students build robots' },
    ...extra,
  },
});

test('publishing fills every missing language from English', async () => {
  const { service } = setup();
  const result = await service.translateRecord('project', 'p1', projectData(), 'editor-1');
  const translations = (result.value as ReturnType<typeof projectData>).translations as Record<
    string,
    { title: string; description: string }
  >;
  assert.equal(result.changed, true);
  assert.equal(result.failed, false);
  assert.deepEqual(translations.de, {
    title: 'de:Robots',
    description: 'de:Students build robots',
  });
  assert.equal(translations.uk?.title, 'uk:Robots');
  assert.equal(translations.ar?.title, 'ar:Robots');
});

test('a manual edit of a translation is never overwritten', async () => {
  const { service } = setup();
  const first = await service.translateRecord('project', 'p1', projectData(), 'editor-1');
  const edited = structuredClone(first.value) as ReturnType<typeof projectData>;
  const translations = edited.translations as Record<
    string,
    { title: string; description: string }
  >;
  translations.de = { ...translations.de, title: 'Roboter (manuell)' };
  translations.en = { title: 'Robots 2', description: 'Students build robots' };

  const second = await service.translateRecord('project', 'p1', edited, 'editor-1');
  const next = (second.value as ReturnType<typeof projectData>).translations as Record<
    string,
    { title: string }
  >;
  assert.equal(next.de?.title, 'Roboter (manuell)');
  assert.equal(next.fr?.title, 'fr:Robots 2');
});

test('unchanged English text is not translated again', async () => {
  const { service, requests } = setup();
  const first = await service.translateRecord('project', 'p1', projectData(), 'editor-1');
  requests.length = 0;
  const second = await service.translateRecord('project', 'p1', first.value, 'editor-1');
  assert.equal(second.changed, false);
  assert.equal(requests.length, 0);
});

test('a failed language is left out and reported, the others are kept', async () => {
  const { service } = setup({ failFor: 'fr' });
  const result = await service.translateRecord('project', 'p1', projectData(), 'editor-1');
  const translations = (result.value as ReturnType<typeof projectData>).translations as Record<
    string,
    unknown
  >;
  assert.equal(result.failed, true);
  assert.equal(translations.fr, undefined);
  assert.ok(translations.de);
});

test('without an API key nothing is translated and publishing is not blocked', async () => {
  const { service, requests } = setup({ configured: false });
  const data = projectData();
  const result = await service.translateRecord('project', 'p1', data, 'editor-1');
  assert.equal(result.changed, false);
  assert.equal(result.failed, true);
  assert.equal(result.value, data);
  assert.equal(requests.length, 0);
});

test('entries translate every language; locales absent from the space are kept for the DB', async () => {
  const { service, rows, requests } = setup();
  const codes = { en: 'en-US', uk: 'uk', de: 'de', fr: 'fr', ar: 'ar' };
  const result = await service.translateEntry(
    'entry-1',
    { fields: [{ id: 'title', type: 'Symbol', localized: true }] },
    { items: [{ code: 'en-US' }, { code: 'uk' }, { code: 'de' }] },
    codes,
    { title: { 'en-US': 'Hello', uk: 'Привіт' } },
    'editor-1',
  );
  assert.deepEqual(result.value, { title: { 'en-US': 'Hello', uk: 'Привіт', de: 'de:Hello' } });
  assert.deepEqual(requests.map((request) => request.to).sort(), ['ar', 'de', 'fr']);
  assert.equal(rows.find((row) => row.locale === 'fr' && row.path === 'title')?.value, 'fr:Hello');
  assert.equal(rows.find((row) => row.locale === 'ar' && row.path === 'title')?.value, 'ar:Hello');
});

test('a stored DB translation is reused and not translated again when the source is unchanged', async () => {
  const { service, requests } = setup();
  const codes = { en: 'en-US', uk: 'uk', de: 'de', fr: 'fr', ar: 'ar' };
  const type = { fields: [{ id: 'title', type: 'Symbol', localized: true }] };
  const space = { items: [{ code: 'en-US' }, { code: 'uk' }] };
  const fields = { title: { 'en-US': 'Hello', uk: 'Привіт' } };
  await service.translateEntry('entry-1', type, space, codes, fields, 'editor-1');
  requests.length = 0;
  const again = await service.translateEntry('entry-1', type, space, codes, fields, 'editor-1');
  assert.equal(again.changed, false);
  assert.equal(requests.length, 0);
});

test('texts inside JSON fields such as page sections are translated in place', async () => {
  const { service } = setup();
  const codes = { en: 'en-US', uk: 'uk', de: 'de', fr: 'fr', ar: 'ar' };
  const sections = [{ type: 'cta', title: { en: 'Join us', uk: 'Долучайтеся' }, link: 'CONTACT' }];
  const result = await service.translateEntry(
    'layout-1',
    { fields: [{ id: 'sections', type: 'Object', localized: false }] },
    { items: [{ code: 'en-US' }] },
    codes,
    { sections: { 'en-US': sections } },
    'editor-1',
  );
  const value = result.value as { sections: { 'en-US': typeof sections } };
  assert.deepEqual(value.sections['en-US'][0]?.title, {
    en: 'Join us',
    uk: 'Долучайтеся',
    de: 'de:Join us',
    fr: 'fr:Join us',
    ar: 'ar:Join us',
  });
  assert.equal(value.sections['en-US'][0]?.link, 'CONTACT');
  assert.deepEqual(sections[0]?.title, { en: 'Join us', uk: 'Долучайтеся' });
});

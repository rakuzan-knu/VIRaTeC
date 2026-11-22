import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ContentService } from '../dist/content/content.service.js';

const locales = { en: 'en', uk: 'uk', de: 'de', fr: 'fr', ar: 'ar' };

const setup = (
  fields: Record<string, unknown>,
  translations: { resourceKey: string; locale: string; path: string; value: unknown }[],
) => {
  const prisma = {
    contentCacheState: { findUnique: async () => ({ revision: 1 }) },
    contentTranslation: { findMany: async () => translations },
  };
  const contentful = {
    config: { locales },
    request: async () => ({
      total: 1,
      items: [{ sys: { id: 'e1', type: 'Entry' }, fields }],
      includes: {},
    }),
  };
  return new ContentService(contentful as never, prisma as never);
};

test('getEntries injects DB translations into de/fr/ar text fields', async () => {
  const service = setup({ title: { en: 'Hello', uk: 'Привіт' } }, [
    { resourceKey: 'entry:e1', locale: 'de', path: 'title', value: 'Hallo' },
    { resourceKey: 'entry:e1', locale: 'fr', path: 'title', value: 'Bonjour' },
  ]);
  const result = await service.getEntries(['homePage']);
  const title = result.items[0]?.fields?.title as Record<string, unknown>;
  assert.equal(title.en, 'Hello');
  assert.equal(title.uk, 'Привіт');
  assert.equal(title.de, 'Hallo');
  assert.equal(title.fr, 'Bonjour');
  assert.equal(title.ar, undefined);
});

test('a locale already present from Contentful is never overridden by the DB', async () => {
  const service = setup({ title: { en: 'Hello', uk: 'Привіт' } }, [
    { resourceKey: 'entry:e1', locale: 'uk', path: 'title', value: 'wrong' },
  ]);
  const result = await service.getEntries(['homePage']);
  const title = result.items[0]?.fields?.title as Record<string, unknown>;
  assert.equal(title.uk, 'Привіт');
});

test('JSON-path translations are not injected as top-level fields', async () => {
  const service = setup({ title: { en: 'Hello' } }, [
    { resourceKey: 'entry:e1', locale: 'de', path: 'sections#0.title', value: 'skip' },
  ]);
  const result = await service.getEntries(['homePage']);
  assert.equal(result.items[0]?.fields?.sections, undefined);
});

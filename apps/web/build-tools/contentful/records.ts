import type { PublicationDto } from '@viratec/contracts';
import { buildPublicationPath } from '../../src/shared/config/routes.ts';
import { LOCALES, type Locale } from '../../src/shared/i18n/model/types.ts';
import type { EntryCollection } from './entry-reader.ts';
import type { GeneratedModule } from './domain.ts';

const HOME_TYPE_ID = 'homePage';
const HOME_SLUGS_FIELD = 'publicationsSlugs';
const HOME_PUBLICATION_COUNT = 3;
const PUBLICATIONS_ENDPOINT = '/api/v1/publications';
const API_TIMEOUT_MS = 15_000;

export const HOME_PUBLICATIONS_FILE = 'src/pages/home/model/publications.generated.ts';

export interface PublicationCardSource {
  slug: string;
  year: number;
  title: string;
  source: string;
}

export const pickHomePublications = <T extends { slug: string }>(
  publications: readonly T[],
  slugs: readonly string[],
): T[] =>
  slugs.length > 0
    ? slugs.flatMap((slug) => publications.find((item) => item.slug === slug) ?? [])
    : publications.slice(0, HOME_PUBLICATION_COUNT);

export const toPublicationCard = (publication: PublicationCardSource) => ({
  year: String(publication.year),
  title: publication.title,
  source: publication.source,
  to: buildPublicationPath(publication.slug),
});

const readHomeSlugs = (collection: EntryCollection, defaultLocale: string) => {
  const [entry] = collection.byType.get(HOME_TYPE_ID) ?? [];
  const value = entry?.fields[HOME_SLUGS_FIELD]?.[defaultLocale];
  return Array.isArray(value)
    ? value.filter((slug): slug is string => typeof slug === 'string' && slug.trim() !== '')
    : [];
};

const fetchPublications = async (apiOrigin: string): Promise<PublicationDto[]> => {
  const response = await fetch(new URL(PUBLICATIONS_ENDPOINT, apiOrigin), {
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const body = (await response.json()) as { data?: PublicationDto[] };
  if (!Array.isArray(body.data)) throw new Error('unexpected response shape');
  return body.data;
};

export const pullHomePublications = async (
  collection: EntryCollection,
  defaultLocale: string,
  apiOrigin: string,
): Promise<GeneratedModule> => {
  const slugs = readHomeSlugs(collection, defaultLocale);
  const picked = pickHomePublications(await fetchPublications(apiOrigin), slugs);
  const missing = slugs.filter((slug) => !picked.some((item) => item.slug === slug));
  if (missing.length > 0) {
    throw new Error(`home page publications not found: ${missing.join(', ')}`);
  }
  const cards = (locale: Locale) =>
    picked.map((dto) =>
      toPublicationCard({ slug: dto.slug, year: dto.year, ...dto.content[locale] }),
    );
  return {
    file: HOME_PUBLICATIONS_FILE,
    typeImports: [
      { from: '@/shared/i18n/model/types', names: ['Localized'] },
      { from: './content', names: ['PublicationCard'] },
    ],
    exports: [
      {
        name: 'HOME_PUBLICATIONS',
        type: 'Localized<PublicationCard[]>',
        value: Object.fromEntries(LOCALES.map((locale) => [locale, cards(locale)])),
      },
    ],
  };
};

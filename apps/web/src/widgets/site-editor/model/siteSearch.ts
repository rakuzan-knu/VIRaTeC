import {
  LOCALE_PLACEHOLDER,
  RECORD_DEFINITIONS,
  readRecordValue,
  recordTypeId,
  type ContentLocales,
  type RecordData,
  type RecordResource,
} from '@viratec/contracts';
import { ROUTES, buildProjectPath, buildPublicationPath } from '@/shared/config/routes';
import { PAGE_LABELS, isLayoutPage } from '@/shared/config/pageLayout';
import type { Locale } from '@/shared/i18n';
import { stripFieldMarks } from '@/shared/lib';
import { findContentType } from './contentModel';
import { fieldText, recordFieldText, typeName } from './fieldText';
import type { SiteEditorMessages } from './messages';

type RouteKey = keyof typeof ROUTES;

export interface SearchItem {
  key: string;
  text: string;
  normalized: string;
  route: string;
  place: string;
  field: string;
  selection: { entryId: string; contentTypeId: string; fieldId: string; locale: Locale };
}

interface RawEntry {
  id: string;
  contentTypeId: string;
  fields: Record<string, Record<string, unknown>>;
}

export interface ContentSearchSource {
  locales: ContentLocales;
  items: unknown[];
  includes: { entries: unknown[] };
}

const PAGE_ROUTES: Record<string, RouteKey> = {
  homePage: 'HOME',
  aboutInitiativePage: 'ABOUT_INITIATIVE',
  viratecPage: 'VIRATEC',
  globalCollaborationPage: 'GLOBAL_COLLABORATION',
  opportunitiesPage: 'OPPORTUNITIES',
  researchAreasPage: 'RESEARCH_AREAS',
  studentResearchPage: 'STUDENT_RESEARCH',
  experientialLearningPage: 'EXPERIENTIAL_LEARNING',
  contactPage: 'CONTACT',
  partner: 'HOME',
  person: 'ABOUT_INITIATIVE',
  milestone: 'VIRATEC',
  galleryItem: 'VIRATEC',
  audienceGroup: 'OPPORTUNITIES',
  siteSettings: 'CONTACT',
};

const LEGAL_ROUTES: Record<string, RouteKey> = {
  terms: 'TERMS',
  privacy: 'PRIVACY',
  cookies: 'COOKIES',
  guidelines: 'GUIDELINES',
  communityGuidelines: 'GUIDELINES',
};

const MAX_PARENT_DEPTH = 3;
const TEXT_TYPES = new Set(['Symbol', 'Text']);

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const SEARCH_ROOT_TYPES = new Set([
  ...Object.keys(PAGE_ROUTES),
  'pageBlock',
  'pageLayout',
  'legalDocument',
]);

export const isSearchRootType = (contentTypeId: string) => SEARCH_ROOT_TYPES.has(contentTypeId);

const foldText = (text: string) => text.toLocaleLowerCase().replace(/[’ʼ`]/g, "'");

export const normalizeSearch = (text: string) =>
  foldText(stripFieldMarks(text)).replace(/\s+/g, ' ').trim();

const toEntry = (item: unknown): RawEntry | null => {
  if (!isObject(item) || !isObject(item.sys) || !isObject(item.fields)) return null;
  const { id, contentType } = item.sys;
  const typeId = isObject(contentType) && isObject(contentType.sys) ? contentType.sys.id : null;
  if (typeof id !== 'string' || typeof typeId !== 'string') return null;
  return {
    id,
    contentTypeId: typeId,
    fields: item.fields as Record<string, Record<string, unknown>>,
  };
};

const linkedIds = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap(linkedIds);
  if (!isObject(value)) return [];
  if (isObject(value.sys) && value.sys.type === 'Link' && typeof value.sys.id === 'string') {
    return [value.sys.id];
  }
  return Object.values(value).flatMap(linkedIds);
};

const layoutRoutes = (entries: readonly RawEntry[], locales: ContentLocales) => {
  const routes = new Map<string, RouteKey>();
  for (const entry of entries) {
    if (entry.contentTypeId !== 'pageLayout') continue;
    const page = entry.fields.page?.[locales.en];
    const sections = entry.fields.sections?.[locales.en];
    if (!isLayoutPage(page) || !Array.isArray(sections)) continue;
    for (const section of sections) {
      if (isObject(section) && typeof section.blockId === 'string') {
        routes.set(section.blockId, page);
      }
    }
  }
  return routes;
};

const pageName = (route: RouteKey, locale: Locale) =>
  isLayoutPage(route) ? PAGE_LABELS[route][locale] : ROUTES[route];

export const buildContentIndex = (
  source: ContentSearchSource,
  locale: Locale,
  t: SiteEditorMessages,
): SearchItem[] => {
  const entries = [...source.items, ...source.includes.entries].flatMap(
    (item) => toEntry(item) ?? [],
  );
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const parents = new Map<string, RawEntry>();
  for (const entry of entries) {
    for (const id of linkedIds(entry.fields)) if (!parents.has(id)) parents.set(id, entry);
  }
  const blockRoutes = layoutRoutes(entries, source.locales);

  const routeOf = (entry: RawEntry, depth = 0): RouteKey | null => {
    const direct = PAGE_ROUTES[entry.contentTypeId];
    if (direct) return direct;
    if (entry.contentTypeId === 'pageBlock') return blockRoutes.get(entry.id) ?? null;
    if (entry.contentTypeId === 'legalDocument') {
      const key = entry.fields.key?.[source.locales.en];
      return typeof key === 'string' ? (LEGAL_ROUTES[key] ?? null) : null;
    }
    const parent = parents.get(entry.id);
    return parent && depth < MAX_PARENT_DEPTH ? routeOf(parent, depth + 1) : null;
  };

  return [...byId.values()].flatMap((entry) => {
    const type = findContentType(entry.contentTypeId);
    const route = routeOf(entry);
    if (!type || !route) return [];
    const place = `${pageName(route, locale)} · ${typeName(t.fields, type.id, type.name)}`;
    return type.fields.flatMap((field): SearchItem[] => {
      if (!TEXT_TYPES.has(field.type)) return [];
      const code = field.localized ? source.locales[locale] : source.locales.en;
      const value = entry.fields[field.id]?.[code];
      if (typeof value !== 'string' || !value.trim()) return [];
      return [
        {
          key: `${entry.id}:${field.id}`,
          text: stripFieldMarks(value),
          normalized: normalizeSearch(value),
          route: ROUTES[route],
          place,
          field: fieldText(t.fields, type.id, field).label,
          selection: {
            entryId: entry.id,
            contentTypeId: entry.contentTypeId,
            fieldId: field.id,
            locale,
          },
        },
      ];
    });
  });
};

const RECORD_ROUTES: Record<RecordResource, (key: string) => string> = {
  project: buildProjectPath,
  publication: buildPublicationPath,
  event: () => ROUTES.OPPORTUNITIES,
};

const SEARCHED_KINDS = new Set(['text', 'longText']);

export const buildRecordIndex = (
  resource: RecordResource,
  key: string,
  data: RecordData,
  locale: Locale,
  t: SiteEditorMessages,
): SearchItem[] => {
  const definition = RECORD_DEFINITIONS[resource];
  const title = readRecordValue(data, definition.displayPath.replace(LOCALE_PLACEHOLDER, locale));
  const place = `${t.records.resource[resource]}${typeof title === 'string' && title ? ` · ${title}` : ''}`;
  return definition.fields.flatMap((field): SearchItem[] => {
    if (!field.localized || !SEARCHED_KINDS.has(field.kind)) return [];
    const value = readRecordValue(data, field.path.replace(LOCALE_PLACEHOLDER, locale));
    if (typeof value !== 'string' || !value.trim()) return [];
    return [
      {
        key: `${resource}:${key}:${field.path}`,
        text: value,
        normalized: normalizeSearch(value),
        route: RECORD_ROUTES[resource](key),
        place,
        field: recordFieldText(t.fields, resource, field).label,
        selection: {
          entryId: key,
          contentTypeId: recordTypeId(resource),
          fieldId: field.path,
          locale,
        },
      },
    ];
  });
};

const rankOf = (item: SearchItem, query: string, terms: readonly string[]) => {
  if (!terms.every((term) => item.normalized.includes(term))) return null;
  if (item.normalized === query) return 0;
  if (item.normalized.startsWith(query)) return 1;
  const index = item.normalized.indexOf(query);
  if (index < 0) return 4;
  return item.normalized[index - 1] === ' ' ? 2 : 3;
};

export const searchItems = (
  items: readonly SearchItem[],
  query: string,
  terms: readonly string[],
) =>
  items
    .flatMap((item) => {
      const rank = rankOf(item, query, terms);
      return rank === null ? [] : [{ item, rank }];
    })
    .sort((left, right) => left.rank - right.rank || left.item.text.length - right.item.text.length)
    .map(({ item }) => item);

const SNIPPET_LEAD = 24;
const SNIPPET_LENGTH = 120;

export interface SnippetPart {
  text: string;
  isMatch: boolean;
}

const matchRanges = (text: string, terms: readonly string[]) => {
  const folded = foldText(text);
  return terms
    .flatMap((term) => {
      const ranges: [number, number][] = [];
      for (
        let from = folded.indexOf(term);
        from >= 0;
        from = folded.indexOf(term, from + term.length)
      ) {
        ranges.push([from, from + term.length]);
      }
      return ranges;
    })
    .sort((left, right) => left[0] - right[0]);
};

export const snippetOf = (item: SearchItem, terms: readonly string[]) => {
  const ranges = matchRanges(item.text, terms);
  const start = Math.max((ranges[0]?.[0] ?? 0) - SNIPPET_LEAD, 0);
  const end = Math.min(start + SNIPPET_LENGTH, item.text.length);
  const parts: SnippetPart[] = start > 0 ? [{ text: '…', isMatch: false }] : [];
  let cursor = start;
  for (const [from, to] of ranges) {
    const begin = Math.max(from, cursor);
    const stop = Math.min(to, end);
    if (begin >= stop) continue;
    if (begin > cursor) parts.push({ text: item.text.slice(cursor, begin), isMatch: false });
    parts.push({ text: item.text.slice(begin, stop), isMatch: true });
    cursor = stop;
  }
  if (cursor < end) parts.push({ text: item.text.slice(cursor, end), isMatch: false });
  if (end < item.text.length) parts.push({ text: '…', isMatch: false });
  return parts;
};

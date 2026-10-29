import { ROUTES } from '../../src/shared/config/routes.ts';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '../../src/shared/i18n/model/types.ts';
import type { FieldDefinition } from './content-types.ts';
import { CONTENT_TYPES, DOMAINS } from './domains/index.ts';
import {
  createDiagnostics,
  rawAssetSchema,
  rawEntrySchema,
  type ContentIssue,
  type EntryCollection,
} from './entry-reader.ts';
import { assetUrl, createAssetRegistry } from './tokens.ts';

export interface LiveEntriesPayload {
  locales: Record<Locale, string>;
  items: unknown[];
  includes: { entries: unknown[]; assets: unknown[] };
}

export interface FieldAddress {
  entryId: string;
  contentTypeId: string;
  fieldId: string;
  locale: Locale;
}

export type FieldMarker = (address: FieldAddress) => string;

export interface LiveExportOptions {
  strict?: boolean;
  onIssues?: (issues: readonly ContentIssue[]) => void;
}

const isMarkableText = (definition: FieldDefinition) =>
  (definition.localized || definition.editableOnPage) &&
  (definition.type === 'Symbol' ||
    definition.type === 'Text' ||
    (definition.type === 'Array' && definition.items?.type === 'Symbol'));

const markText = (value: string, marker: string) =>
  value
    .split('\n')
    .map((line) => (line.trim() ? `${line}${marker}` : line))
    .join('\n');

const markValue = (value: unknown, definition: FieldDefinition, marker: string): unknown => {
  if (typeof value === 'string') {
    return definition.type === 'Text' ? markText(value, marker) : `${value}${marker}`;
  }
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === 'string' ? `${item}${marker}` : item));
  }
  return value;
};

const rawAssetLinkId = (value: unknown) => {
  if (typeof value !== 'object' || value === null || !('sys' in value)) return undefined;
  const { sys } = value as { sys: { id?: unknown; linkType?: unknown } };
  return sys.linkType === 'Asset' && typeof sys.id === 'string' ? sys.id : undefined;
};

export const contentTypeDefinition = (contentTypeId: string) =>
  CONTENT_TYPES.find((type) => type.id === contentTypeId);

export const markPreviewPayload = (
  payload: LiveEntriesPayload,
  mark: FieldMarker,
  onAsset: (assetId: string, address: Omit<FieldAddress, 'locale'>) => void,
): LiveEntriesPayload => {
  const markEntry = (item: unknown): unknown => {
    const parsed = rawEntrySchema.safeParse(item);
    if (!parsed.success) return item;
    const entry = parsed.data;
    const contentTypeId = entry.sys.contentType.sys.id;
    const definition = contentTypeDefinition(contentTypeId);
    if (!definition) return item;

    const fields: Record<string, Record<string, unknown>> = { ...entry.fields };
    for (const field of definition.fields) {
      const values = entry.fields[field.id];
      if (!values) continue;
      if (field.type === 'Link' && field.linkType === 'Asset') {
        const link = Object.values(values)[0];
        const assetId = rawAssetLinkId(link);
        if (assetId) onAsset(assetId, { entryId: entry.sys.id, contentTypeId, fieldId: field.id });
        continue;
      }
      if (!isMarkableText(field)) continue;
      const marked: Record<string, unknown> = { ...values };
      for (const locale of field.localized ? LOCALES : [DEFAULT_LOCALE]) {
        const code = payload.locales[locale];
        if (values[code] === undefined) continue;
        const marker = mark({ entryId: entry.sys.id, contentTypeId, fieldId: field.id, locale });
        marked[code] = markValue(values[code], field, marker);
      }
      fields[field.id] = marked;
    }
    return { ...(item as object), fields };
  };

  return {
    ...payload,
    items: payload.items.map(markEntry),
    includes: { ...payload.includes, entries: payload.includes.entries.map(markEntry) },
  };
};

const EXTRA_TYPES: Partial<Record<string, readonly string[]>> = {
  legalDocument: ['siteSettings'],
};

const ROUTE_TOKEN = /^@@route:([A-Z_]+)@@$/;
const ASSET_TOKEN = /^@@asset:([A-Za-z0-9_-]+)@@$/;

const isRouteKey = (key: string): key is keyof typeof ROUTES => key in ROUTES;

const findDomain = (domainId: string) => {
  const domain = DOMAINS.find((candidate) => candidate.id === domainId);
  if (!domain) throw new Error(`Unknown content domain ${domainId}`);
  return domain;
};

export const contentTypesFor = (domainId: string) => [
  ...findDomain(domainId).contentTypes.map((type) => type.id),
  ...(EXTRA_TYPES[domainId] ?? []),
];

const toCollection = (payload: LiveEntriesPayload): EntryCollection => {
  const collection: EntryCollection = { byType: new Map(), entries: new Map(), assets: new Map() };
  for (const item of payload.items) {
    const entry = rawEntrySchema.parse(item);
    const type = entry.sys.contentType.sys.id;
    collection.byType.set(type, [...(collection.byType.get(type) ?? []), entry]);
    collection.entries.set(entry.sys.id, entry);
  }
  for (const item of payload.includes.entries) {
    const entry = rawEntrySchema.parse(item);
    collection.entries.set(entry.sys.id, entry);
  }
  for (const item of payload.includes.assets) {
    const asset = rawAssetSchema.parse(item);
    collection.assets.set(asset.sys.id, asset);
  }
  return collection;
};

export const buildLiveExports = (
  domainId: string,
  payload: LiveEntriesPayload,
  { strict = true, onIssues }: LiveExportOptions = {},
): Record<string, unknown> => {
  const collection = toCollection(payload);
  const { issues, details, diagnostics } = createDiagnostics();
  const modules = findDomain(domainId).pull({
    collection,
    locales: payload.locales,
    diagnostics,
    assets: createAssetRegistry(),
  });
  onIssues?.(details);
  if (strict && issues.length > 0) {
    throw new Error(`Live content ${domainId} is invalid: ${issues[0]}`);
  }

  const resolve = (value: unknown): unknown => {
    if (typeof value === 'string') {
      const route = ROUTE_TOKEN.exec(value)?.[1];
      if (route && isRouteKey(route)) return ROUTES[route];
      const assetId = ASSET_TOKEN.exec(value)?.[1];
      if (assetId) {
        const file = collection.assets.get(assetId)?.fields.file?.[payload.locales[DEFAULT_LOCALE]];
        if (!file) {
          if (strict) throw new Error(`Asset ${assetId} is missing or unpublished`);
          return undefined;
        }
        return assetUrl(file).toString();
      }
      return value;
    }
    if (Array.isArray(value)) return value.map(resolve);
    if (typeof value === 'object' && value !== null) {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolve(item)]));
    }
    return value;
  };

  return Object.fromEntries(
    modules.flatMap((module) => module.exports.map(({ name, value }) => [name, resolve(value)])),
  );
};

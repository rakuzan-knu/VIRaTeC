import { ROUTES } from '../../src/shared/config/routes.ts';
import { DEFAULT_LOCALE, type Locale } from '../../src/shared/i18n/model/types.ts';
import { DOMAINS } from './domains/index.ts';
import {
  createDiagnostics,
  rawAssetSchema,
  rawEntrySchema,
  type EntryCollection,
} from './entry-reader.ts';
import { assetUrl, createAssetRegistry } from './tokens.ts';

export interface LiveEntriesPayload {
  locales: Record<Locale, string>;
  items: unknown[];
  includes: { entries: unknown[]; assets: unknown[] };
}

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
): Record<string, unknown> => {
  const collection = toCollection(payload);
  const { issues, diagnostics } = createDiagnostics();
  const modules = findDomain(domainId).pull({
    collection,
    locales: payload.locales,
    diagnostics,
    assets: createAssetRegistry(),
  });
  if (issues.length > 0) throw new Error(`Live content ${domainId} is invalid: ${issues[0]}`);

  const resolve = (value: unknown): unknown => {
    if (typeof value === 'string') {
      const route = ROUTE_TOKEN.exec(value)?.[1];
      if (route && isRouteKey(route)) return ROUTES[route];
      const assetId = ASSET_TOKEN.exec(value)?.[1];
      if (assetId) {
        const file = collection.assets.get(assetId)?.fields.file?.[payload.locales[DEFAULT_LOCALE]];
        if (!file) throw new Error(`Asset ${assetId} is missing or unpublished`);
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

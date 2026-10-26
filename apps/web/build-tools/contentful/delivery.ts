import { z } from 'zod';
import type { ContentfulConfig } from './env.ts';
import { contentfulRequest } from './http.ts';
import {
  rawAssetSchema,
  rawEntrySchema,
  type EntryCollection,
  type RawEntry,
} from './entry-reader.ts';

const DELIVERY_HOST = 'https://cdn.contentful.com';
const PAGE_SIZE = 100;
const INCLUDE_DEPTH = 4;

const pageSchema = z.object({
  total: z.number(),
  items: z.array(rawEntrySchema),
  includes: z
    .object({
      Entry: z.array(rawEntrySchema).optional(),
      Asset: z.array(rawAssetSchema).optional(),
    })
    .optional(),
});

export const fetchEntries = async (
  config: ContentfulConfig,
  contentTypeIds: readonly string[],
): Promise<EntryCollection> => {
  const collection: EntryCollection = { byType: new Map(), entries: new Map(), assets: new Map() };

  for (const contentTypeId of contentTypeIds) {
    const items: RawEntry[] = [];
    for (let skip = 0; ; skip += PAGE_SIZE) {
      const url = new URL(
        `/spaces/${config.spaceId}/environments/${config.environment}/entries`,
        DELIVERY_HOST,
      );
      url.search = new URLSearchParams({
        content_type: contentTypeId,
        locale: '*',
        include: String(INCLUDE_DEPTH),
        limit: String(PAGE_SIZE),
        skip: String(skip),
        order: 'sys.createdAt',
      }).toString();

      const page = pageSchema.parse(await contentfulRequest(url, { token: config.token }));
      items.push(...page.items);
      [...page.items, ...(page.includes?.Entry ?? [])].forEach((entry) =>
        collection.entries.set(entry.sys.id, entry),
      );
      page.includes?.Asset?.forEach((asset) => collection.assets.set(asset.sys.id, asset));

      if (skip + PAGE_SIZE >= page.total) break;
    }
    collection.byType.set(contentTypeId, items);
  }

  return collection;
};

import { z } from 'zod';
import type { RawAsset } from './entry-reader.ts';

const MAX_WIDTH = 1920;
const WEBP_QUALITY = 90;

export const PASSTHROUGH_TYPES: Record<string, string> = { 'image/svg+xml': 'svg' };

export const ROUTE_TOKEN_PATTERN = /"@@route:([A-Z_]+)@@"/g;
export const ASSET_TOKEN_PATTERN = /"@@asset:([A-Za-z0-9_-]+)@@"/g;

export const routeToken = (routeKey: string) => `@@route:${routeKey}@@`;

export const createAssetRegistry = () => {
  const ids = new Set<string>();
  return {
    ids,
    reference: (assetId: string) => {
      ids.add(assetId);
      return `@@asset:${assetId}@@`;
    },
  };
};

export type AssetRegistry = ReturnType<typeof createAssetRegistry>;

export const assetIdsIn = (source: string) =>
  [...source.matchAll(ASSET_TOKEN_PATTERN)].flatMap((match) => (match[1] ? [match[1]] : []));

export const assetUrl = (file: NonNullable<RawAsset['fields']['file']>[string]) => {
  const url = new URL(`https:${file.url}`);
  if (PASSTHROUGH_TYPES[file.contentType]) return url;

  const details = z
    .object({ image: z.object({ width: z.number() }).optional() })
    .optional()
    .safeParse(file.details);
  const width = Math.min(MAX_WIDTH, details.data?.image?.width ?? MAX_WIDTH);
  url.search = new URLSearchParams({
    fm: 'webp',
    q: String(WEBP_QUALITY),
    w: String(width),
  }).toString();
  return url;
};

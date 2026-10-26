import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { DEFAULT_LOCALE, type Locale } from '../../src/shared/i18n/model/types.ts';
import type { RawAsset } from './entry-reader.ts';
import { WEB_ROOT } from './cli.ts';
import { ASSET_TOKEN_PATTERN, PASSTHROUGH_TYPES, assetUrl } from './tokens.ts';

export const ASSETS_DIR = path.join(WEB_ROOT, 'src/shared/assets/contentful');
export const ASSETS_IMPORT_PREFIX = '@/shared/assets/contentful';
const MANIFEST_FILE = 'manifest.json';

const manifestSchema = z.record(z.string(), z.object({ updatedAt: z.string(), file: z.string() }));

type Manifest = z.infer<typeof manifestSchema>;

export const assetIdentifier = (assetId: string) =>
  `asset_${assetId.replace(/[^A-Za-z0-9_]/g, '_')}`;

export const replaceAssetTokens = (source: string) =>
  source.replace(ASSET_TOKEN_PATTERN, (_, assetId: string) => assetIdentifier(assetId));

const readManifest = async (): Promise<Manifest> => {
  try {
    return manifestSchema.parse(
      JSON.parse(await readFile(path.join(ASSETS_DIR, MANIFEST_FILE), 'utf8')),
    );
  } catch {
    return {};
  }
};

export const syncAssets = async (
  ids: ReadonlySet<string>,
  assets: ReadonlyMap<string, RawAsset>,
  locales: Record<Locale, string>,
) => {
  await mkdir(ASSETS_DIR, { recursive: true });
  const previous = await readManifest();
  const manifest: Manifest = {};
  const files = new Map<string, string>();
  let downloaded = 0;

  for (const id of [...ids].sort()) {
    const asset = assets.get(id);
    const file = asset?.fields.file?.[locales[DEFAULT_LOCALE]];
    if (!asset || !file) throw new Error(`Asset ${id} is missing, unpublished or has no file`);

    const extension = PASSTHROUGH_TYPES[file.contentType] ?? 'webp';
    const fileName = `${id}.${extension}`;
    const cached = previous[id];
    const isFresh =
      cached?.updatedAt === asset.sys.updatedAt &&
      cached.file === fileName &&
      (await readFile(path.join(ASSETS_DIR, fileName)).then(
        () => true,
        () => false,
      ));

    if (!isFresh) {
      const response = await fetch(assetUrl(file));
      if (!response.ok) throw new Error(`Downloading asset ${id} failed with ${response.status}`);
      await writeFile(
        path.join(ASSETS_DIR, fileName),
        new Uint8Array(await response.arrayBuffer()),
      );
      downloaded += 1;
    }
    manifest[id] = { updatedAt: asset.sys.updatedAt, file: fileName };
    files.set(id, fileName);
  }

  const finalize = async () => {
    const keep = new Set([MANIFEST_FILE, ...files.values()]);
    const stale = (await readdir(ASSETS_DIR)).filter((name) => !keep.has(name));
    await Promise.all(stale.map((name) => rm(path.join(ASSETS_DIR, name))));
    await writeFile(path.join(ASSETS_DIR, MANIFEST_FILE), `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(
      `Assets: ${files.size} referenced, ${downloaded} downloaded, ${stale.length} removed`,
    );
  };

  return { files, finalize };
};

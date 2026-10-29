import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp, { type Sharp } from 'sharp';
import type { Plugin } from 'vite';
import {
  RESPONSIVE_IMAGE_FORMATS,
  RESPONSIVE_IMAGE_SOURCE,
  RESPONSIVE_IMAGE_WIDTHS,
  responsiveImageVariant,
  type ResponsiveImageFormat,
} from '../src/shared/config/responsiveImages';

const ENCODE_OPTIONS: Record<ResponsiveImageFormat, (image: Sharp) => Sharp> = {
  avif: (image) => image.avif({ quality: 55, effort: 4 }),
  webp: (image) => image.webp({ quality: 78, effort: 5 }),
};

const ENCODER_VERSION = 'v2';

async function encodeCached(
  cacheDir: string,
  source: Uint8Array,
  width: number,
  format: ResponsiveImageFormat,
): Promise<Buffer> {
  const key = createHash('sha256')
    .update(ENCODER_VERSION)
    .update(source)
    .update(`${width}:${format}`)
    .digest('hex');
  const cachePath = join(cacheDir, `${key}.${format}`);

  try {
    return await readFile(cachePath);
  } catch {
    const encoded = await ENCODE_OPTIONS[format](sharp(source).resize({ width })).toBuffer();
    await writeFile(cachePath, encoded);
    return encoded;
  }
}

export function responsiveImagesPlugin(cacheDir: string): Plugin {
  return {
    name: 'viratec-responsive-images',
    apply: 'build',
    async generateBundle(_, bundle) {
      await mkdir(cacheDir, { recursive: true });

      const images = Object.values(bundle).flatMap((output) => {
        const base = output.fileName.match(RESPONSIVE_IMAGE_SOURCE)?.[1];
        return output.type === 'asset' && base && typeof output.source !== 'string'
          ? [{ base, source: output.source }]
          : [];
      });

      await Promise.all(
        images.map(async ({ base, source }) => {
          const { width: sourceWidth = Infinity } = await sharp(source).metadata();
          const encodings = new Map<string, Promise<Buffer>>();

          await Promise.all(
            RESPONSIVE_IMAGE_WIDTHS.flatMap((width) =>
              RESPONSIVE_IMAGE_FORMATS.map(async (format) => {
                const targetWidth = Math.min(width, sourceWidth);
                const encodingKey = `${targetWidth}.${format}`;
                const encoding =
                  encodings.get(encodingKey) ?? encodeCached(cacheDir, source, targetWidth, format);
                encodings.set(encodingKey, encoding);

                this.emitFile({
                  type: 'asset',
                  fileName: responsiveImageVariant(base, width, format),
                  source: await encoding,
                });
              }),
            ),
          );
        }),
      );
    },
  };
}

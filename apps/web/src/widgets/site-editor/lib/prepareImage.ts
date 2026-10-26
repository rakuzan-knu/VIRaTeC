import { CONTENT_EDITOR_LIMITS } from '@viratec/contracts';

export type ImageFileErrorReason = 'type' | 'size' | 'decode';

export class ImageFileError extends Error {
  constructor(public readonly reason: ImageFileErrorReason) {
    super(`Image file rejected: ${reason}`);
    this.name = 'ImageFileError';
  }
}

const SVG_TYPE = 'image/svg+xml';
const ATTEMPTS = [
  { maxSide: 2560, quality: 0.86 },
  { maxSide: 2048, quality: 0.8 },
  { maxSide: 1600, quality: 0.72 },
] as const;

export const ACCEPTED_IMAGE_TYPES = CONTENT_EDITOR_LIMITS.assetMimeTypes.join(',');

const dataUrlBytes = (dataUrl: string) =>
  Math.floor(((dataUrl.length - dataUrl.indexOf(',') - 1) * 3) / 4);

const readAsDataUrl = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new ImageFileError('decode'));
    reader.readAsDataURL(file);
  });

const baseName = (fileName: string) => fileName.replace(/\.[^.]+$/, '') || 'image';

export async function prepareImage(file: File): Promise<{ data: string; fileName: string }> {
  if (!(CONTENT_EDITOR_LIMITS.assetMimeTypes as readonly string[]).includes(file.type)) {
    throw new ImageFileError('type');
  }
  if (file.type === SVG_TYPE) {
    if (file.size > CONTENT_EDITOR_LIMITS.maxAssetBytes) throw new ImageFileError('size');
    return { data: await readAsDataUrl(file), fileName: file.name };
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new ImageFileError('decode');
  }

  try {
    for (const { maxSide, quality } of ATTEMPTS) {
      const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      const context = canvas.getContext('2d');
      if (!context) throw new ImageFileError('decode');
      context.imageSmoothingQuality = 'high';
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL('image/webp', quality);
      if (
        data.startsWith('data:image/webp') &&
        dataUrlBytes(data) <= CONTENT_EDITOR_LIMITS.maxAssetBytes
      ) {
        return { data, fileName: `${baseName(file.name)}.webp` };
      }
    }
  } finally {
    bitmap.close();
  }
  throw new ImageFileError('size');
}

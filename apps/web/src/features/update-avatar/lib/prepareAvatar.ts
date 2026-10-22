import { AVATAR_LIMITS } from '@viratec/contracts';

export type AvatarFileErrorReason = 'type' | 'size' | 'decode' | 'encode';

export class AvatarFileError extends Error {
  constructor(public readonly reason: AvatarFileErrorReason) {
    super(`Avatar file rejected: ${reason}`);
    this.name = 'AvatarFileError';
  }
}

const ENCODINGS = [
  { type: 'image/webp', quality: 0.86 },
  { type: 'image/jpeg', quality: 0.86 },
  { type: 'image/jpeg', quality: 0.7 },
] as const;

const isAcceptedType = (type: string): boolean =>
  (AVATAR_LIMITS.mimeTypes as readonly string[]).includes(type);

const dataUrlBytes = (dataUrl: string) => {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  return Math.floor((base64.length * 3) / 4);
};

export const ACCEPTED_AVATAR_TYPES = AVATAR_LIMITS.mimeTypes.join(',');

export async function prepareAvatar(file: File): Promise<string> {
  if (!isAcceptedType(file.type)) throw new AvatarFileError('type');
  if (file.size > AVATAR_LIMITS.sourceMaxBytes) throw new AvatarFileError('size');

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new AvatarFileError('decode');
  }

  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_LIMITS.size;
  canvas.height = AVATAR_LIMITS.size;
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new AvatarFileError('encode');
  }

  context.imageSmoothingQuality = 'high';
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    AVATAR_LIMITS.size,
    AVATAR_LIMITS.size,
  );
  bitmap.close();

  for (const { type, quality } of ENCODINGS) {
    const dataUrl = canvas.toDataURL(type, quality);
    if (dataUrl.startsWith(`data:${type};`) && dataUrlBytes(dataUrl) <= AVATAR_LIMITS.maxBytes) {
      return dataUrl;
    }
  }
  throw new AvatarFileError('encode');
}

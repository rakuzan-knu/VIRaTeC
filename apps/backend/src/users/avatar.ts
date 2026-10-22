import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import { AVATAR_LIMITS, type AvatarMimeType } from '@viratec/contracts';

const DATA_URL_PATTERN = /^data:(image\/[a-z]+);base64,([A-Za-z0-9+/]+={0,2})$/;

const startsWith = (buffer: Buffer, bytes: number[], offset = 0) =>
  bytes.every((byte, index) => buffer[offset + index] === byte);

export function detectImageType(buffer: Buffer): AvatarMimeType | null {
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (
    startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(buffer, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return 'image/webp';
  }
  return null;
}

export function parseAvatarImage(dataUrl: string) {
  const match = DATA_URL_PATTERN.exec(dataUrl);
  if (!match) {
    throw new BadRequestException('Avatar must be a base64 image data URL');
  }

  const data = Buffer.from(match[2], 'base64');
  if (data.length > AVATAR_LIMITS.maxBytes) {
    throw new PayloadTooLargeException('Avatar image is too large');
  }

  const mimeType = detectImageType(data);
  if (!mimeType || mimeType !== match[1]) {
    throw new BadRequestException('Avatar must be a PNG, JPEG or WebP image');
  }

  return { data, mimeType };
}

export const buildAvatarUrl = (userId: string, version: Date) =>
  `/api/v1/users/${userId}/avatar?v=${version.getTime()}`;

import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import { AVATAR_LIMITS } from '@viratec/contracts';
import { buildAvatarUrl, detectImageType } from '../security/avatar-image';

export { buildAvatarUrl, detectImageType };

const DATA_URL_PATTERN = /^data:(image\/[a-z]+);base64,([A-Za-z0-9+/]+={0,2})$/;

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

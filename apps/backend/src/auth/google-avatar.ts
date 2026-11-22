import { AVATAR_LIMITS } from '@viratec/contracts';
import { detectImageType } from '../security/avatar-image';

const GOOGLE_AVATAR_HOST = /(^|\.)googleusercontent\.com$/;
const DOWNLOAD_TIMEOUT_MS = 5_000;

export function isGoogleAvatarUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && GOOGLE_AVATAR_HOST.test(url.hostname);
  } catch {
    return false;
  }
}

export async function downloadGoogleAvatar(url: string | null | undefined) {
  if (!isGoogleAvatarUrl(url)) return null;

  const response = await fetch(url, {
    redirect: 'error',
    signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
  });
  if (!response.ok) return null;
  if (Number(response.headers.get('content-length') ?? 0) > AVATAR_LIMITS.maxBytes) return null;

  const data = Buffer.from(await response.arrayBuffer());
  if (data.length > AVATAR_LIMITS.maxBytes) return null;

  const mimeType = detectImageType(data);
  return mimeType ? { data, mimeType } : null;
}

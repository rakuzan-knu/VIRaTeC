import { createHmac } from 'node:crypto';
import { safeEqual } from '../security/crypto';

const sign = (key: Buffer, registrationId: string) =>
  createHmac('sha256', key).update(`event-unsubscribe:${registrationId}`).digest('base64url');

export const createUnsubscribeToken = (key: Buffer, registrationId: string) =>
  `${registrationId}.${sign(key, registrationId)}`;

export function readUnsubscribeToken(key: Buffer, token: string) {
  const [registrationId, signature, ...rest] = token.split('.');
  if (!registrationId || !signature || rest.length > 0) return null;
  return safeEqual(signature, sign(key, registrationId)) ? registrationId : null;
}

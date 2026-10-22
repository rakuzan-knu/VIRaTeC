import type { FastifyReply, FastifyRequest } from 'fastify';
import type { CookieSerializeOptions } from '@fastify/cookie';
import { randomToken } from '../security/crypto';

export const AUTH_COOKIE_PATH = '/api/v1/auth';
export const CSRF_HEADER = 'x-csrf-token';

const ACCESS_MAX_AGE_SECONDS = 15 * 60;
const REFRESH_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const MFA_MAX_AGE_SECONDS = 5 * 60;

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

export const cookieNames = (secure: boolean) => ({
  access: secure ? '__Host-vt_at' : 'vt_at',
  refresh: secure ? '__Secure-vt_rt' : 'vt_rt',
  csrf: secure ? '__Host-vt_csrf' : 'vt_csrf',
  mfa: secure ? '__Secure-vt_mfa' : 'vt_mfa',
});

const baseOptions = (secure: boolean): CookieSerializeOptions => ({
  secure,
  sameSite: 'strict',
  path: '/',
});

export function readCookie(request: FastifyRequest, name: string) {
  const value = request.cookies?.[name];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function setSessionCookies(reply: FastifyReply, tokens: SessionTokens, secure: boolean) {
  const names = cookieNames(secure);
  reply.setCookie(names.access, tokens.accessToken, {
    ...baseOptions(secure),
    httpOnly: true,
    maxAge: ACCESS_MAX_AGE_SECONDS,
  });
  reply.setCookie(names.refresh, tokens.refreshToken, {
    ...baseOptions(secure),
    httpOnly: true,
    path: AUTH_COOKIE_PATH,
    maxAge: REFRESH_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookies(reply: FastifyReply, secure: boolean) {
  const names = cookieNames(secure);
  reply.clearCookie(names.access, { ...baseOptions(secure), httpOnly: true });
  reply.clearCookie(names.refresh, {
    ...baseOptions(secure),
    httpOnly: true,
    path: AUTH_COOKIE_PATH,
  });
}

export function issueCsrfCookie(reply: FastifyReply, secure: boolean) {
  const token = randomToken(24);
  reply.setCookie(cookieNames(secure).csrf, token, { ...baseOptions(secure), httpOnly: false });
  return token;
}

export function setMfaCookie(reply: FastifyReply, token: string, secure: boolean) {
  reply.setCookie(cookieNames(secure).mfa, token, {
    ...baseOptions(secure),
    httpOnly: true,
    path: AUTH_COOKIE_PATH,
    maxAge: MFA_MAX_AGE_SECONDS,
  });
}

export function clearMfaCookie(reply: FastifyReply, secure: boolean) {
  reply.clearCookie(cookieNames(secure).mfa, {
    ...baseOptions(secure),
    httpOnly: true,
    path: AUTH_COOKIE_PATH,
  });
}

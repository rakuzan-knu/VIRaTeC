import { ENV } from '../config/env';

export class ApiError extends Error {
  public status: number;
  public response?: { status: number; data?: unknown };
  public data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.response = { status, data };
  }
}

export const NETWORK_ERROR_STATUS = 0;

const API_PATH_PREFIX = '/api/v1';

export const resolveApiUrl = (url: string): string =>
  url.startsWith(`${API_PATH_PREFIX}/`)
    ? `${ENV.API_BASE_URL.replace(/\/$/, '')}${url.slice(API_PATH_PREFIX.length)}`
    : url;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  retryOnUnauthorized?: boolean;
  cache?: RequestCache;
}

type UnauthorizedHandler = () => Promise<boolean>;

const UNSAFE_METHODS = new Set<HttpMethod>(['POST', 'PUT', 'PATCH', 'DELETE']);
const CSRF_COOKIE_NAMES = ['__Host-vt_csrf', 'vt_csrf'];
const CSRF_HEADER = 'X-CSRF-Token';

const readCsrfCookie = (): string | null => {
  const cookies = new Map(
    document.cookie
      .split(';')
      .map((part) => part.trim().split('='))
      .filter((pair): pair is [string, string] => pair.length === 2)
      .map(([name, value]) => [name, decodeURIComponent(value)]),
  );
  for (const name of CSRF_COOKIE_NAMES) {
    const value = cookies.get(name);
    if (value) return value;
  }
  return null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const extractMessage = (data: unknown): string | null => {
  if (!isRecord(data)) return null;
  const source = isRecord(data.error) ? data.error : data;
  const { message } = source;
  if (typeof message === 'string') return message;
  if (Array.isArray(message) && typeof message[0] === 'string') return message[0];
  return null;
};

export const extractErrorCode = (data: unknown): string | null => {
  if (!isRecord(data) || !isRecord(data.error)) return null;
  const { code } = data.error;
  return typeof code === 'string' ? code : null;
};

export const getApiErrorCode = (error: unknown): string | null =>
  error instanceof ApiError ? extractErrorCode(error.data) : null;

class ApiClient {
  private baseUrl: string;
  private unauthorizedHandler: UnauthorizedHandler | null = null;
  private pendingCsrf: Promise<void> | null = null;

  constructor() {
    this.baseUrl = ENV.API_BASE_URL;
  }

  setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
    this.unauthorizedHandler = handler;
  }

  private refreshCsrfToken(): Promise<void> {
    this.pendingCsrf ??= fetch(`${this.baseUrl}/auth/csrf`, { credentials: 'include' })
      .then(() => undefined)
      .catch(() => undefined)
      .finally(() => {
        this.pendingCsrf = null;
      });
    return this.pendingCsrf;
  }

  private async getHeaders(method: HttpMethod, hasBody: boolean): Promise<HeadersInit> {
    const headers: Record<string, string> = hasBody ? { 'Content-Type': 'application/json' } : {};
    if (UNSAFE_METHODS.has(method)) {
      if (!readCsrfCookie()) await this.refreshCsrfToken();
      const csrf = readCsrfCookie();
      if (csrf) headers[CSRF_HEADER] = csrf;
    }
    return headers;
  }

  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    body: unknown,
    { retryOnUnauthorized = true, cache }: RequestOptions,
    retriedCsrf = false,
  ): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        credentials: 'include',
        headers: await this.getHeaders(method, body !== undefined),
        body: body === undefined ? undefined : JSON.stringify(body),
        cache,
      });
    } catch {
      throw new ApiError(NETWORK_ERROR_STATUS, 'Network request failed');
    }

    if (res.status === 401 && retryOnUnauthorized && this.unauthorizedHandler) {
      const refreshed = await this.unauthorizedHandler();
      if (refreshed) {
        return this.request<T>(
          method,
          endpoint,
          body,
          { retryOnUnauthorized: false, cache },
          retriedCsrf,
        );
      }
    }

    if (!res.ok) {
      let errData: unknown = null;
      try {
        errData = await res.json();
      } catch {
        errData = null;
      }

      if (res.status === 403 && !retriedCsrf && extractErrorCode(errData) === 'CSRF_INVALID') {
        await this.refreshCsrfToken();
        return this.request<T>(method, endpoint, body, { retryOnUnauthorized, cache }, true);
      }

      const message = extractMessage(errData) ?? `API Error: ${res.status} ${res.statusText}`;
      throw new ApiError(res.status, message, errData);
    }

    const json: unknown = await res.json();
    return (isRecord(json) && json.data !== undefined ? json.data : json) as T;
  }

  get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  post<T>(endpoint: string, body: unknown, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('POST', endpoint, body, options);
  }

  put<T>(endpoint: string, body: unknown, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('PUT', endpoint, body, options);
  }

  patch<T>(endpoint: string, body: unknown, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('PATCH', endpoint, body, options);
  }

  delete<T>(endpoint: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('DELETE', endpoint, body, options);
  }
}

export const api = new ApiClient();

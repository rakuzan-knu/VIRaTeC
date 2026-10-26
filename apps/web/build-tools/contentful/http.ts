import { setTimeout as sleep } from 'node:timers/promises';

const MAX_ATTEMPTS = 5;

export class ContentfulHttpError extends Error {
  readonly status: number;

  constructor(method: string, url: URL, status: number, detail: string) {
    super(`${method} ${url.pathname} failed with ${status}: ${detail}`);
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'PUT' | 'POST' | 'DELETE';
  token: string;
  headers?: Record<string, string>;
  body?: unknown;
}

const retryDelay = (response: Response, attempt: number) => {
  const reset = Number(response.headers.get('X-Contentful-RateLimit-Reset'));
  return Number.isFinite(reset) && reset > 0 ? reset * 1000 : 500 * 2 ** attempt;
};

const readErrorDetail = async (response: Response) => {
  const text = await response.text();
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      const { message, details } = parsed as { message?: unknown; details?: unknown };
      return [message, details && JSON.stringify(details)].filter(Boolean).join(' ');
    }
  } catch {
    return text.slice(0, 500);
  }
  return text.slice(0, 500);
};

export const contentfulRequest = async (url: URL, options: RequestOptions): Promise<unknown> => {
  const method = options.method ?? 'GET';
  const headers: Record<string, string> = {
    Authorization: `Bearer ${options.token}`,
    ...options.headers,
  };
  let body: string | undefined;
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/vnd.contentful.management.v1+json';
    body = JSON.stringify(options.body);
  }

  for (let attempt = 1; ; attempt += 1) {
    const response = await fetch(url, { method, headers, body });
    const retryable = response.status === 429 || response.status >= 500;

    if (retryable && attempt < MAX_ATTEMPTS) {
      await sleep(retryDelay(response, attempt));
      continue;
    }
    if (!response.ok) {
      throw new ContentfulHttpError(method, url, response.status, await readErrorDetail(response));
    }
    return response.status === 204 ? null : response.json();
  }
};

export const isNotFound = (error: unknown) =>
  error instanceof ContentfulHttpError && error.status === 404;

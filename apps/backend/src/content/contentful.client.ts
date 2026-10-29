import { setTimeout as sleep } from 'node:timers/promises';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ContentLocales } from '@viratec/contracts';

const HOSTS = {
  delivery: 'https://cdn.contentful.com',
  preview: 'https://preview.contentful.com',
  management: 'https://api.contentful.com',
  upload: 'https://upload.contentful.com',
} as const;

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_ATTEMPTS = 4;
const MANAGEMENT_TYPE = 'application/vnd.contentful.management.v1+json';

const isSafePath = (path: string) =>
  !/[?#\\%]/.test(path) && path.split('/').every((segment) => segment !== '..' && segment !== '.');

export type ContentfulApi = keyof typeof HOSTS;

export interface ContentfulConfig {
  spaceId: string;
  environment: string;
  deliveryToken: string;
  previewToken: string;
  managementToken: string;
  webhookSecret: string;
  locales: ContentLocales;
}

export interface ContentfulItem {
  sys: Record<string, unknown> & { id: string };
  fields?: Record<string, unknown>;
}

interface RequestOptions {
  method?: 'GET' | 'PUT' | 'POST' | 'DELETE';
  query?: Record<string, string>;
  version?: number;
  contentTypeId?: string;
  body?: unknown;
  binary?: Buffer;
}

export class ContentfulRequestError extends Error {
  constructor(
    readonly status: number,
    readonly detail: string,
  ) {
    super(`Contentful responded with ${status}: ${detail}`);
  }
}

const readDetail = async (response: Response) => {
  const text = await response.text();
  try {
    const parsed = JSON.parse(text) as { message?: unknown; details?: { errors?: unknown } };
    const errors = Array.isArray(parsed.details?.errors) ? parsed.details.errors : [];
    const first = errors[0] as { details?: unknown; name?: unknown; path?: unknown } | undefined;
    const path = Array.isArray(first?.path) ? first.path.join('.') : '';
    return [parsed.message, first?.details ?? first?.name, path].filter(Boolean).join(' ');
  } catch {
    return text.slice(0, 300);
  }
};

@Injectable()
export class ContentfulClient {
  private readonly logger = new Logger(ContentfulClient.name);

  constructor(private readonly configService: ConfigService) {}

  get config(): ContentfulConfig {
    return this.configService.getOrThrow<ContentfulConfig>('contentful');
  }

  private token(api: ContentfulApi) {
    const config = this.config;
    if (api === 'delivery') return config.deliveryToken;
    if (api === 'preview') return config.previewToken;
    return config.managementToken;
  }

  isConfigured(api: ContentfulApi) {
    return Boolean(this.config.spaceId && this.token(api));
  }

  async request<T>(api: ContentfulApi, path: string, options: RequestOptions = {}): Promise<T> {
    const config = this.config;
    const token = this.token(api);
    if (!config.spaceId || !token) {
      throw new ServiceUnavailableException('Contentful is not configured');
    }

    const base =
      api === 'upload'
        ? `/spaces/${config.spaceId}`
        : `/spaces/${config.spaceId}/environments/${config.environment}`;
    if (!isSafePath(path)) throw new BadRequestException('Invalid content path');
    const url = new URL(`${base}${path}`, HOSTS[api]);
    if (options.query) url.search = new URLSearchParams(options.query).toString();

    const method = options.method ?? 'GET';
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    let body: string | Buffer | undefined;
    if (options.binary) {
      headers['Content-Type'] = 'application/octet-stream';
      body = options.binary;
    } else if (options.body !== undefined) {
      headers['Content-Type'] = MANAGEMENT_TYPE;
      body = JSON.stringify(options.body);
    }
    if (options.version !== undefined) headers['X-Contentful-Version'] = String(options.version);
    if (options.contentTypeId) headers['X-Contentful-Content-Type'] = options.contentTypeId;

    for (let attempt = 1; ; attempt += 1) {
      let response: Response;
      try {
        response = await fetch(url, {
          method,
          headers,
          body,
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
      } catch (error) {
        this.logger.warn(`${method} ${url.pathname} failed: ${String(error)}`);
        throw new ServiceUnavailableException('Content is temporarily unavailable');
      }

      if ((response.status === 429 || response.status >= 500) && attempt < MAX_ATTEMPTS) {
        const reset = Number(response.headers.get('X-Contentful-RateLimit-Reset'));
        await sleep(Number.isFinite(reset) && reset > 0 ? reset * 1000 : 400 * 2 ** attempt);
        continue;
      }
      if (!response.ok) {
        throw new ContentfulRequestError(response.status, await readDetail(response));
      }
      return (response.status === 204 ? null : await response.json()) as T;
    }
  }

  toHttpError(error: unknown, subject: string): Error {
    if (!(error instanceof ContentfulRequestError)) return error as Error;
    this.logger.warn(`${subject}: ${error.message}`);
    if (error.status === 404) return new NotFoundException(`${subject} was not found`);
    if (error.status === 409) {
      return new ConflictException({
        message: `${subject} was changed by someone else. Reload it and try again.`,
        code: 'CONTENT_VERSION_CONFLICT',
      });
    }
    if (error.status === 422 || error.status === 400) {
      return new UnprocessableEntityException({
        message: `${subject} is invalid: ${error.detail}`,
        code: 'CONTENT_INVALID',
      });
    }
    return new ServiceUnavailableException('Content is temporarily unavailable');
  }
}

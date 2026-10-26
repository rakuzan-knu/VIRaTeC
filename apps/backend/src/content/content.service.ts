import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TtlCache } from '../common/cache/ttl-cache';

const DELIVERY_HOST = 'https://cdn.contentful.com';
const PAGE_SIZE = 100;
const INCLUDE_DEPTH = 4;
const REQUEST_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 30_000;

interface ContentfulConfig {
  spaceId: string;
  environment: string;
  deliveryToken: string;
  locales: { en: string; uk: string };
}

interface ContentfulItem {
  sys: Record<string, unknown> & { id: string };
  fields?: Record<string, unknown>;
}

interface ContentfulPage {
  total: number;
  items: ContentfulItem[];
  includes?: { Entry?: ContentfulItem[]; Asset?: ContentfulItem[] };
}

export interface ContentEntriesResponse {
  locales: ContentfulConfig['locales'];
  items: ContentfulItem[];
  includes: { entries: ContentfulItem[]; assets: ContentfulItem[] };
}

const pickSys = ({ sys, fields }: ContentfulItem): ContentfulItem => ({
  sys: {
    id: sys.id,
    type: sys.type,
    createdAt: sys.createdAt,
    updatedAt: sys.updatedAt,
    ...(sys.contentType ? { contentType: sys.contentType } : {}),
  },
  fields: fields ?? {},
});

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);
  private readonly cache = new TtlCache<ContentEntriesResponse>(CACHE_TTL_MS, 100);

  constructor(private readonly configService: ConfigService) {}

  private get config(): ContentfulConfig {
    return this.configService.getOrThrow<ContentfulConfig>('contentful');
  }

  getEntries(types: readonly string[]): Promise<ContentEntriesResponse> {
    const config = this.config;
    if (!config.spaceId || !config.deliveryToken) {
      throw new ServiceUnavailableException('Contentful is not configured');
    }
    return this.cache.get(types.join(','), () => this.load(config, types));
  }

  private async load(
    config: ContentfulConfig,
    types: readonly string[],
  ): Promise<ContentEntriesResponse> {
    const items: ContentfulItem[] = [];
    const entries = new Map<string, ContentfulItem>();
    const assets = new Map<string, ContentfulItem>();

    for (const type of types) {
      for (let skip = 0; ; skip += PAGE_SIZE) {
        const page = await this.fetchPage(config, type, skip);
        items.push(...page.items.map(pickSys));
        page.includes?.Entry?.forEach((entry) => entries.set(entry.sys.id, pickSys(entry)));
        page.includes?.Asset?.forEach((asset) => assets.set(asset.sys.id, pickSys(asset)));
        if (skip + PAGE_SIZE >= page.total) break;
      }
    }

    return {
      locales: config.locales,
      items,
      includes: { entries: [...entries.values()], assets: [...assets.values()] },
    };
  }

  private async fetchPage(
    config: ContentfulConfig,
    type: string,
    skip: number,
  ): Promise<ContentfulPage> {
    const url = new URL(
      `/spaces/${config.spaceId}/environments/${config.environment}/entries`,
      DELIVERY_HOST,
    );
    url.search = new URLSearchParams({
      content_type: type,
      locale: '*',
      include: String(INCLUDE_DEPTH),
      limit: String(PAGE_SIZE),
      skip: String(skip),
      order: 'sys.createdAt',
    }).toString();

    let response: Response;
    try {
      response = await fetch(url, {
        headers: { Authorization: `Bearer ${config.deliveryToken}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      this.logger.warn(`Contentful request for ${type} failed: ${String(error)}`);
      throw new ServiceUnavailableException('Content is temporarily unavailable');
    }
    if (!response.ok) {
      this.logger.warn(`Contentful request for ${type} failed with ${response.status}`);
      throw new ServiceUnavailableException('Content is temporarily unavailable');
    }
    return (await response.json()) as ContentfulPage;
  }
}

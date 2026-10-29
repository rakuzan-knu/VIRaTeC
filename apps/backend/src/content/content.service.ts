import { Injectable, Logger } from '@nestjs/common';
import { TtlCache } from '../common/cache/ttl-cache';
import { PrismaService } from '../prisma/prisma.service';
import { RATE_LIMITS, RateLimitService } from '../security/rate-limit.service';
import type { ClientContext } from '../common/decorators/client-context.decorator';
import { ContentfulClient, type ContentfulItem } from './contentful.client';

const PAGE_SIZE = 100;
const INCLUDE_DEPTH = 4;
const CACHE_TTL_MS = 60 * 60_000;
const REVISION_TTL_MS = 5_000;
const CACHE_STATE_ID = 1;

interface ContentfulPage {
  total: number;
  items: ContentfulItem[];
  includes?: { Entry?: ContentfulItem[]; Asset?: ContentfulItem[] };
}

export interface ContentEntriesResponse {
  locales: { en: string; uk: string };
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
  private readonly revision = new TtlCache<number>(REVISION_TTL_MS, 1);

  constructor(
    private readonly contentful: ContentfulClient,
    private readonly prisma: PrismaService,
    private readonly rateLimit?: RateLimitService,
  ) {}

  async getEntries(
    types: readonly string[],
    client: ClientContext = {},
  ): Promise<ContentEntriesResponse> {
    const revision = await this.revision.get('current', () => this.readRevision());
    return this.cache.get(`${revision}:${types.join(',')}`, async () => {
      if (client.ipAddress) {
        await this.rateLimit?.consume(
          `content:miss:ip:${client.ipAddress}`,
          RATE_LIMITS.contentMissPerIp,
        );
      }
      return this.load('delivery', types);
    });
  }

  getPreviewEntries(types: readonly string[]): Promise<ContentEntriesResponse> {
    return this.load('preview', types);
  }

  async invalidate() {
    try {
      await this.prisma.contentCacheState.upsert({
        where: { id: CACHE_STATE_ID },
        create: { id: CACHE_STATE_ID, revision: 1 },
        update: { revision: { increment: 1 } },
      });
    } catch (error) {
      this.logger.error('Failed to bump the content revision', error as Error);
    }
    this.revision.clear();
    this.cache.clear();
  }

  private async readRevision() {
    try {
      const state = await this.prisma.contentCacheState.findUnique({
        where: { id: CACHE_STATE_ID },
      });
      return state?.revision ?? 0;
    } catch (error) {
      this.logger.warn(`Content revision is unavailable: ${String(error)}`);
      return -1;
    }
  }

  private async load(
    api: 'delivery' | 'preview',
    types: readonly string[],
  ): Promise<ContentEntriesResponse> {
    const items: ContentfulItem[] = [];
    const entries = new Map<string, ContentfulItem>();
    const assets = new Map<string, ContentfulItem>();

    for (const type of types) {
      for (let skip = 0; ; skip += PAGE_SIZE) {
        const page = await this.fetchPage(api, type, skip);
        items.push(...page.items.map(pickSys));
        page.includes?.Entry?.forEach((entry) => entries.set(entry.sys.id, pickSys(entry)));
        page.includes?.Asset?.forEach((asset) => assets.set(asset.sys.id, pickSys(asset)));
        if (skip + PAGE_SIZE >= page.total) break;
      }
    }

    return {
      locales: this.contentful.config.locales,
      items,
      includes: { entries: [...entries.values()], assets: [...assets.values()] },
    };
  }

  private async fetchPage(
    api: 'delivery' | 'preview',
    type: string,
    skip: number,
  ): Promise<ContentfulPage> {
    try {
      return await this.contentful.request<ContentfulPage>(api, '/entries', {
        query: {
          content_type: type,
          locale: '*',
          include: String(INCLUDE_DEPTH),
          limit: String(PAGE_SIZE),
          skip: String(skip),
          order: 'sys.createdAt',
        },
      });
    } catch (error) {
      throw this.contentful.toHttpError(error, `Entries of ${type}`);
    }
  }
}

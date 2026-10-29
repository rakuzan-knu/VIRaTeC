import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ContentResourceType, type ContentChange, type Prisma } from '@prisma/client';
import { CONTENT_REVISION_LIMIT, type ContentRevisionDto } from '@viratec/contracts';
import { PrismaService } from '../prisma/prisma.service';
import { ContentfulClient } from './contentful.client';

const CONTENTFUL_PREFIX = 'contentful:';

interface CmaSnapshot {
  sys: { id: string; createdAt: string };
  snapshot?: { fields?: Record<string, unknown> };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const ACTOR_SELECT = { id: true, name: true } satisfies Prisma.UserSelect;

@Injectable()
export class RevisionsService {
  private readonly logger = new Logger(RevisionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly contentful: ContentfulClient,
  ) {}

  async record(change: ContentChange, data: unknown, actorId: string) {
    if (!isRecord(data)) return;
    try {
      await this.prisma.contentRevision.create({
        data: {
          resourceType: change.resourceType,
          resourceId: change.resourceId,
          contentTypeId: change.contentTypeId,
          label: change.label,
          data: data as Prisma.InputJsonObject,
          actorId,
        },
      });
    } catch (error) {
      this.logger.error(`Revision of ${change.resourceId} was not stored`, error as Error);
    }
  }

  async list(resourceType: ContentResourceType, resourceId: string) {
    const rows = await this.prisma.contentRevision.findMany({
      where: { resourceType, resourceId },
      orderBy: { createdAt: 'desc' },
      take: CONTENT_REVISION_LIMIT,
      include: { actor: { select: ACTOR_SELECT } },
    });
    const own: ContentRevisionDto[] = rows.map((row) => ({
      id: row.id,
      source: 'site',
      createdAt: row.createdAt.toISOString(),
      label: row.label,
      actor: row.actor,
      data: isRecord(row.data) ? row.data : {},
    }));
    const external =
      resourceType === ContentResourceType.ENTRY ? await this.contentfulSnapshots(resourceId) : [];
    return [...own, ...external]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, CONTENT_REVISION_LIMIT);
  }

  async find(resourceType: ContentResourceType, resourceId: string, revisionId: string) {
    if (revisionId.startsWith(CONTENTFUL_PREFIX)) {
      if (resourceType !== ContentResourceType.ENTRY) {
        throw new NotFoundException('The version was not found');
      }
      const snapshot = await this.contentful
        .request<CmaSnapshot>(
          'management',
          `/entries/${resourceId}/snapshots/${revisionId.slice(CONTENTFUL_PREFIX.length)}`,
        )
        .catch(() => null);
      const fields = snapshot?.snapshot?.fields;
      if (!isRecord(fields)) throw new NotFoundException('The version was not found');
      return fields;
    }
    const row = await this.prisma.contentRevision.findFirst({
      where: { id: revisionId, resourceType, resourceId },
    });
    if (!row || !isRecord(row.data)) throw new NotFoundException('The version was not found');
    return row.data;
  }

  private async contentfulSnapshots(entryId: string): Promise<ContentRevisionDto[]> {
    try {
      const page = await this.contentful.request<{ items: CmaSnapshot[] }>(
        'management',
        `/entries/${entryId}/snapshots`,
        { query: { limit: String(CONTENT_REVISION_LIMIT) } },
      );
      return page.items.flatMap((item) =>
        isRecord(item.snapshot?.fields)
          ? [
              {
                id: `${CONTENTFUL_PREFIX}${item.sys.id}`,
                source: 'contentful' as const,
                createdAt: item.sys.createdAt,
                label: null,
                actor: null,
                data: item.snapshot.fields,
              },
            ]
          : [],
      );
    } catch (error) {
      this.logger.warn(`Contentful versions of ${entryId} are unavailable: ${String(error)}`);
      return [];
    }
  }
}

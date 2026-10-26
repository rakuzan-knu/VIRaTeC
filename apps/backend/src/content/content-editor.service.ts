import { setTimeout as sleep } from 'node:timers/promises';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ContentResourceType, type ContentChange, type Prisma } from '@prisma/client';
import {
  CONTENT_EDITOR_LIMITS,
  type ContentAssetDto,
  type ContentAssetMimeType,
  type ContentChangeDto,
  type ContentEntryDto,
  type ContentFields,
  type ContentReferenceDto,
  type PublishContentResultDto,
} from '@viratec/contracts';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../security/audit.service';
import type { ClientContext } from '../common/decorators/client-context.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { ContentService } from './content.service';
import { ContentfulClient, ContentfulRequestError } from './contentful.client';
import {
  RecordEditorService,
  RecordPublishError,
  recordResourceOfChange,
} from './record-editor.service';
import type {
  CreateContentEntryDto,
  PublishContentDto,
  SaveContentEntryDto,
  UploadContentAssetDto,
} from './dto/content-editor.dto';

const PROCESS_ATTEMPTS = 20;
const PROCESS_DELAY_MS = 500;
const REFERENCES_LIMIT = 20;
const DATA_URL_PATTERN = /^data:([a-z]+\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/]+={0,2})$/;
const FIELD_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;

interface CmaSys {
  id: string;
  version: number;
  publishedVersion?: number;
  updatedAt: string;
  contentType?: { sys: { id: string } };
}

interface CmaResource {
  sys: CmaSys;
  fields?: ContentFields;
}

interface CmaAsset extends CmaResource {
  fields?: ContentFields & {
    file?: Record<string, { url?: string; contentType?: string; fileName?: string }>;
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const sameValue = (left: unknown, right: unknown) =>
  JSON.stringify(left ?? null) === JSON.stringify(right ?? null);

const publishOrder = (change: ContentChange) => {
  if (recordResourceOfChange(change)) return 3;
  return change.resourceType === ContentResourceType.ASSET ? 0 : change.isNew ? 1 : 2;
};

@Injectable()
export class ContentEditorService {
  constructor(
    private readonly contentful: ContentfulClient,
    private readonly content: ContentService,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly records: RecordEditorService,
  ) {}

  private get locales() {
    return this.contentful.config.locales;
  }

  private async cma<T>(subject: string, run: () => Promise<T>): Promise<T> {
    try {
      return await run();
    } catch (error) {
      throw this.contentful.toHttpError(error, subject);
    }
  }

  private validateFields(fields: unknown): ContentFields {
    if (!isRecord(fields)) throw new BadRequestException('Fields must be an object');
    const allowedLocales = new Set(Object.values(this.locales));
    for (const [fieldId, values] of Object.entries(fields)) {
      if (!FIELD_ID_PATTERN.test(fieldId) || !isRecord(values)) {
        throw new BadRequestException(`Field ${fieldId} is malformed`);
      }
      const unknownLocale = Object.keys(values).find((locale) => !allowedLocales.has(locale));
      if (unknownLocale) {
        throw new BadRequestException(`Field ${fieldId} has an unknown locale ${unknownLocale}`);
      }
    }
    if (Buffer.byteLength(JSON.stringify(fields)) > CONTENT_EDITOR_LIMITS.maxFieldsBytes) {
      throw new BadRequestException('The entry is too large');
    }
    return fields as ContentFields;
  }

  private toEntry(resource: CmaResource): ContentEntryDto {
    return {
      id: resource.sys.id,
      contentTypeId: resource.sys.contentType?.sys.id ?? '',
      version: resource.sys.version,
      publishedVersion: resource.sys.publishedVersion ?? null,
      updatedAt: resource.sys.updatedAt,
      fields: resource.fields ?? {},
      locales: this.locales,
    };
  }

  private async trackChange(
    actor: AuthenticatedUser,
    resourceType: ContentResourceType,
    resourceId: string,
    data: { contentTypeId?: string; label?: string; isNew?: boolean; fieldIds: string[] },
  ) {
    const existing = await this.prisma.contentChange.findUnique({
      where: { resourceType_resourceId: { resourceType, resourceId } },
    });
    const fieldIds = [...new Set([...(existing?.fieldIds ?? []), ...data.fieldIds])];
    await this.prisma.contentChange.upsert({
      where: { resourceType_resourceId: { resourceType, resourceId } },
      create: {
        resourceType,
        resourceId,
        contentTypeId: data.contentTypeId ?? null,
        label: data.label ?? null,
        isNew: data.isNew ?? false,
        fieldIds,
        actorId: actor.id,
      },
      update: {
        fieldIds,
        actorId: actor.id,
        ...(data.label ? { label: data.label } : {}),
      },
    });
  }

  getEntry(id: string): Promise<ContentEntryDto> {
    return this.cma(`Entry ${id}`, async () =>
      this.toEntry(await this.contentful.request<CmaResource>('management', `/entries/${id}`)),
    );
  }

  getReferences(id: string): Promise<ContentReferenceDto[]> {
    return this.cma(`References of ${id}`, async () => {
      const page = await this.contentful.request<{ items: CmaResource[] }>(
        'management',
        '/entries',
        { query: { links_to_entry: id, limit: String(REFERENCES_LIMIT) } },
      );
      return page.items.map((item) => ({
        id: item.sys.id,
        contentTypeId: item.sys.contentType?.sys.id ?? '',
        fields: item.fields ?? {},
      }));
    });
  }

  async saveEntry(
    actor: AuthenticatedUser,
    id: string,
    dto: SaveContentEntryDto,
    client: ClientContext,
  ): Promise<ContentEntryDto> {
    const fields = this.validateFields(dto.fields);
    const current = await this.cma(`Entry ${id}`, () =>
      this.contentful.request<CmaResource>('management', `/entries/${id}`),
    );
    if (current.sys.version !== dto.version) {
      throw this.contentful.toHttpError(new ContentfulRequestError(409, 'version'), `Entry ${id}`);
    }
    const previous = current.fields ?? {};
    const fieldIds = [...new Set([...Object.keys(previous), ...Object.keys(fields)])].filter(
      (fieldId) => !sameValue(previous[fieldId], fields[fieldId]),
    );
    if (fieldIds.length === 0) return this.toEntry(current);

    const saved = await this.cma(`Entry ${id}`, () =>
      this.contentful.request<CmaResource>('management', `/entries/${id}`, {
        method: 'PUT',
        version: dto.version,
        body: { fields },
      }),
    );
    const contentTypeId = saved.sys.contentType?.sys.id;
    await this.trackChange(actor, ContentResourceType.ENTRY, id, {
      contentTypeId,
      label: dto.label,
      fieldIds,
    });
    await this.audit.record({
      action: 'content.entry_saved',
      actorId: actor.id,
      targetType: 'contentEntry',
      targetId: id,
      metadata: JSON.parse(
        JSON.stringify({
          contentTypeId: contentTypeId ?? null,
          fieldIds,
          before: Object.fromEntries(
            fieldIds.map((fieldId) => [fieldId, previous[fieldId] ?? null]),
          ),
          after: Object.fromEntries(fieldIds.map((fieldId) => [fieldId, fields[fieldId] ?? null])),
        }),
      ) as Prisma.InputJsonObject,
      client,
    });
    return this.toEntry(saved);
  }

  async createEntry(
    actor: AuthenticatedUser,
    dto: CreateContentEntryDto,
    client: ClientContext,
  ): Promise<ContentEntryDto> {
    const fields = this.validateFields(dto.fields);
    const entry = await this.cma(`New ${dto.contentTypeId}`, () =>
      this.contentful.request<CmaResource>('management', '/entries', {
        method: 'POST',
        contentTypeId: dto.contentTypeId,
        body: { fields },
      }),
    );
    await this.trackChange(actor, ContentResourceType.ENTRY, entry.sys.id, {
      contentTypeId: dto.contentTypeId,
      label: dto.label,
      isNew: true,
      fieldIds: Object.keys(fields),
    });
    await this.audit.record({
      action: 'content.entry_created',
      actorId: actor.id,
      targetType: 'contentEntry',
      targetId: entry.sys.id,
      metadata: { contentTypeId: dto.contentTypeId },
      client,
    });
    return this.toEntry(entry);
  }

  getAsset(id: string): Promise<ContentAssetDto> {
    return this.cma(`Image ${id}`, async () => {
      const asset = await this.contentful.request<CmaAsset>('management', `/assets/${id}`);
      const locale = this.locales.en;
      const title = asset.fields?.title?.[locale];
      return {
        id: asset.sys.id,
        url: asset.fields?.file?.[locale]?.url ? `https:${asset.fields.file[locale].url}` : '',
        title: typeof title === 'string' ? title : '',
      };
    });
  }

  async uploadAsset(
    actor: AuthenticatedUser,
    dto: UploadContentAssetDto,
    client: ClientContext,
  ): Promise<ContentAssetDto> {
    const match = DATA_URL_PATTERN.exec(dto.data);
    const mimeType = match?.[1];
    const isAllowed = (value: string | undefined): value is ContentAssetMimeType =>
      CONTENT_EDITOR_LIMITS.assetMimeTypes.some((allowed) => allowed === value);
    if (!match?.[2] || !isAllowed(mimeType)) {
      throw new BadRequestException('Upload a PNG, JPEG, WebP or SVG image');
    }
    const binary = Buffer.from(match[2], 'base64');
    if (binary.length === 0 || binary.length > CONTENT_EDITOR_LIMITS.maxAssetBytes) {
      throw new BadRequestException('The image is too large');
    }

    const locale = this.locales.en;
    const asset = await this.cma('Image upload', async () => {
      const upload = await this.contentful.request<{ sys: { id: string } }>('upload', '/uploads', {
        method: 'POST',
        binary,
      });
      const created = await this.contentful.request<CmaAsset>('management', '/assets', {
        method: 'POST',
        body: {
          fields: {
            title: { [locale]: dto.title },
            file: {
              [locale]: {
                contentType: mimeType,
                fileName: dto.fileName,
                uploadFrom: { sys: { type: 'Link', linkType: 'Upload', id: upload.sys.id } },
              },
            },
          },
        },
      });
      await this.contentful.request(
        'management',
        `/assets/${created.sys.id}/files/${locale}/process`,
        {
          method: 'PUT',
          version: created.sys.version,
        },
      );
      for (let attempt = 0; attempt < PROCESS_ATTEMPTS; attempt += 1) {
        const current = await this.contentful.request<CmaAsset>(
          'management',
          `/assets/${created.sys.id}`,
        );
        if (current.fields?.file?.[locale]?.url) return current;
        await sleep(PROCESS_DELAY_MS);
      }
      throw new UnprocessableEntityException('The image could not be processed');
    });

    await this.trackChange(actor, ContentResourceType.ASSET, asset.sys.id, {
      label: dto.title,
      isNew: true,
      fieldIds: ['file'],
    });
    await this.audit.record({
      action: 'content.asset_uploaded',
      actorId: actor.id,
      targetType: 'contentAsset',
      targetId: asset.sys.id,
      metadata: { fileName: dto.fileName, bytes: binary.length },
      client,
    });
    return {
      id: asset.sys.id,
      url: `https:${asset.fields?.file?.[locale]?.url ?? ''}`,
      title: dto.title,
    };
  }

  async listChanges(): Promise<ContentChangeDto[]> {
    const changes = await this.prisma.contentChange.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { actor: { select: { id: true, name: true } } },
    });
    return changes.map((change) => ({
      id: change.id,
      resourceType: change.resourceType,
      resourceId: change.resourceId,
      contentTypeId: change.contentTypeId,
      label: change.label,
      isNew: change.isNew,
      isDeleted: change.isDeleted,
      fieldIds: change.fieldIds,
      actor: change.actor,
      updatedAt: change.updatedAt.toISOString(),
    }));
  }

  async discardChange(actor: AuthenticatedUser, changeId: string, client: ClientContext) {
    const change = await this.prisma.contentChange.findUnique({ where: { id: changeId } });
    if (!change) throw new NotFoundException('The change was not found');
    const isAsset = change.resourceType === ContentResourceType.ASSET;
    const recordResource = recordResourceOfChange(change);
    const path = `/${isAsset ? 'assets' : 'entries'}/${change.resourceId}`;

    await this.cma(change.label ?? change.resourceId, async () => {
      if (recordResource) return;
      const current = await this.contentful
        .request<CmaResource>('management', path)
        .catch((error: unknown) => {
          if (error instanceof ContentfulRequestError && error.status === 404) return undefined;
          throw error;
        });
      if (!current) return;
      if (!current.sys.publishedVersion) {
        await this.contentful.request('management', path, {
          method: 'DELETE',
          version: current.sys.version,
        });
        return;
      }
      const published = await this.contentful.request<CmaResource>('delivery', path, {
        query: { locale: '*' },
      });
      await this.contentful.request('management', path, {
        method: 'PUT',
        version: current.sys.version,
        body: { fields: published.fields ?? {} },
      });
    });

    await this.prisma.contentChange.delete({ where: { id: change.id } });
    await this.audit.record({
      action: 'content.change_discarded',
      actorId: actor.id,
      targetType: recordResource ?? (isAsset ? 'contentAsset' : 'contentEntry'),
      targetId: change.resourceId,
      metadata: { label: change.label, fieldIds: change.fieldIds },
      client,
    });
    return { success: true };
  }

  async publish(
    actor: AuthenticatedUser,
    dto: PublishContentDto,
    client: ClientContext,
  ): Promise<PublishContentResultDto> {
    const changes = await this.prisma.contentChange.findMany({
      where: dto.changeIds ? { id: { in: dto.changeIds } } : undefined,
      orderBy: { createdAt: 'asc' },
      take: CONTENT_EDITOR_LIMITS.maxPublishBatch,
    });
    const ordered = [...changes].sort((a, b) => publishOrder(a) - publishOrder(b));
    const result: PublishContentResultDto = { published: [], failed: [] };

    for (const change of ordered) {
      const path = `/${change.resourceType === ContentResourceType.ASSET ? 'assets' : 'entries'}/${change.resourceId}`;
      try {
        if (recordResourceOfChange(change)) {
          await this.records.applyChange(change);
          result.published.push(change.id);
          continue;
        }
        const current = await this.contentful.request<CmaResource>('management', path);
        await this.contentful.request('management', `${path}/published`, {
          method: 'PUT',
          version: current.sys.version,
        });
        await this.prisma.contentChange.delete({ where: { id: change.id } });
        result.published.push(change.id);
      } catch (error) {
        const reason =
          error instanceof ContentfulRequestError
            ? error.detail
            : error instanceof RecordPublishError
              ? error.message
              : 'The change could not be published';
        result.failed.push({ changeId: change.id, label: change.label, reason });
      }
    }

    if (result.published.length > 0) await this.content.invalidate();
    await this.audit.record({
      action: 'content.published',
      actorId: actor.id,
      targetType: 'content',
      metadata: {
        published: ordered
          .filter((change) => result.published.includes(change.id))
          .map((change) => ({ id: change.resourceId, label: change.label })),
        failed: result.failed.length,
      },
      client,
    });
    return result;
  }
}

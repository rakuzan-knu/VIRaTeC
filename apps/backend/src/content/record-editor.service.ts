import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentResourceType, Prisma, type ContentChange } from '@prisma/client';
import {
  AdminPermission,
  CONTENT_EDITOR_LIMITS,
  EventType,
  FacultyDivision,
  ProjectStatus,
  PublicationType,
  EventTranslationsSchema,
  ProjectTranslationsSchema,
  PublicationContentSchema,
  RECORD_SCHEMAS,
  missingRequiredFields,
  type EventRecordData,
  type ProjectRecordData,
  type PublicationRecordData,
  type RecordData,
  type RecordDraftDto,
  type RecordDto,
  type RecordResource,
} from '@viratec/contracts';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../security/audit.service';
import { ProjectsService } from '../projects/projects.service';
import { EventsService } from '../events/events.service';
import { PublicationsService } from '../publications/publications.service';
import type { ClientContext } from '../common/decorators/client-context.decorator';
import type { AuthenticatedUser } from '../security/authenticated-user';
import type { CreateRecordDto, SaveRecordDto } from './dto/record-editor.dto';

export const RECORD_RESOURCE_TYPES: Record<RecordResource, ContentResourceType> = {
  project: ContentResourceType.PROJECT,
  event: ContentResourceType.EVENT,
  publication: ContentResourceType.PUBLICATION,
};

const RESOURCE_BY_TYPE: Partial<Record<ContentResourceType, RecordResource>> = {
  [ContentResourceType.PROJECT]: 'project',
  [ContentResourceType.EVENT]: 'event',
  [ContentResourceType.PUBLICATION]: 'publication',
};

export const recordResourceOfChange = (change: ContentChange) =>
  RESOURCE_BY_TYPE[change.resourceType] ?? null;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface PublishedRecord {
  data: RecordData;
  updatedAt: Date;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const leafPaths = (value: unknown, prefix = ''): Map<string, string> => {
  const paths = new Map<string, string>();
  if (isRecord(value)) {
    for (const [key, child] of Object.entries(value)) {
      for (const [path, serialized] of leafPaths(child, prefix ? `${prefix}.${key}` : key)) {
        paths.set(path, serialized);
      }
    }
  } else {
    paths.set(prefix, JSON.stringify(value ?? null));
  }
  return paths;
};

const changedPaths = (before: RecordData | null, after: RecordData) => {
  const left = leafPaths(before ?? {});
  const right = leafPaths(after);
  return [...new Set([...left.keys(), ...right.keys()])].filter(
    (path) => left.get(path) !== right.get(path),
  );
};

export class RecordPublishError extends Error {}

@Injectable()
export class RecordEditorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly projects: ProjectsService,
    private readonly events: EventsService,
    private readonly publications: PublicationsService,
  ) {}

  private assertCanEdit(user: AuthenticatedUser, resource: RecordResource) {
    const allowed =
      user.permissions.includes(AdminPermission.CONTENT_EDIT) ||
      (resource === 'event' && user.permissions.includes(AdminPermission.EVENTS_MANAGE));
    if (!allowed) {
      throw new ForbiddenException({
        message: 'You do not have permission to perform this action',
        code: 'PERMISSION_DENIED',
      });
    }
  }

  private parseData(resource: RecordResource, data: unknown): RecordData {
    if (Buffer.byteLength(JSON.stringify(data ?? null)) > CONTENT_EDITOR_LIMITS.maxFieldsBytes) {
      throw new BadRequestException('The record is too large');
    }
    const parsed = RECORD_SCHEMAS[resource].safeParse(data);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw new BadRequestException(
        `${issue?.path.join('.') || 'record'}: ${issue?.message ?? 'invalid value'}`,
      );
    }
    return parsed.data as RecordData;
  }

  private findChange(resource: RecordResource, key: string) {
    return this.prisma.contentChange.findUnique({
      where: {
        resourceType_resourceId: { resourceType: RECORD_RESOURCE_TYPES[resource], resourceId: key },
      },
    });
  }

  private async readPublished(
    resource: RecordResource,
    key: string,
    client: Prisma.TransactionClient = this.prisma,
  ): Promise<PublishedRecord | null> {
    if (resource === 'publication') {
      const publication = await client.publication.findUnique({ where: { slug: key } });
      if (!publication) return null;
      const data: PublicationRecordData = {
        slug: publication.slug,
        type: PublicationType[publication.type],
        year: publication.year,
        position: publication.position,
        isFeatured: publication.isFeatured,
        readMoreLink: publication.readMoreLink,
        coverKey: publication.coverKey,
        sourceUrl: publication.sourceUrl,
        pdfUrl: publication.pdfUrl,
        detailSource: publication.detailSource,
        content: PublicationContentSchema.parse(publication.content),
      };
      return { data, updatedAt: publication.updatedAt };
    }
    if (!UUID_PATTERN.test(key)) return null;

    if (resource === 'project') {
      const project = await client.project.findUnique({ where: { id: key } });
      if (!project) return null;
      const fallback = { title: project.title, description: project.description };
      const data: ProjectRecordData = {
        status: ProjectStatus[project.status],
        faculties: project.faculties.map((faculty) => FacultyDivision[faculty]),
        tags: project.tags,
        repositoryUrl: project.repositoryUrl,
        demoUrl: project.demoUrl,
        coverUrl: project.coverUrl,
        translations: project.translations
          ? ProjectTranslationsSchema.parse(project.translations)
          : { en: fallback, uk: fallback },
      };
      return { data, updatedAt: project.updatedAt };
    }

    const event = await client.event.findUnique({ where: { id: key } });
    if (!event) return null;
    const fallback = {
      meta: '',
      title: event.title,
      description: event.description,
      actionLabel: '',
    };
    const data: EventRecordData = {
      type: EventType[event.type],
      faculty: FacultyDivision[event.faculty],
      location: event.location,
      isOnline: event.isOnline,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      capacity: event.capacity,
      registrationLink: event.registrationLink,
      translations: event.translations
        ? EventTranslationsSchema.parse(event.translations)
        : { en: fallback, uk: fallback },
    };
    return { data, updatedAt: event.updatedAt };
  }

  async listDrafts(): Promise<RecordDraftDto[]> {
    const changes = await this.prisma.contentChange.findMany({
      where: { resourceType: { in: Object.values(RECORD_RESOURCE_TYPES) } },
      orderBy: { createdAt: 'asc' },
    });
    return changes.flatMap((change) => {
      const resource = recordResourceOfChange(change);
      if (!resource || !isRecord(change.draft)) return [];
      return [
        {
          resource,
          key: change.resourceId,
          isNew: change.isNew,
          isDeleted: change.isDeleted,
          data: change.draft,
        },
      ];
    });
  }

  async getRecord(resource: RecordResource, key: string): Promise<RecordDto> {
    const [change, published] = await Promise.all([
      this.findChange(resource, key),
      this.readPublished(resource, key),
    ]);
    if (!published && !change?.isNew) throw new NotFoundException('The record was not found');
    const draft = isRecord(change?.draft) ? change.draft : null;
    return {
      resource,
      key,
      data: draft ?? published?.data ?? {},
      published: published?.data ?? null,
      updatedAt: published?.updatedAt.toISOString() ?? null,
      hasDraft: Boolean(change),
      isNew: change?.isNew ?? false,
      isDeleted: change?.isDeleted ?? false,
    };
  }

  async saveRecord(
    actor: AuthenticatedUser,
    resource: RecordResource,
    key: string,
    dto: SaveRecordDto,
    client: ClientContext,
  ): Promise<RecordDto> {
    this.assertCanEdit(actor, resource);
    const data = this.parseData(resource, dto.data);
    const [change, published] = await Promise.all([
      this.findChange(resource, key),
      this.readPublished(resource, key),
    ]);
    if (!published && !change?.isNew) throw new NotFoundException('The record was not found');
    if (resource === 'publication' && data.slug !== key) {
      throw new BadRequestException('The address of a publication cannot change');
    }
    if (published && !change && dto.baseUpdatedAt !== published.updatedAt.toISOString()) {
      throw new ConflictException({
        message: 'The record was changed by someone else. Reload it and try again.',
        code: 'CONTENT_VERSION_CONFLICT',
      });
    }

    const fieldIds = changedPaths(published?.data ?? null, data);
    if (published && fieldIds.length === 0) {
      if (change) await this.prisma.contentChange.delete({ where: { id: change.id } });
      return this.getRecord(resource, key);
    }

    await this.prisma.contentChange.upsert({
      where: {
        resourceType_resourceId: { resourceType: RECORD_RESOURCE_TYPES[resource], resourceId: key },
      },
      create: {
        resourceType: RECORD_RESOURCE_TYPES[resource],
        resourceId: key,
        contentTypeId: resource,
        label: dto.label ?? null,
        fieldIds,
        draft: data as Prisma.InputJsonObject,
        baseUpdatedAt: published?.updatedAt ?? null,
        actorId: actor.id,
      },
      update: {
        fieldIds,
        draft: data as Prisma.InputJsonObject,
        isDeleted: false,
        actorId: actor.id,
        ...(dto.label ? { label: dto.label } : {}),
      },
    });
    await this.audit.record({
      action: 'content.record_saved',
      actorId: actor.id,
      targetType: resource,
      targetId: key,
      metadata: { fieldIds },
      client,
    });
    return this.getRecord(resource, key);
  }

  async createRecord(
    actor: AuthenticatedUser,
    resource: RecordResource,
    dto: CreateRecordDto,
    client: ClientContext,
  ): Promise<RecordDto> {
    this.assertCanEdit(actor, resource);
    const data = this.parseData(resource, dto.data);
    const key = resource === 'publication' ? String(data.slug) : randomUUID();
    if (resource === 'publication') {
      const [published, change] = await Promise.all([
        this.readPublished(resource, key),
        this.findChange(resource, key),
      ]);
      if (published || change) {
        throw new ConflictException({
          message: 'A publication with this address already exists',
          code: 'RECORD_EXISTS',
        });
      }
    }

    await this.prisma.contentChange.create({
      data: {
        resourceType: RECORD_RESOURCE_TYPES[resource],
        resourceId: key,
        contentTypeId: resource,
        label: dto.label ?? null,
        isNew: true,
        fieldIds: changedPaths(null, data),
        draft: data as Prisma.InputJsonObject,
        actorId: actor.id,
      },
    });
    await this.audit.record({
      action: 'content.record_created',
      actorId: actor.id,
      targetType: resource,
      targetId: key,
      client,
    });
    return this.getRecord(resource, key);
  }

  async deleteRecord(
    actor: AuthenticatedUser,
    resource: RecordResource,
    key: string,
    label: string | undefined,
    client: ClientContext,
  ) {
    this.assertCanEdit(actor, resource);
    const [change, published] = await Promise.all([
      this.findChange(resource, key),
      this.readPublished(resource, key),
    ]);
    if (change?.isNew) {
      await this.prisma.contentChange.delete({ where: { id: change.id } });
    } else if (published) {
      await this.prisma.contentChange.upsert({
        where: {
          resourceType_resourceId: {
            resourceType: RECORD_RESOURCE_TYPES[resource],
            resourceId: key,
          },
        },
        create: {
          resourceType: RECORD_RESOURCE_TYPES[resource],
          resourceId: key,
          contentTypeId: resource,
          label: label ?? null,
          isDeleted: true,
          draft: published.data as Prisma.InputJsonObject,
          baseUpdatedAt: published.updatedAt,
          actorId: actor.id,
        },
        update: {
          isDeleted: true,
          draft: published.data as Prisma.InputJsonObject,
          fieldIds: [],
          actorId: actor.id,
        },
      });
    } else {
      throw new NotFoundException('The record was not found');
    }
    await this.audit.record({
      action: 'content.record_deleted',
      actorId: actor.id,
      targetType: resource,
      targetId: key,
      metadata: { draftOnly: Boolean(change?.isNew) },
      client,
    });
    return { success: true };
  }

  async applyChange(change: ContentChange) {
    const resource = recordResourceOfChange(change);
    if (!resource) throw new RecordPublishError('Unknown record type');
    const key = change.resourceId;
    const data = RECORD_SCHEMAS[resource].safeParse(change.draft);
    if (!data.success)
      throw new RecordPublishError('The draft is invalid. Open it and save again.');
    if (!change.isDeleted) {
      const missing = missingRequiredFields(resource, data.data as RecordData);
      if (missing.length > 0) {
        throw new RecordPublishError(`Fill in the required fields: ${missing.join(', ')}`);
      }
    }

    await this.prisma.$transaction(async (tx) => {
      const current = await this.readPublished(resource, key, tx);
      if (
        change.isNew ? current : current?.updatedAt.getTime() !== change.baseUpdatedAt?.getTime()
      ) {
        throw new RecordPublishError(
          'The record was changed after this draft was saved. Discard the draft and edit again.',
        );
      }

      if (resource === 'project') {
        const record = data.data as ProjectRecordData;
        const fields = {
          title: record.translations.en.title,
          description: record.translations.en.description,
          status: record.status,
          faculties: record.faculties,
          tags: record.tags,
          repositoryUrl: record.repositoryUrl,
          demoUrl: record.demoUrl,
          coverUrl: record.coverUrl,
          translations: record.translations,
        };
        if (change.isDeleted) await tx.project.delete({ where: { id: key } });
        else if (change.isNew) await tx.project.create({ data: { id: key, ...fields } });
        else await tx.project.update({ where: { id: key }, data: fields });
      } else if (resource === 'event') {
        const record = data.data as EventRecordData;
        const fields = {
          title: record.translations.en.title,
          description: record.translations.en.description,
          type: record.type,
          faculty: record.faculty,
          location: record.location,
          isOnline: record.isOnline,
          startDate: new Date(record.startDate),
          endDate: new Date(record.endDate),
          capacity: record.capacity,
          registrationLink: record.registrationLink,
          translations: record.translations,
        };
        if (change.isDeleted) await tx.event.delete({ where: { id: key } });
        else if (change.isNew) await tx.event.create({ data: { id: key, ...fields } });
        else await tx.event.update({ where: { id: key }, data: fields });
      } else {
        const record = data.data as PublicationRecordData;
        const { slug: _slug, content, ...rest } = record;
        const fields = { ...rest, content: content as Prisma.InputJsonObject };
        if (change.isDeleted) await tx.publication.delete({ where: { slug: key } });
        else if (change.isNew) await tx.publication.create({ data: { slug: key, ...fields } });
        else await tx.publication.update({ where: { slug: key }, data: fields });
      }

      await tx.contentChange.delete({ where: { id: change.id } });
    });

    this.clearCache(resource);
  }

  private clearCache(resource: RecordResource) {
    if (resource === 'project') this.projects.clearCache();
    else if (resource === 'event') this.events.clearCache();
    else this.publications.clearCache();
  }
}

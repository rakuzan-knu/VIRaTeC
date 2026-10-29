import { z } from 'zod';
import { EventType, FacultyDivision, ProjectStatus, PublicationType } from './enums.js';
import { EventTextSchema } from './events.js';
import { ProjectTextSchema } from './projects.js';
import { PublicationContentSchema } from './publications.js';

export const RECORD_RESOURCES = ['project', 'event', 'publication'] as const;

export type RecordResource = (typeof RECORD_RESOURCES)[number];

export const isRecordResource = (value: unknown): value is RecordResource =>
  RECORD_RESOURCES.some((resource) => resource === value);

export const RECORD_TYPE_PREFIX = 'db:';

export const recordTypeId = (resource: RecordResource) => `${RECORD_TYPE_PREFIX}${resource}`;

export const recordResourceOf = (typeId: string | null | undefined): RecordResource | null => {
  const resource = typeId?.startsWith(RECORD_TYPE_PREFIX)
    ? typeId.slice(RECORD_TYPE_PREFIX.length)
    : null;
  return isRecordResource(resource) ? resource : null;
};

export const LOCALE_PLACEHOLDER = '{locale}';

export type RecordFieldKind =
  | 'text'
  | 'longText'
  | 'url'
  | 'integer'
  | 'boolean'
  | 'dateTime'
  | 'enum'
  | 'enumList'
  | 'stringList'
  | 'blocks';

export interface RecordFieldDefinition {
  path: string;
  name: string;
  kind: RecordFieldKind;
  localized?: boolean;
  required?: boolean;
  createOnly?: boolean;
  options?: readonly string[];
  help?: string;
}

export interface RecordDefinition {
  resource: RecordResource;
  name: string;
  displayPath: string;
  fields: readonly RecordFieldDefinition[];
}

const localized = (
  path: string,
  name: string,
  kind: RecordFieldKind,
  options: Partial<RecordFieldDefinition> = {},
): RecordFieldDefinition => ({ path, name, kind, localized: true, ...options });

export const RECORD_DEFINITIONS: Record<RecordResource, RecordDefinition> = {
  project: {
    resource: 'project',
    name: 'Project',
    displayPath: 'translations.{locale}.title',
    fields: [
      localized('translations.{locale}.title', 'Title', 'text', { required: true }),
      localized('translations.{locale}.description', 'Description', 'longText', {
        required: true,
      }),
      { path: 'status', name: 'Status', kind: 'enum', options: Object.values(ProjectStatus) },
      {
        path: 'faculties',
        name: 'Faculties',
        kind: 'enumList',
        options: Object.values(FacultyDivision),
      },
      { path: 'tags', name: 'Tags', kind: 'stringList', help: 'Tags filter the project list.' },
      { path: 'repositoryUrl', name: 'Repository URL', kind: 'url' },
      { path: 'demoUrl', name: 'Demo URL', kind: 'url' },
    ],
  },
  event: {
    resource: 'event',
    name: 'Event',
    displayPath: 'translations.{locale}.title',
    fields: [
      localized('translations.{locale}.title', 'Title', 'text', { required: true }),
      localized('translations.{locale}.description', 'Description', 'longText', {
        required: true,
      }),
      localized('translations.{locale}.meta', 'Meta line', 'text', {
        help: 'Small line above the title, e.g. the date and the place.',
      }),
      localized('translations.{locale}.actionLabel', 'Button label', 'text'),
      { path: 'type', name: 'Type', kind: 'enum', options: Object.values(EventType) },
      { path: 'faculty', name: 'Faculty', kind: 'enum', options: Object.values(FacultyDivision) },
      { path: 'location', name: 'Location', kind: 'text', required: true },
      { path: 'isOnline', name: 'Online', kind: 'boolean' },
      { path: 'startDate', name: 'Starts', kind: 'dateTime', required: true },
      {
        path: 'endDate',
        name: 'Ends',
        kind: 'dateTime',
        required: true,
        help: 'The event leaves the upcoming list after this date.',
      },
      { path: 'capacity', name: 'Capacity', kind: 'integer' },
      { path: 'registrationLink', name: 'Registration link', kind: 'url' },
    ],
  },
  publication: {
    resource: 'publication',
    name: 'Publication',
    displayPath: 'content.{locale}.title',
    fields: [
      {
        path: 'slug',
        name: 'Address',
        kind: 'text',
        required: true,
        createOnly: true,
        help: 'Part of the page address, e.g. ai-in-education. Cannot change after publishing.',
      },
      localized('content.{locale}.title', 'Title', 'text', { required: true }),
      localized('content.{locale}.excerpt', 'Excerpt', 'longText', { required: true }),
      localized('content.{locale}.source', 'Source', 'text', { required: true }),
      { path: 'type', name: 'Type', kind: 'enum', options: Object.values(PublicationType) },
      { path: 'year', name: 'Year', kind: 'integer', required: true },
      {
        path: 'position',
        name: 'Position',
        kind: 'integer',
        required: true,
        help: 'Lists are sorted by this number, smallest first.',
      },
      { path: 'isFeatured', name: 'Featured', kind: 'boolean' },
      { path: 'readMoreLink', name: 'Show "Read more"', kind: 'boolean' },
      { path: 'sourceUrl', name: 'Source URL', kind: 'url' },
      { path: 'pdfUrl', name: 'PDF URL', kind: 'url' },
      { path: 'coverKey', name: 'Cover image key', kind: 'text' },
      { path: 'detailSource', name: 'Detail source', kind: 'text' },
      localized('content.{locale}.detail.heroTitle', 'Detail title', 'text'),
      localized('content.{locale}.detail.heroAccent', 'Detail title accent', 'text'),
      localized('content.{locale}.detail.lead', 'Detail lead', 'longText'),
      localized('content.{locale}.detail.formatLabel', 'Format label', 'text'),
      localized('content.{locale}.detail.kindLabel', 'Kind label', 'text'),
      localized('content.{locale}.detail.publishedOn', 'Published on', 'text'),
      localized('content.{locale}.detail.readTime', 'Read time', 'text'),
      localized('content.{locale}.detail.authors', 'Authors', 'text'),
      localized('content.{locale}.detail.sourceLabel', 'Source label', 'text'),
      localized('content.{locale}.detail.blocks', 'Article', 'blocks'),
    ],
  },
};

const optionalUrl = z.union([
  z
    .string()
    .url()
    .max(2048)
    .regex(/^https?:\/\//i),
  z.null(),
]);

export const ProjectRecordSchema = z.object({
  status: z.nativeEnum(ProjectStatus),
  faculties: z.array(z.nativeEnum(FacultyDivision)).max(10),
  tags: z.array(z.string().max(64)).max(30),
  repositoryUrl: optionalUrl,
  demoUrl: optionalUrl,
  translations: z.object({ en: ProjectTextSchema, uk: ProjectTextSchema }),
});

export const EventRecordSchema = z.object({
  type: z.nativeEnum(EventType),
  faculty: z.nativeEnum(FacultyDivision),
  location: z.string().max(300),
  isOnline: z.boolean(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  capacity: z.number().int().positive().max(1_000_000).nullable(),
  registrationLink: optionalUrl,
  translations: z.object({ en: EventTextSchema, uk: EventTextSchema }),
});

export const PublicationRecordSchema = z.object({
  slug: z
    .string()
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  type: z.nativeEnum(PublicationType),
  year: z.number().int().min(1900).max(2200),
  position: z.number().int().min(0).max(100_000),
  isFeatured: z.boolean(),
  readMoreLink: z.boolean(),
  coverKey: z.string().max(200).nullable(),
  sourceUrl: optionalUrl,
  pdfUrl: optionalUrl,
  detailSource: z.string().max(2048).nullable(),
  content: PublicationContentSchema,
});

export const RECORD_SCHEMAS = {
  project: ProjectRecordSchema,
  event: EventRecordSchema,
  publication: PublicationRecordSchema,
} as const;

export type ProjectRecordData = z.infer<typeof ProjectRecordSchema>;
export type EventRecordData = z.infer<typeof EventRecordSchema>;
export type PublicationRecordData = z.infer<typeof PublicationRecordSchema>;

export type RecordData = Record<string, unknown>;

export interface RecordDraftDto {
  resource: RecordResource;
  key: string;
  isNew: boolean;
  isDeleted: boolean;
  data: RecordData;
}

export interface RecordDto {
  resource: RecordResource;
  key: string;
  data: RecordData;
  published: RecordData | null;
  updatedAt: string | null;
  hasDraft: boolean;
  isNew: boolean;
  isDeleted: boolean;
}

export interface SaveRecordRequestDto {
  data: RecordData;
  baseUpdatedAt: string | null;
  label?: string;
}

export interface CreateRecordRequestDto {
  data: RecordData;
  label?: string;
}

const readPath = (value: unknown, path: string): unknown =>
  path
    .split('.')
    .reduce<unknown>(
      (node, key) =>
        typeof node === 'object' && node !== null
          ? (node as Record<string, unknown>)[key]
          : undefined,
      value,
    );

export const fieldPaths = (field: RecordFieldDefinition): string[] =>
  field.localized
    ? ['en', 'uk'].map((locale) => field.path.replace(LOCALE_PLACEHOLDER, locale))
    : [field.path];

export const readRecordValue = readPath;

export const missingRequiredFields = (resource: RecordResource, data: RecordData) =>
  RECORD_DEFINITIONS[resource].fields
    .filter((field) => field.required)
    .flatMap(fieldPaths)
    .filter((path) => {
      const value = readPath(data, path);
      return value === null || value === undefined || (typeof value === 'string' && !value.trim());
    });

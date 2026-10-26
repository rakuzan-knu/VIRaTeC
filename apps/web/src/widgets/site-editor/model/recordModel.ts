import {
  EventType,
  FacultyDivision,
  LOCALE_PLACEHOLDER,
  ProjectStatus,
  PublicationType,
  RECORD_DEFINITIONS,
  readRecordValue,
  type RecordData,
  type RecordFieldDefinition,
  type RecordResource,
} from '@viratec/contracts';
import type { Locale } from '@/shared/i18n';

const HOUR_MS = 60 * 60_000;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const writeRecordValue = (data: RecordData, path: string, value: unknown): RecordData => {
  const [key, ...rest] = path.split('.');
  if (!key) return data;
  if (rest.length === 0) return { ...data, [key]: value };
  const child = data[key];
  return { ...data, [key]: writeRecordValue(isObject(child) ? child : {}, rest.join('.'), value) };
};

export const localizedPath = (field: RecordFieldDefinition, locale: Locale) =>
  field.path.replace(LOCALE_PLACEHOLDER, locale);

export const findRecordField = (resource: RecordResource, path: string | undefined) =>
  RECORD_DEFINITIONS[resource].fields.find((field) => field.path === path);

export const recordLabel = (resource: RecordResource, data: RecordData, locale: Locale) => {
  const definition = RECORD_DEFINITIONS[resource];
  const value = readRecordValue(data, definition.displayPath.replace(LOCALE_PLACEHOLDER, locale));
  return typeof value === 'string' && value.trim() ? value.trim() : definition.name;
};

const EMPTY_DETAIL = {
  heroTitle: '',
  heroAccent: '',
  lead: '',
  formatLabel: '',
  kindLabel: '',
  publishedOn: '',
  readTime: '',
  blocks: [],
  authors: '',
  sourceLabel: '',
};

const cleanLists = (resource: RecordResource, data: RecordData) =>
  RECORD_DEFINITIONS[resource].fields
    .filter((field) => field.kind === 'stringList')
    .reduce((current, field) => {
      const value = readRecordValue(current, field.path);
      return Array.isArray(value)
        ? writeRecordValue(
            current,
            field.path,
            value.map((item) => String(item).trim()).filter(Boolean),
          )
        : current;
    }, data);

export const normalizeRecordData = (resource: RecordResource, input: RecordData): RecordData => {
  const data = cleanLists(resource, input);
  if (resource !== 'publication' || !isObject(data.content)) return data;
  const content = Object.fromEntries(
    Object.entries(data.content).map(([locale, text]) => [
      locale,
      isObject(text) && isObject(text.detail)
        ? { ...text, detail: { ...EMPTY_DETAIL, ...text.detail } }
        : text,
    ]),
  );
  return { ...data, content };
};

export const newRecordData = (resource: RecordResource, slug: string): RecordData => {
  if (resource === 'project') {
    return {
      status: ProjectStatus.IDEA,
      faculties: [FacultyDivision.FIT],
      tags: [],
      repositoryUrl: null,
      demoUrl: null,
      translations: {
        en: { title: 'New project', description: '' },
        uk: { title: 'Новий проєкт', description: '' },
      },
    };
  }
  if (resource === 'event') {
    const start = new Date(Date.now() + 24 * HOUR_MS);
    start.setMinutes(0, 0, 0);
    return {
      type: EventType.WORKSHOP,
      faculty: FacultyDivision.FIT,
      location: '',
      isOnline: false,
      startDate: start.toISOString(),
      endDate: new Date(start.getTime() + 2 * HOUR_MS).toISOString(),
      capacity: null,
      registrationLink: null,
      translations: {
        en: { meta: '', title: 'New event', description: '', actionLabel: '' },
        uk: { meta: '', title: 'Нова подія', description: '', actionLabel: '' },
      },
    };
  }
  return {
    slug,
    type: PublicationType.NEWS,
    year: new Date().getFullYear(),
    position: 0,
    isFeatured: false,
    readMoreLink: false,
    coverKey: null,
    sourceUrl: null,
    pdfUrl: null,
    detailSource: null,
    content: {
      en: { title: 'New publication', source: '', excerpt: '' },
      uk: { title: 'Нова публікація', source: '', excerpt: '' },
    },
  };
};

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const toLocalDateTime = (value: unknown) => {
  if (typeof value !== 'string') return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

export const fromLocalDateTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

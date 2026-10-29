import {
  ProjectRecordSchema,
  PublicationRecordSchema,
  type RecordFieldDefinition,
  type RecordResource,
} from '@viratec/contracts';
import type { ZodType } from 'zod';
import { fieldId as pageFieldId } from '../../../../build-tools/contentful/pages/engine.ts';
import { PAGE_SPECS } from '../../../../build-tools/contentful/pages/specs.ts';
import type { FieldDefinition } from './contentModel';
import type { FieldLabels, FieldText } from './fieldLabels';

interface PageFieldPlace {
  group: string;
  role: string;
}

const INTRO_GROUP = 'intro';
const INTRO_FIELDS = new Set(['documentTitle', 'breadcrumb', 'eyebrow', 'title', 'accent']);
const INTRO_TAIL = 'description';
const ROLE_SUFFIXES = [
  'TranscriptLabel',
  'Transcript',
  'TitleAccent',
  'TitleLine',
  'Eyebrow',
  'Title',
  'Accent',
  'Description',
  'Action',
  'Steps',
];

const ADVANCED_FIELDS = new Set([
  '*.internalName',
  '*.documentTitle',
  '*.order',
  'link.title',
  'partner.code',
  'partner.networkOrder',
  'partner.homeOrder',
  'partner.homeLogoHeight',
  'partner.homeLogoHeightLg',
  'person.teamOrder',
  'audienceGroup.sectionId',
  'legalSection.anchorId',
  'legalDocument.key',
  'legalDocument.version',
  'pageBlock.kind',
  'pageLayout.page',
  'pageSeo.route',
]);

const ADVANCED_RECORD_FIELDS = new Set(['publication.slug', 'publication.position']);

export const COVER_FOCUS_PATH = 'coverFocus';

const IMAGE_RECORD_FIELDS = new Map<string, ZodType>([
  ['publication.coverKey', PublicationRecordSchema.shape.coverKey],
  ['project.coverUrl', ProjectRecordSchema.shape.coverUrl],
]);

const isUpper = (char: string | undefined) => Boolean(char && char >= 'A' && char <= 'Z');

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

const humanize = (text: string) =>
  text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/^./, (letter) => letter.toUpperCase());

const suffixGroup = (id: string) => {
  const suffix = ROLE_SUFFIXES.find(
    (item) => id.length > item.length && id.endsWith(item) && isUpper(id[id.length - item.length]),
  );
  return suffix ? id.slice(0, -suffix.length) : null;
};

const siblingGroup = (id: string, ids: readonly string[]) => {
  let found: string | null = null;
  for (let index = 1; index <= id.length; index += 1) {
    if (index < id.length && !isUpper(id[index])) continue;
    const prefix = id.slice(0, index);
    const shared = ids.some(
      (other) =>
        other !== id &&
        other.length > prefix.length &&
        other.startsWith(prefix) &&
        isUpper(other[prefix.length]),
    );
    if (shared) found = prefix;
  }
  return found;
};

const PAGE_FIELD_PLACES = new Map(
  PAGE_SPECS.map((spec) => {
    const fields = spec.fields.map((field) => ({ id: pageFieldId(field.path), path: field.path }));
    const ids = fields.map((field) => field.id);
    const places = new Map<string, PageFieldPlace>();
    let previous = INTRO_GROUP;
    for (const { id, path } of fields) {
      const [head, ...rest] = path.split('.');
      let place: PageFieldPlace;
      if (head && rest.length > 0) {
        place = { group: head, role: rest.join('.') };
      } else if (INTRO_FIELDS.has(id) || (id === INTRO_TAIL && previous === INTRO_GROUP)) {
        place = { group: INTRO_GROUP, role: id };
      } else {
        const group = suffixGroup(id) ?? siblingGroup(id, ids);
        place = group
          ? { group, role: lowerFirst(id.slice(group.length)) }
          : { group: previous, role: id };
      }
      previous = place.group;
      places.set(id, place);
    }
    return [spec.typeId, places] as const;
  }),
);

export const pageFieldGroup = (contentTypeId: string, fieldId: string) =>
  PAGE_FIELD_PLACES.get(contentTypeId)?.get(fieldId)?.group;

export const groupName = (labels: FieldLabels, group: string) =>
  labels.pageGroups[group] ?? humanize(group);

export const typeName = (
  labels: FieldLabels,
  contentTypeId: string | null | undefined,
  fallback?: string,
) => (contentTypeId && labels.types[contentTypeId]) || fallback || contentTypeId || '';

const isEntryList = (field: FieldDefinition) =>
  field.type === 'Array' && field.items?.type === 'Link';

const pageRoleText = (
  labels: FieldLabels,
  place: PageFieldPlace,
  field: FieldDefinition,
): FieldText | undefined => {
  const role = labels.pageRoles[place.role];
  if (role) return role;
  if (isEntryList(field)) return { label: labels.list };
  return place.role ? undefined : { label: groupName(labels, place.group) };
};

export const fieldText = (
  labels: FieldLabels,
  contentTypeId: string,
  field: FieldDefinition,
): FieldText => {
  const place = PAGE_FIELD_PLACES.get(contentTypeId)?.get(field.id);
  const own =
    labels.fields[`${contentTypeId}.${field.id}`] ??
    (place && pageRoleText(labels, place, field)) ??
    labels.fields[`*.${field.id}`];
  return own ? { label: own.label, help: own.help } : { label: field.name, help: field.help };
};

export const isAdvancedField = (contentTypeId: string, fieldId: string) =>
  ADVANCED_FIELDS.has(`${contentTypeId}.${fieldId}`) || ADVANCED_FIELDS.has(`*.${fieldId}`);

export const recordFieldText = (
  labels: FieldLabels,
  resource: RecordResource,
  field: RecordFieldDefinition,
): FieldText => {
  const own = labels.records[`${resource}.${field.path}`];
  return own ? { label: own.label, help: own.help } : { label: field.name, help: field.help };
};

export const isAdvancedRecordField = (resource: RecordResource, path: string) =>
  ADVANCED_RECORD_FIELDS.has(`${resource}.${path}`);

export const imageRecordSchema = (resource: RecordResource, path: string) =>
  IMAGE_RECORD_FIELDS.get(`${resource}.${path}`);

export const optionName = (labels: FieldLabels, option: string) => labels.options[option] ?? option;

export interface FieldGroup {
  key: string;
  title: string | null;
  fields: FieldDefinition[];
  hasFocus: boolean;
}

export const arrangeFields = (
  labels: FieldLabels,
  contentTypeId: string,
  fields: readonly FieldDefinition[],
  focusedFieldId: string | undefined,
) => {
  const groups = new Map<string, FieldGroup>();
  const advanced: FieldDefinition[] = [];
  for (const field of fields) {
    if (isAdvancedField(contentTypeId, field.id)) {
      advanced.push(field);
      continue;
    }
    const key = pageFieldGroup(contentTypeId, field.id) ?? '';
    const group = groups.get(key) ?? {
      key,
      title: key ? groupName(labels, key) : null,
      fields: [],
      hasFocus: false,
    };
    group.fields.push(field);
    group.hasFocus ||= field.id === focusedFieldId;
    groups.set(key, group);
  }
  return {
    groups: [...groups.values()],
    advanced,
    advancedHasFocus: advanced.some((field) => field.id === focusedFieldId),
  };
};

const RECORD_DETAIL_SEGMENT = '.detail.';

export const arrangeRecordFields = (
  resource: RecordResource,
  fields: readonly RecordFieldDefinition[],
  focusedPath: string | undefined,
) => {
  const main: RecordFieldDefinition[] = [];
  const detail: RecordFieldDefinition[] = [];
  const advanced: RecordFieldDefinition[] = [];
  for (const field of fields) {
    if (field.path === COVER_FOCUS_PATH) continue;
    if (isAdvancedRecordField(resource, field.path)) advanced.push(field);
    else if (field.path.includes(RECORD_DETAIL_SEGMENT)) detail.push(field);
    else main.push(field);
  }
  const has = (list: readonly RecordFieldDefinition[]) =>
    list.some((field) => field.path === focusedPath);
  return { main, detail, advanced, detailHasFocus: has(detail), advancedHasFocus: has(advanced) };
};

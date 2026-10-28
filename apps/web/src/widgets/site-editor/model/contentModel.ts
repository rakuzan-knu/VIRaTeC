import type { ContentFields, ContentLocales } from '@viratec/contracts';
import type {
  ContentTypeDefinition,
  FieldDefinition,
} from '../../../../build-tools/contentful/content-types.ts';
import { CONTENT_TYPES } from '../../../../build-tools/contentful/domains/index.ts';
import { PAGE_SPECS } from '../../../../build-tools/contentful/pages/specs.ts';
import { PAGE_BLOCK_TYPE_ID } from '@/shared/config/pageBlock';
import type { Locale } from '@/shared/i18n';

export type { ContentTypeDefinition, FieldDefinition };

export const CONTENT_TYPE_IDS = CONTENT_TYPES.map((type) => type.id);

export const findContentType = (id: string | null | undefined) =>
  CONTENT_TYPES.find((type) => type.id === id);

const CONTAINER_TYPES = new Set([
  ...PAGE_SPECS.map((spec) => spec.typeId),
  PAGE_BLOCK_TYPE_ID,
  'pageLayout',
  'pageSeo',
  'siteSettings',
  'legalDocument',
]);

export const isContainerType = (contentTypeId: string) => CONTAINER_TYPES.has(contentTypeId);

const LINKED_TYPES = new Set(
  CONTENT_TYPES.flatMap((type) =>
    type.fields.flatMap((field) =>
      [...field.validations, ...(field.items?.validations ?? [])].flatMap((validation) =>
        'linkContentType' in validation ? validation.linkContentType : [],
      ),
    ),
  ),
);

const ORDER_FIELD_SUFFIX = 'Order';

export const isCollectionType = (contentTypeId: string) =>
  !CONTAINER_TYPES.has(contentTypeId) && !LINKED_TYPES.has(contentTypeId);

export const siblingFields = (
  type: ContentTypeDefinition,
  fields: ContentFields,
  locales: ContentLocales,
  placeholder: string,
): ContentFields =>
  Object.fromEntries(
    type.fields.flatMap((field) => {
      if (field.id === type.displayField) {
        const codes = field.localized ? Object.values(locales) : [locales.en];
        return [[field.id, Object.fromEntries(codes.map((code) => [code, placeholder]))]];
      }
      const value = fields[field.id]?.[locales.en];
      if (field.type !== 'Integer' || field.localized || typeof value !== 'number') return [];
      const next = field.id.endsWith(ORDER_FIELD_SUFFIX) ? value + 1 : value;
      return [[field.id, { [locales.en]: next }]];
    }),
  );

export const findField = (contentTypeId: string, fieldId: string | undefined) =>
  findContentType(contentTypeId)?.fields.find((field) => field.id === fieldId);

export const localeCode = (locales: ContentLocales, locale: Locale) => locales[locale];

export const readText = (
  fields: ContentFields,
  fieldId: string,
  locales: ContentLocales,
  locale: Locale,
) => {
  const values = fields[fieldId];
  const value = values?.[locales[locale]] ?? values?.[locales.en];
  return typeof value === 'string' ? value : undefined;
};

export const entryLabel = (
  contentTypeId: string,
  fields: ContentFields,
  locales: ContentLocales,
  locale: Locale,
) => {
  const type = findContentType(contentTypeId);
  const label = type ? readText(fields, type.displayField, locales, locale) : undefined;
  return label?.trim() || type?.name || contentTypeId;
};

export const linkedContentTypes = (field: FieldDefinition) => {
  const validations = field.type === 'Array' ? (field.items?.validations ?? []) : field.validations;
  for (const validation of validations) {
    if ('linkContentType' in validation) return validation.linkContentType;
  }
  return [];
};

export const allowedValues = (field: FieldDefinition) => {
  for (const validation of field.validations) {
    if ('in' in validation) return validation.in.map(String);
  }
  return null;
};

export interface EntryLink {
  sys: { type: 'Link'; linkType: 'Entry' | 'Asset'; id: string };
}

export const toLink = (linkType: 'Entry' | 'Asset', id: string): EntryLink => ({
  sys: { type: 'Link', linkType, id },
});

export const linkId = (value: unknown) => {
  if (typeof value !== 'object' || value === null || !('sys' in value)) return null;
  const { sys } = value as { sys: { id?: unknown } };
  return typeof sys.id === 'string' ? sys.id : null;
};

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (typeof value === 'object' && value !== null) {
    return `{${Object.keys(value)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`,
      )
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
};

export const sameValue = (left: unknown, right: unknown) =>
  stableStringify(left) === stableStringify(right);

export const sameFields = (left: ContentFields, right: ContentFields) => sameValue(left, right);

export const withFieldValue = (
  fields: ContentFields,
  fieldId: string,
  localeCode: string,
  value: unknown,
): ContentFields => {
  const values = { ...fields[fieldId] };
  if (value === undefined) delete values[localeCode];
  else values[localeCode] = value;
  const next = { ...fields, [fieldId]: values };
  if (Object.keys(values).length === 0) delete next[fieldId];
  return next;
};

export const withoutEntryLink = (fields: ContentFields, entryId: string): ContentFields => {
  let next = fields;
  for (const [fieldId, values] of Object.entries(fields)) {
    for (const [code, value] of Object.entries(values)) {
      if (Array.isArray(value)) {
        const kept = value.filter((item) => linkId(item) !== entryId);
        if (kept.length !== value.length) {
          next = withFieldValue(next, fieldId, code, kept.length > 0 ? kept : undefined);
        }
      } else if (linkId(value) === entryId) {
        next = withFieldValue(next, fieldId, code, undefined);
      }
    }
  }
  return next;
};

export const normalizeFields = (fields: ContentFields): ContentFields =>
  Object.fromEntries(
    Object.entries(fields).map(([fieldId, values]) => [
      fieldId,
      Object.fromEntries(
        Object.entries(values).flatMap(([localeCode, value]) => {
          if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
            return [[localeCode, value]];
          }
          const items = value.map((item: string) => item.trim()).filter(Boolean);
          return items.length > 0 ? [[localeCode, items]] : [];
        }),
      ),
    ]),
  );

export const changeLabel = (typeName: string, label: string) =>
  label === typeName ? typeName : `${typeName}: ${label}`;

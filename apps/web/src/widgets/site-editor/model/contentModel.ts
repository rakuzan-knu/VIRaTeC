import type { ContentFields, ContentLocales } from '@viratec/contracts';
import type {
  ContentTypeDefinition,
  FieldDefinition,
} from '../../../../build-tools/contentful/content-types.ts';
import { CONTENT_TYPES } from '../../../../build-tools/contentful/domains/index.ts';
import type { Locale } from '@/shared/i18n';

export type { ContentTypeDefinition, FieldDefinition };

export const findContentType = (id: string | null | undefined) =>
  CONTENT_TYPES.find((type) => type.id === id);

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

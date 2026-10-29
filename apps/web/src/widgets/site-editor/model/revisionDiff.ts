import {
  RECORD_DEFINITIONS,
  fieldPaths,
  readRecordValue,
  type ContentFields,
  type ContentLocales,
  type RecordData,
  type RecordResource,
} from '@viratec/contracts';
import { LOCALES } from '@/shared/i18n';
import { findContentType, sameValue } from './contentModel';
import { fieldText, recordFieldText } from './fieldText';
import type { SiteEditorMessages } from './messages';

export interface DiffRow {
  key: string;
  label: string;
  before: string;
  after: string;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const display = (value: unknown, t: SiteEditorMessages) => {
  if (value === undefined || value === null || value === '') return t.versions.empty;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
    return value.join(', ');
  }
  return t.versions.otherValue;
};

export const entryDiff = (
  contentTypeId: string,
  current: ContentFields,
  version: Record<string, unknown>,
  locales: ContentLocales,
  t: SiteEditorMessages,
): DiffRow[] => {
  const type = findContentType(contentTypeId);
  if (!type) return [];
  return type.fields.flatMap((field) => {
    const label = fieldText(t.fields, contentTypeId, field).label;
    const previous = isObject(version[field.id]) ? version[field.id] : {};
    const codes = field.localized
      ? LOCALES.map((locale) => [locale, locales[locale]] as const)
      : [['en', locales.en] as const];
    return codes.flatMap(([locale, code]) => {
      const before = isObject(previous) ? previous[code] : undefined;
      const after = current[field.id]?.[code];
      if (sameValue(before ?? null, after ?? null)) return [];
      return [
        {
          key: `${field.id}:${code}`,
          label: field.localized ? `${label} (${t.locales[locale]})` : label,
          before: display(before, t),
          after: display(after, t),
        },
      ];
    });
  });
};

export const recordDiff = (
  resource: RecordResource,
  current: RecordData,
  version: Record<string, unknown>,
  t: SiteEditorMessages,
): DiffRow[] =>
  RECORD_DEFINITIONS[resource].fields.flatMap((field) => {
    const label = recordFieldText(t.fields, resource, field).label;
    return fieldPaths(field).flatMap((path, index) => {
      const before = readRecordValue(version, path);
      const after = readRecordValue(current, path);
      if (sameValue(before ?? null, after ?? null)) return [];
      const locale = field.localized ? LOCALES[index] : undefined;
      return [
        {
          key: path,
          label: locale ? `${label} (${t.locales[locale]})` : label,
          before: display(before, t),
          after: display(after, t),
        },
      ];
    });
  });

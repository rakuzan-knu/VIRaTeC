import {
  RECORD_DEFINITIONS,
  TRANSLATION_LIMITS,
  readRecordValue,
  type ContentFields,
  type ContentLocales,
  type RecordData,
  type RecordResource,
} from '@viratec/contracts';
import { LOCALES, type Locale } from '@/shared/i18n';
import { translateTexts } from '../api/editorApi';
import { findContentType, withFieldValue } from './contentModel';
import { localizedPath, writeRecordValue } from './recordModel';

export interface MissingTranslation {
  key: string;
  from: Locale;
  to: Locale;
  text: string;
}

const TEXT_TYPES = new Set(['Symbol', 'Text']);
const TEXT_KINDS = new Set(['text', 'longText']);

const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const pairOf = (key: string, values: Record<Locale, string>): MissingTranslation[] => {
  const source = LOCALES.find((locale) => values[locale]);
  const target = LOCALES.find((locale) => !values[locale]);
  return source && target ? [{ key, from: source, to: target, text: values[source] }] : [];
};

export const missingEntryTranslations = (
  contentTypeId: string,
  fields: ContentFields,
  locales: ContentLocales,
): MissingTranslation[] =>
  (findContentType(contentTypeId)?.fields ?? []).flatMap((field) =>
    field.localized && TEXT_TYPES.has(field.type)
      ? pairOf(field.id, {
          en: asText(fields[field.id]?.[locales.en]),
          uk: asText(fields[field.id]?.[locales.uk]),
        })
      : [],
  );

export const applyEntryTranslations = (
  fields: ContentFields,
  locales: ContentLocales,
  results: readonly (MissingTranslation & { result: string })[],
) =>
  results.reduce(
    (current, item) => withFieldValue(current, item.key, locales[item.to], item.result),
    fields,
  );

export const missingRecordTranslations = (
  resource: RecordResource,
  data: RecordData,
): MissingTranslation[] =>
  RECORD_DEFINITIONS[resource].fields.flatMap((field) =>
    field.localized && TEXT_KINDS.has(field.kind)
      ? pairOf(field.path, {
          en: asText(readRecordValue(data, localizedPath(field, 'en'))),
          uk: asText(readRecordValue(data, localizedPath(field, 'uk'))),
        })
      : [],
  );

export const applyRecordTranslations = (
  resource: RecordResource,
  data: RecordData,
  results: readonly (MissingTranslation & { result: string })[],
) =>
  results.reduce((current, item) => {
    const field = RECORD_DEFINITIONS[resource].fields.find(
      (candidate) => candidate.path === item.key,
    );
    return field ? writeRecordValue(current, localizedPath(field, item.to), item.result) : current;
  }, data);

export const translateMissing = async (items: readonly MissingTranslation[]) => {
  const groups = new Map<string, MissingTranslation[]>();
  for (const item of items) {
    const key = `${item.from}:${item.to}`;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  const results: (MissingTranslation & { result: string })[] = [];
  for (const group of groups.values()) {
    for (let start = 0; start < group.length; start += TRANSLATION_LIMITS.maxTexts) {
      const chunk = group.slice(start, start + TRANSLATION_LIMITS.maxTexts);
      const [first] = chunk;
      if (!first) continue;
      const { translations } = await translateTexts({
        from: first.from,
        to: first.to,
        texts: chunk.map((item) => item.text),
      });
      chunk.forEach((item, index) => {
        const result = translations[index];
        if (result) results.push({ ...item, result });
      });
    }
  }
  return results;
};

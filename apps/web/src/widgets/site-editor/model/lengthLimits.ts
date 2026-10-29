import type { RecordResource } from '@viratec/contracts';
import type { SiteEditorMessages } from './messages';

const ENTRY_LIMITS: Record<string, Record<string, number>> = {
  card: { title: 60, description: 180, meta: 40, linkLabel: 24 },
  stat: { value: 8, label: 40 },
  step: { title: 60, description: 220 },
};

const RECORD_LIMITS: Record<RecordResource, Record<string, number>> = {
  project: {
    'translations.{locale}.title': 80,
    'translations.{locale}.description': 220,
  },
  event: {
    'translations.{locale}.title': 80,
    'translations.{locale}.description': 220,
  },
  publication: {
    'content.{locale}.title': 120,
    'content.{locale}.excerpt': 240,
  },
};

export const entryLengthLimit = (contentTypeId: string, fieldId: string): number | undefined =>
  ENTRY_LIMITS[contentTypeId]?.[fieldId];

export const recordLengthLimit = (resource: RecordResource, path: string): number | undefined =>
  RECORD_LIMITS[resource][path];

export const withLengthHint = (
  helperText: string | undefined,
  value: unknown,
  limit: number | undefined,
  t: SiteEditorMessages,
): string | undefined => {
  if (!limit || typeof value !== 'string' || !value) return helperText;
  const length = value.trim().length;
  const hint = length > limit ? t.length.tooLong(length, limit) : t.length.count(length, limit);
  return [helperText, hint].filter(Boolean).join(' · ');
};

import {
  LOCALE_PLACEHOLDER,
  RECORD_DEFINITIONS,
  fieldPaths,
  recordTypeId,
  type ContentChangeDto,
  type ContentResourceKind,
  type RecordResource,
} from '@viratec/contracts';
import { LOCALES, type Locale } from '@/shared/i18n';
import type { IssueTarget } from './useIssueTargets';

const RECORD_KINDS: Partial<Record<ContentResourceKind, RecordResource>> = {
  PROJECT: 'project',
  EVENT: 'event',
  PUBLICATION: 'publication',
};

const localeOf = (path: string, template: string): Locale | undefined => {
  const index = template.split('.').indexOf(LOCALE_PLACEHOLDER);
  const segment = index >= 0 ? path.split('.')[index] : undefined;
  return LOCALES.find((locale) => locale === segment);
};

const recordTargets = (change: ContentChangeDto, resource: RecordResource): IssueTarget[] => {
  const contentTypeId = recordTypeId(resource);
  const seen = new Set<string>();
  return change.fieldIds.flatMap((path) => {
    const field = RECORD_DEFINITIONS[resource].fields.find((candidate) =>
      fieldPaths(candidate).some((prefix) => path === prefix || path.startsWith(`${prefix}.`)),
    );
    const locale = field?.localized ? localeOf(path, field.path) : undefined;
    const key = `${change.resourceId}:${field?.path ?? ''}:${locale ?? ''}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [
      {
        key,
        address: { entryId: change.resourceId, contentTypeId, fieldId: field?.path, locale },
        text: change.label ?? '',
      },
    ];
  });
};

export const changeTargets = (changes: readonly ContentChangeDto[]): IssueTarget[] =>
  changes.flatMap((change) => {
    if (change.resourceType === 'ASSET' || change.isDeleted) return [];
    const resource = RECORD_KINDS[change.resourceType];
    if (resource) return recordTargets(change, resource);
    const fieldIds = change.isNew || change.fieldIds.length === 0 ? [undefined] : change.fieldIds;
    return fieldIds.map((fieldId) => ({
      key: `${change.resourceId}:${fieldId ?? ''}`,
      address: {
        entryId: change.resourceId,
        contentTypeId: change.contentTypeId ?? '',
        fieldId,
      },
      text: change.label ?? '',
    }));
  });

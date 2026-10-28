import { useQuery } from '@tanstack/react-query';
import {
  LOCALE_PLACEHOLDER,
  RECORD_DEFINITIONS,
  fieldPaths,
  missingRequiredFields,
  recordTypeId,
  type RecordDraftDto,
} from '@viratec/contracts';
import { LOCALES, type Locale } from '@/shared/i18n';
import { useContentPreviewStore } from '@/shared/lib';
import { fetchRecordDrafts } from '../api/editorApi';
import { recordFieldText } from './fieldText';
import { issueText } from './issues';
import { useSiteEditorMessages } from './messages';
import { EDITOR_QUERY_KEY } from './queries';
import { recordDraftKey, useSiteEditorStore } from './store';

export interface IssueAddress {
  entryId: string;
  contentTypeId: string;
  fieldId?: string;
  locale?: Locale;
}

export interface IssueTarget {
  key: string;
  address: IssueAddress;
  text: string;
}

const NO_DRAFTS: RecordDraftDto[] = [];

const localeOfPath = (path: string, template: string): Locale | undefined => {
  const index = template.split('.').indexOf(LOCALE_PLACEHOLDER);
  const segment = index >= 0 ? path.split('.')[index] : undefined;
  return LOCALES.find((locale) => locale === segment);
};

export function useIssueTargets(enabled: boolean): IssueTarget[] {
  const t = useSiteEditorMessages();
  const issuesByDomain = useContentPreviewStore((state) => state.issues);
  const localDrafts = useSiteEditorStore((state) => state.recordDrafts);
  const drafts = useQuery({
    queryKey: [...EDITOR_QUERY_KEY, 'record-drafts'],
    queryFn: fetchRecordDrafts,
    enabled,
    staleTime: 10_000,
  });

  const contentTargets = Object.values(issuesByDomain)
    .flat()
    .flatMap((issue): IssueTarget[] => {
      if (!issue.target) return [];
      const { entryId, contentTypeId, fieldId, locale } = issue.target;
      return [
        {
          key: `${entryId}:${fieldId ?? ''}:${locale ?? ''}:${issue.kind}`,
          address: { entryId, contentTypeId, fieldId, locale },
          text: issueText({ key: issue.kind, issue, locales: [] }, t),
        },
      ];
    });

  const recordTargets = (drafts.data ?? NO_DRAFTS).flatMap((draft): IssueTarget[] => {
    if (draft.isDeleted) return [];
    const data = localDrafts[recordDraftKey(draft.resource, draft.key)]?.data ?? draft.data;
    return missingRequiredFields(draft.resource, data).flatMap((path) => {
      const field = RECORD_DEFINITIONS[draft.resource].fields.find((candidate) =>
        fieldPaths(candidate).includes(path),
      );
      if (!field) return [];
      const locale = field.localized ? localeOfPath(path, field.path) : undefined;
      const label = recordFieldText(t.fields, draft.resource, field).label;
      return [
        {
          key: `${draft.key}:${path}`,
          address: {
            entryId: draft.key,
            contentTypeId: recordTypeId(draft.resource),
            fieldId: field.path,
            locale,
          },
          text: `${t.issues.required(label)}${locale ? ` (${t.locales[locale]})` : ''}`,
        },
      ];
    });
  });

  const seen = new Set<string>();
  return [...contentTargets, ...recordTargets].filter((target) => {
    if (seen.has(target.key)) return false;
    seen.add(target.key);
    return true;
  });
}

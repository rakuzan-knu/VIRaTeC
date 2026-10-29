import { useQueries } from '@tanstack/react-query';
import type { ContentChangeDto, ContentResourceKind, RecordResource } from '@viratec/contracts';
import { useLocale } from '@/shared/i18n';
import { fetchEditorEntry, fetchRecord, fetchRevisions } from '../api/editorApi';
import { useSiteEditorMessages, type SiteEditorMessages } from './messages';
import { EDITOR_QUERY_KEY } from './queries';
import { entryDiff, recordDiff, type DiffRow } from './revisionDiff';

export type ReviewStatus = 'new' | 'deleted' | 'photo' | 'changed';

const RECORD_KINDS: Partial<Record<ContentResourceKind, RecordResource>> = {
  PROJECT: 'project',
  EVENT: 'event',
  PUBLICATION: 'publication',
};

const REVIEW_STALE_MS = 30_000;

export const reviewStatusOf = (change: ContentChangeDto): ReviewStatus => {
  if (change.resourceType === 'ASSET') return 'photo';
  if (change.isDeleted) return 'deleted';
  return change.isNew ? 'new' : 'changed';
};

const loadDiff = async (
  change: ContentChangeDto,
  t: SiteEditorMessages,
): Promise<DiffRow[] | null> => {
  const resource = RECORD_KINDS[change.resourceType];
  if (resource) {
    const record = await fetchRecord(resource, change.resourceId);
    return record.published ? recordDiff(resource, record.data, record.published, t) : null;
  }
  const [entry, versions] = await Promise.all([
    fetchEditorEntry(change.resourceId),
    fetchRevisions('ENTRY', change.resourceId).catch(() => []),
  ]);
  const [published] = versions;
  return published
    ? entryDiff(entry.contentTypeId, entry.fields, published.data, entry.locales, t)
    : null;
};

export function usePublishReview(enabled: boolean, changes: readonly ContentChangeDto[]) {
  const t = useSiteEditorMessages();
  const locale = useLocale();
  const results = useQueries({
    queries: changes.map((change) => ({
      queryKey: [...EDITOR_QUERY_KEY, 'review', change.id, change.updatedAt, locale],
      queryFn: () => loadDiff(change, t),
      enabled: enabled && reviewStatusOf(change) === 'changed',
      staleTime: REVIEW_STALE_MS,
      retry: false,
    })),
  });
  return changes.map((change, index) => ({
    change,
    status: reviewStatusOf(change),
    rows: results[index]?.data ?? null,
    isLoading: results[index]?.isLoading ?? false,
  }));
}

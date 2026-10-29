import { useDeferredValue } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  RECORD_RESOURCES,
  type RecordData,
  type RecordDraftDto,
  type RecordResource,
} from '@viratec/contracts';
import { useLocale } from '@/shared/i18n';
import { fetchContentForSearch, fetchRecordDrafts, fetchRecordList } from '../api/editorApi';
import { CONTENT_TYPE_IDS } from './contentModel';
import { useSiteEditorMessages } from './messages';
import { EDITOR_QUERY_KEY } from './queries';
import {
  buildContentIndex,
  buildRecordIndex,
  normalizeSearch,
  type SearchItem,
} from './siteSearch';

const MAX_RESULTS = 30;
const MIN_QUERY_LENGTH = 2;
const NO_ITEMS: SearchItem[] = [];

type ListedRecord = RecordData & { id?: string; slug?: string };

const keyOf = (resource: RecordResource, record: ListedRecord) =>
  resource === 'publication' ? record.slug : record.id;

export function useSiteSearch(enabled: boolean, query: string) {
  const t = useSiteEditorMessages();
  const locale = useLocale();
  const index = useQuery({
    queryKey: [...EDITOR_QUERY_KEY, 'search', locale],
    enabled,
    staleTime: 60_000,
    queryFn: async () => {
      const [content, drafts, ...lists] = await Promise.all([
        fetchContentForSearch(CONTENT_TYPE_IDS),
        fetchRecordDrafts().catch((): RecordDraftDto[] => []),
        ...RECORD_RESOURCES.map((resource) =>
          fetchRecordList<ListedRecord>(resource).catch((): ListedRecord[] => []),
        ),
      ]);
      const records = new Map<
        string,
        { resource: RecordResource; key: string; data: RecordData }
      >();
      RECORD_RESOURCES.forEach((resource, position) => {
        for (const record of lists[position] ?? []) {
          const key = keyOf(resource, record);
          if (key) records.set(`${resource}:${key}`, { resource, key, data: record });
        }
      });
      for (const draft of drafts) {
        const id = `${draft.resource}:${draft.key}`;
        if (draft.isDeleted) records.delete(id);
        else records.set(id, { resource: draft.resource, key: draft.key, data: draft.data });
      }
      return [
        ...buildContentIndex(content, locale, t),
        ...[...records.values()].flatMap(({ resource, key, data }) =>
          buildRecordIndex(resource, key, data, locale, t),
        ),
      ];
    },
  });

  const normalized = normalizeSearch(useDeferredValue(query));
  const results =
    normalized.length < MIN_QUERY_LENGTH
      ? NO_ITEMS
      : (index.data ?? NO_ITEMS)
          .filter((item) => item.normalized.includes(normalized))
          .slice(0, MAX_RESULTS);

  return {
    results,
    query: normalized,
    isLoading: index.isPending && enabled,
    isError: index.isError,
  };
}

import { useDeferredValue, useState } from 'react';
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
  isSearchRootType,
  normalizeSearch,
  searchItems,
  type ContentSearchSource,
  type SearchItem,
} from './siteSearch';

const PAGE_SIZE = 5;
const MAX_TYPES_PER_REQUEST = 10;
const INDEX_STALE_MS = 5 * 60_000;
const NO_ITEMS: SearchItem[] = [];

const searchedTypes = CONTENT_TYPE_IDS.filter(isSearchRootType);
const typeBatches = Array.from(
  { length: Math.ceil(searchedTypes.length / MAX_TYPES_PER_REQUEST) },
  (_, batch) =>
    searchedTypes.slice(batch * MAX_TYPES_PER_REQUEST, (batch + 1) * MAX_TYPES_PER_REQUEST),
);

const fetchSearchContent = async (): Promise<ContentSearchSource> => {
  const pages = await Promise.all(typeBatches.map((types) => fetchContentForSearch(types)));
  return pages.reduce((merged, page) => ({
    locales: page.locales,
    items: [...merged.items, ...page.items],
    includes: { entries: [...merged.includes.entries, ...page.includes.entries] },
  }));
};

type ListedRecord = RecordData & { id?: string; slug?: string };

const keyOf = (resource: RecordResource, record: ListedRecord) =>
  resource === 'publication' ? record.slug : record.id;

export function useSiteSearch(enabled: boolean) {
  const t = useSiteEditorMessages();
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const index = useQuery({
    queryKey: [...EDITOR_QUERY_KEY, 'search', locale],
    enabled,
    staleTime: INDEX_STALE_MS,
    retry: false,
    queryFn: async () => {
      const [content, drafts, ...lists] = await Promise.all([
        fetchSearchContent(),
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
  const terms = normalized.split(' ').filter(Boolean);
  const results = normalized ? searchItems(index.data ?? NO_ITEMS, normalized, terms) : NO_ITEMS;
  const total = results.length;
  const current = Math.min(active, Math.max(total - 1, 0));
  const page = Math.floor(current / PAGE_SIZE);
  const pageCount = Math.ceil(total / PAGE_SIZE);
  const offset = page * PAGE_SIZE;

  return {
    query,
    terms,
    hasQuery: normalized.length > 0,
    total,
    current,
    currentItem: results[current],
    visible: results.slice(offset, offset + PAGE_SIZE),
    offset,
    page,
    pageCount,
    isLoading: index.isPending && enabled,
    isError: index.isError && !index.data,
    retry: () => void index.refetch(),
    changeQuery: (value: string) => {
      setQuery(value);
      setActive(0);
    },
    setActive,
    move: (step: number) => {
      if (total > 0) setActive((current + step + total) % total);
    },
    goToPage: (next: number) => setActive(Math.max(Math.min(next, pageCount - 1), 0) * PAGE_SIZE),
  };
}

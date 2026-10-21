import { useDeferredValue, useMemo, useState } from 'react';
import { usePublications, type Publication, type PublicationType } from '@/entities/publication';
import { defineMessages, mapLocalized, useLocalized } from '@/shared/i18n';

const TYPE_VALUES = ['all', 'paper', 'news', 'event', 'media'] as const satisfies readonly (
  PublicationType | 'all'
)[];

export type TypeFilter = (typeof TYPE_VALUES)[number];

const SORT_VALUES = ['newest', 'oldest', 'az'] as const;

export type SortOrder = (typeof SORT_VALUES)[number];

interface ListingLabels {
  type: Record<TypeFilter, string>;
  sort: Record<SortOrder, string>;
}

const LISTING_LABELS = defineMessages<ListingLabels>({
  en: {
    type: { all: 'All', paper: 'Papers', news: 'News', event: 'Events', media: 'Media' },
    sort: { newest: 'Newest first', oldest: 'Oldest first', az: 'A–Z' },
  },
  uk: {
    type: { all: 'Усі', paper: 'Статті', news: 'Новини', event: 'Події', media: 'Медіа' },
    sort: { newest: 'Спочатку нові', oldest: 'Спочатку старі', az: 'А–Я' },
  },
});

const toOptions = <T extends string>(values: readonly T[], labels: Record<T, string>) =>
  values.map((value) => ({ value, label: labels[value] }));

const LISTING_OPTIONS = mapLocalized(LISTING_LABELS, (labels) => ({
  type: toOptions(TYPE_VALUES, labels.type),
  sort: toOptions(SORT_VALUES, labels.sort),
}));

export const useListingOptions = () => useLocalized(LISTING_OPTIONS);

export const PAGE_SIZE = 6;

const sortPublications = (items: Publication[], sort: SortOrder) => {
  const sorted = [...items];
  if (sort === 'az') return sorted.sort((a, b) => a.title.localeCompare(b.title));
  return sorted.sort((a, b) => (sort === 'newest' ? b.year - a.year : a.year - b.year));
};

const matchesQuery = (publication: Publication, query: string) => {
  if (!query) return true;
  const haystack =
    `${publication.title} ${publication.source} ${publication.excerpt}`.toLowerCase();
  return haystack.includes(query);
};

export function usePublicationListing() {
  const [type, setType] = useState<TypeFilter>('all');
  const [sort, setSort] = useState<SortOrder>('newest');
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const publications = usePublications();
  const deferredSearch = useDeferredValue(search);

  const query = deferredSearch.trim().toLowerCase();
  const isDefaultView = type === 'all' && query === '' && sort === 'newest';

  const { featured, items } = useMemo(() => {
    const filtered = sortPublications(
      publications.filter(
        (publication) =>
          (type === 'all' || publication.type === type) && matchesQuery(publication, query),
      ),
      sort,
    );
    const featuredItem = isDefaultView
      ? filtered.find((publication) => publication.isFeatured)
      : undefined;
    return {
      featured: featuredItem,
      items: featuredItem
        ? filtered.filter((publication) => publication !== featuredItem)
        : filtered,
    };
  }, [publications, type, query, sort, isDefaultView]);

  const resetPagination = () => setVisibleCount(PAGE_SIZE);

  return {
    type,
    sort,
    search,
    setType: (value: TypeFilter) => {
      setType(value);
      resetPagination();
    },
    setSort: (value: SortOrder) => {
      setSort(value);
      resetPagination();
    },
    setSearch: (value: string) => {
      setSearch(value);
      resetPagination();
    },
    reset: () => {
      setType('all');
      setSort('newest');
      setSearch('');
      resetPagination();
    },
    featured,
    items: items.slice(0, visibleCount),
    totalCount: items.length + (featured ? 1 : 0),
    hasMore: items.length > visibleCount,
    loadMore: () => setVisibleCount((count) => count + PAGE_SIZE),
    activeFilterCount: Number(type !== 'all'),
  };
}

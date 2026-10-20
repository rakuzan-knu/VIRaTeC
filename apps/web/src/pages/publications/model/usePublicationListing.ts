import { useDeferredValue, useMemo, useState } from 'react';
import { PUBLICATIONS, type Publication, type PublicationType } from '@/entities/publication';

export const TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'paper', label: 'Papers' },
  { value: 'news', label: 'News' },
  { value: 'event', label: 'Events' },
  { value: 'media', label: 'Media' },
] as const satisfies readonly { value: PublicationType | 'all'; label: string }[];

export type TypeFilter = (typeof TYPE_OPTIONS)[number]['value'];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'az', label: 'A–Z' },
] as const;

export type SortOrder = (typeof SORT_OPTIONS)[number]['value'];

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
  const deferredSearch = useDeferredValue(search);

  const query = deferredSearch.trim().toLowerCase();
  const isDefaultView = type === 'all' && query === '' && sort === 'newest';

  const { featured, items } = useMemo(() => {
    const filtered = sortPublications(
      PUBLICATIONS.filter(
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
  }, [type, query, sort, isDefaultView]);

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

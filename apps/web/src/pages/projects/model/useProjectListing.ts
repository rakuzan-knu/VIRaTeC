import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProjects, type Project } from '@/entities/project';
import {
  ALL,
  PAGE_SIZE,
  parseArea,
  parseSort,
  parseStatus,
  type AreaFilter,
  type SortOrder,
  type StatusFilter,
} from './filters';

type FilterKey = 'area' | 'status' | 'sort';

const sortProjects = (projects: Project[], sort: SortOrder) => {
  const sorted = [...projects];
  if (sort === 'az') return sorted.sort((a, b) => a.title.localeCompare(b.title));
  return sorted.sort((a, b) => {
    const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return sort === 'newest' ? diff : -diff;
  });
};

export function useProjectListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const area = parseArea(searchParams.get('area'));
  const status = parseStatus(searchParams.get('status'));
  const sort = parseSort(searchParams.get('sort'));
  const [pagination, setPagination] = useState({ key: '', count: PAGE_SIZE });

  const filterKey = `${area}|${status}|${sort}`;
  const visibleCount = pagination.key === filterKey ? pagination.count : PAGE_SIZE;

  const query = useProjects(area === ALL ? undefined : area);

  const projects = useMemo(() => {
    const list = query.data ?? [];
    const byStatus = status === ALL ? list : list.filter((project) => project.status === status);
    return sortProjects(byStatus, sort);
  }, [query.data, status, sort]);

  const updateParam = useCallback(
    (key: FilterKey, value: string, fallback: string) => {
      setSearchParams(
        (params) => {
          const next = new URLSearchParams(params);
          if (value === fallback) next.delete(key);
          else next.set(key, value);
          return next;
        },
        { replace: true, preventScrollReset: true },
      );
    },
    [setSearchParams],
  );

  return {
    area,
    status,
    sort,
    setArea: (value: AreaFilter) => updateParam('area', value, ALL),
    setStatus: (value: StatusFilter) => updateParam('status', value, ALL),
    setSort: (value: SortOrder) => updateParam('sort', value, 'newest'),
    reset: () =>
      setSearchParams(new URLSearchParams(), { replace: true, preventScrollReset: true }),
    activeFilterCount: Number(area !== ALL) + Number(status !== ALL),
    projects: projects.slice(0, visibleCount),
    totalCount: projects.length,
    hasMore: projects.length > visibleCount,
    loadMore: () => setPagination({ key: filterKey, count: visibleCount + PAGE_SIZE }),
    isLoading: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    retry: () => void query.refetch(),
  };
}

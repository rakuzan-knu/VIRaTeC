import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { PeopleQuery } from '@viratec/contracts';
import { ApiError } from '@/shared/api/apiClient';
import { fetchPeople, fetchPublicProfile } from '../api/personApi';

export const PEOPLE_PAGE_SIZE = 12;

export const personKeys = {
  all: ['people'] as const,
  detail: (userId: string) => [...personKeys.all, 'detail', userId] as const,
  list: (query: PeopleQuery, viewerKey: string | null) =>
    [...personKeys.all, 'list', query, viewerKey ?? 'guest'] as const,
};

export function usePublicProfile(userId: string | undefined, viewerKey: string | null) {
  return useQuery({
    queryKey: [...personKeys.detail(userId ?? ''), viewerKey ?? 'guest'],
    queryFn: () => fetchPublicProfile(userId ?? ''),
    enabled: Boolean(userId),
    staleTime: 30_000,
    retry: (failureCount, error) =>
      !(error instanceof ApiError && [400, 401, 404].includes(error.status)) && failureCount < 1,
  });
}

export function usePeople(query: PeopleQuery, viewerKey: string | null) {
  return useInfiniteQuery({
    queryKey: personKeys.list(query, viewerKey),
    queryFn: ({ pageParam }) =>
      fetchPeople({ ...query, page: pageParam, pageSize: PEOPLE_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

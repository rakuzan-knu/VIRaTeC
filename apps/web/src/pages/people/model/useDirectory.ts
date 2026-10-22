import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FacultyDivision,
  OpenToOption,
  PEOPLE_PAGE_LIMITS,
  StudyLevel,
  type PeopleQuery,
} from '@viratec/contracts';
import { usePeople } from '@/entities/person';
import { useSessionStore } from '@/entities/session';

export const FILTER_KEYS = ['openTo', 'faculty', 'studyLevel', 'country', 'language'] as const;

export type FilterKey = (typeof FILTER_KEYS)[number];

const SEARCH_DEBOUNCE_MS = 350;

const FILTER_NAVIGATION = { replace: true, preventScrollReset: true, viewTransition: false };

const isOneOf = <T extends string>(values: readonly T[], raw: string | null): raw is T =>
  raw !== null && (values as readonly string[]).includes(raw);

const VALIDATORS: Record<FilterKey, (raw: string | null) => boolean> = {
  openTo: (raw) => isOneOf(Object.values(OpenToOption), raw),
  faculty: (raw) => isOneOf(Object.values(FacultyDivision), raw),
  studyLevel: (raw) => isOneOf(Object.values(StudyLevel), raw),
  country: (raw) => raw !== null && /^[A-Z]{2}$/.test(raw),
  language: (raw) => raw !== null && /^[a-z]{2,3}$/.test(raw),
};

const readFilters = (params: URLSearchParams): Record<FilterKey, string> =>
  Object.fromEntries(
    FILTER_KEYS.map((key) => {
      const raw = params.get(key);
      return [key, VALIDATORS[key](raw) ? (raw as string) : ''];
    }),
  ) as Record<FilterKey, string>;

export function useDirectory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewerId = useSessionStore((state) => state.user?.id ?? null);
  const urlQuery = (searchParams.get('q') ?? '').slice(0, PEOPLE_PAGE_LIMITS.queryMax);
  const [searchInput, setSearchInput] = useState(urlQuery);
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);

  const updateParams = useCallback(
    (patch: Partial<Record<FilterKey | 'q', string>>) =>
      setSearchParams((params) => {
        const next = new URLSearchParams(params);
        for (const [key, value] of Object.entries(patch)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        return next;
      }, FILTER_NAVIGATION),
    [setSearchParams],
  );

  useEffect(() => {
    setSearchInput(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === urlQuery) return;
    const timer = window.setTimeout(() => updateParams({ q: trimmed }), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput, urlQuery, updateParams]);

  const query: PeopleQuery = useMemo(
    () => ({ q: urlQuery || undefined, ...filters }),
    [urlQuery, filters],
  );
  const result = usePeople(query, viewerId);
  const people = useMemo(
    () => result.data?.pages.flatMap((page) => page.items) ?? [],
    [result.data],
  );

  return {
    searchInput,
    setSearchInput,
    filters,
    setFilter: (key: FilterKey, value: string) => updateParams({ [key]: value }),
    reset: () => {
      setSearchInput('');
      setSearchParams(new URLSearchParams(), FILTER_NAVIGATION);
    },
    activeFilterCount: FILTER_KEYS.filter((key) => filters[key]).length,
    hasQuery: Boolean(urlQuery) || FILTER_KEYS.some((key) => filters[key]),
    isSignedIn: viewerId !== null,
    people,
    total: result.data?.pages[0]?.total ?? 0,
    hasMore: result.hasNextPage,
    loadMore: () => void result.fetchNextPage(),
    isLoadingMore: result.isFetchingNextPage,
    isLoading: result.isPending,
    isFetching: result.isFetching && !result.isFetchingNextPage,
    isError: result.isError,
    retry: () => void result.refetch(),
  };
}

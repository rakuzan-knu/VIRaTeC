import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/apiClient';

const LIVE_CONTENT_STALE_MS = 30_000;

type LiveExports = Record<string, unknown>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const matchesShape = (snapshot: unknown, live: unknown): boolean => {
  if (Array.isArray(snapshot)) return Array.isArray(live);
  if (isRecord(snapshot)) {
    return (
      isRecord(live) &&
      Object.keys(snapshot).every(
        (key) => live[key] === undefined || matchesShape(snapshot[key], live[key]),
      )
    );
  }
  return typeof snapshot === typeof live;
};

const fetchLiveExports = async (domainId: string): Promise<LiveExports> => {
  const { buildLiveExports, contentTypesFor } =
    await import('../../../build-tools/contentful/runtime.ts');
  const types = contentTypesFor(domainId).join(',');
  const payload = await api.get<Parameters<typeof buildLiveExports>[1]>(
    `/content/entries?types=${encodeURIComponent(types)}`,
    { retryOnUnauthorized: false },
  );
  return buildLiveExports(domainId, payload);
};

export const useLiveContent = <T>(domainId: string, exportName: string, snapshot: T): T => {
  const { data } = useQuery({
    queryKey: ['live-content', domainId],
    queryFn: () => fetchLiveExports(domainId),
    enabled: typeof window !== 'undefined',
    staleTime: LIVE_CONTENT_STALE_MS,
    retry: false,
  });
  const live = data?.[exportName];

  return useMemo(
    () => (live !== undefined && matchesShape(snapshot, live) ? (live as T) : snapshot),
    [live, snapshot],
  );
};

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/apiClient';
import { encodeFieldMark, registerAssetAddress, useContentPreviewStore } from './contentPreview';

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

const withSnapshotFallback = (snapshot: unknown, live: unknown): unknown => {
  if (!isRecord(snapshot) || !isRecord(live)) return live;
  const merged: Record<string, unknown> = { ...snapshot };
  for (const [key, value] of Object.entries(live)) {
    merged[key] = value === undefined ? snapshot[key] : withSnapshotFallback(snapshot[key], value);
  }
  return merged;
};

const liveContentKeys = {
  all: ['live-content'] as const,
  domain: (domainId: string) => [...liveContentKeys.all, domainId] as const,
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

export const PREVIEW_CONTENT_QUERY_KEY = ['live-content', 'preview'] as const;

const fetchPreviewExports = async (domainId: string): Promise<LiveExports> => {
  const { buildLiveExports, contentTypesFor, markPreviewPayload } =
    await import('../../../build-tools/contentful/runtime.ts');
  const types = contentTypesFor(domainId).join(',');
  const payload = await api.get<Parameters<typeof buildLiveExports>[1]>(
    `/admin/content/preview?types=${encodeURIComponent(types)}`,
  );
  const marked = markPreviewPayload(payload, encodeFieldMark, registerAssetAddress);
  return buildLiveExports(domainId, marked, {
    strict: false,
    onIssues: (issues) => useContentPreviewStore.getState().setIssues(domainId, issues),
  });
};

export const useLiveContent = <T>(domainId: string, exportName: string, snapshot: T): T => {
  const isPreview = useContentPreviewStore((state) => state.enabled);
  const { data } = useQuery({
    queryKey: isPreview
      ? [...PREVIEW_CONTENT_QUERY_KEY, domainId]
      : liveContentKeys.domain(domainId),
    queryFn: () => (isPreview ? fetchPreviewExports(domainId) : fetchLiveExports(domainId)),
    enabled: typeof window !== 'undefined',
    staleTime: isPreview ? Infinity : LIVE_CONTENT_STALE_MS,
    retry: false,
  });
  const live = data?.[exportName];

  return useMemo(
    () =>
      live !== undefined && matchesShape(snapshot, live)
        ? (withSnapshotFallback(snapshot, live) as T)
        : snapshot,
    [live, snapshot],
  );
};

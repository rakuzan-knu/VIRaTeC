import { useDeferredValue, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';
import type { ContentFields } from '@viratec/contracts';
import type { LiveEntriesPayload } from '../../../build-tools/contentful/runtime.ts';
import { api } from '@/shared/api/apiClient';
import {
  encodeFieldMark,
  registerAssetAddress,
  useContentPreviewStore,
  type ContentIssue,
} from './contentPreview';

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

const definedEntries = (value: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));

const requiredTextOf = (items: readonly unknown[]): Record<string, string> | null => {
  const [first] = items;
  if (!isRecord(first)) return null;
  const keys = Object.keys(first).filter((key) =>
    items.every((item) => isRecord(item) && typeof item[key] === 'string'),
  );
  return Object.fromEntries(keys.map((key) => [key, '']));
};

const withSnapshotFallback = (snapshot: unknown, live: unknown): unknown => {
  if (Array.isArray(snapshot) && Array.isArray(live)) {
    const required = requiredTextOf(snapshot);
    return required
      ? live.map((item) => (isRecord(item) ? { ...required, ...definedEntries(item) } : item))
      : live;
  }
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
  const payload = await api.get<LiveEntriesPayload>(
    `/content/entries?types=${encodeURIComponent(types)}`,
    { retryOnUnauthorized: false },
  );
  return buildLiveExports(domainId, payload);
};

export const PREVIEW_CONTENT_QUERY_KEY = ['live-content', 'preview'] as const;

type ContentRuntime = typeof import('../../../build-tools/contentful/runtime.ts');

interface PreviewSource {
  runtime: ContentRuntime;
  payload: LiveEntriesPayload;
}

interface PreviewBuild {
  exports: LiveExports;
  issues: readonly ContentIssue[];
}

const NO_OVERRIDES: Record<string, ContentFields> = {};

const fetchPreviewSource = async (domainId: string): Promise<PreviewSource> => {
  const runtime = await import('../../../build-tools/contentful/runtime.ts');
  const types = runtime.contentTypesFor(domainId).join(',');
  const payload = await api.get<LiveEntriesPayload>(
    `/admin/content/preview?types=${encodeURIComponent(types)}`,
  );
  return { runtime, payload };
};

const entryIdOf = (item: unknown) => {
  if (!isRecord(item) || !isRecord(item.sys)) return null;
  return typeof item.sys.id === 'string' ? item.sys.id : null;
};

const entryIdsOf = (payload: LiveEntriesPayload) =>
  new Set([...payload.items, ...payload.includes.entries].flatMap((item) => entryIdOf(item) ?? []));

const withOverrides = (
  payload: LiveEntriesPayload,
  overrides: Record<string, ContentFields>,
): LiveEntriesPayload => {
  if (Object.keys(overrides).length === 0) return payload;
  const apply = (item: unknown) => {
    const id = entryIdOf(item);
    const fields = id ? overrides[id] : undefined;
    return fields && isRecord(item) ? { ...item, fields } : item;
  };
  return {
    ...payload,
    items: payload.items.map(apply),
    includes: { ...payload.includes, entries: payload.includes.entries.map(apply) },
  };
};

const buildPreview = (
  domainId: string,
  { runtime, payload }: PreviewSource,
  overrides: Record<string, ContentFields>,
): PreviewBuild => {
  let issues: readonly ContentIssue[] = [];
  const marked = runtime.markPreviewPayload(
    withOverrides(payload, overrides),
    encodeFieldMark,
    registerAssetAddress,
  );
  const exports = runtime.buildLiveExports(domainId, marked, {
    strict: false,
    onIssues: (found) => {
      issues = found;
    },
  });
  return { exports, issues };
};

const pickOverrides = (
  overrides: Record<string, ContentFields>,
  ids: ReadonlySet<string> | null,
): Record<string, ContentFields> => {
  if (!ids) return NO_OVERRIDES;
  const picked = Object.entries(overrides).filter(([id]) => ids.has(id));
  return picked.length > 0 ? Object.fromEntries(picked) : NO_OVERRIDES;
};

export const useLiveContent = <T>(domainId: string, exportName: string, snapshot: T): T => {
  const isPreview = useContentPreviewStore((state) => state.enabled);
  const isBrowser = typeof window !== 'undefined';
  const published = useQuery({
    queryKey: liveContentKeys.domain(domainId),
    queryFn: () => fetchLiveExports(domainId),
    enabled: isBrowser && !isPreview,
    staleTime: LIVE_CONTENT_STALE_MS,
    retry: false,
  });
  const preview = useQuery({
    queryKey: [...PREVIEW_CONTENT_QUERY_KEY, domainId],
    queryFn: () => fetchPreviewSource(domainId),
    enabled: isBrowser && isPreview,
    staleTime: Infinity,
    retry: false,
    structuralSharing: false,
  });
  const source = isPreview ? preview.data : undefined;
  const entryIds = useMemo(() => (source ? entryIdsOf(source.payload) : null), [source]);
  const overrides = useDeferredValue(
    useContentPreviewStore(useShallow((state) => pickOverrides(state.entryOverrides, entryIds))),
  );
  const build = useMemo(
    () => (source ? buildPreview(domainId, source, overrides) : null),
    [domainId, source, overrides],
  );

  useEffect(() => {
    if (build) useContentPreviewStore.getState().setIssues(domainId, build.issues);
  }, [domainId, build]);

  const data = isPreview ? build?.exports : published.data;
  const live = data?.[exportName];

  return useMemo(
    () =>
      live !== undefined && matchesShape(snapshot, live)
        ? (withSnapshotFallback(snapshot, live) as T)
        : snapshot,
    [live, snapshot],
  );
};

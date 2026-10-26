import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateRecordRequestDto,
  RecordResource,
  SaveContentEntryRequestDto,
  SaveRecordRequestDto,
} from '@viratec/contracts';
import {
  PREVIEW_CONTENT_QUERY_KEY,
  RECORD_QUERY_ROOTS,
  invalidateRecordDrafts,
} from '@/shared/lib';
import {
  createEditorEntry,
  createRecord,
  deleteRecord,
  discardContentChange,
  fetchContentChanges,
  fetchEditorAsset,
  fetchEditorEntry,
  fetchEntryReferences,
  fetchRecord,
  publishContent,
  saveEditorEntry,
  saveRecord,
  uploadEditorAsset,
} from '../api/editorApi';

export const EDITOR_QUERY_KEY = ['site-editor'] as const;

const noRetryOnClientErrors = (failureCount: number, error: unknown) =>
  failureCount < 2 && !(error instanceof Error && 'status' in error && Number(error.status) < 500);

export const useEditorEntry = (id: string | null) =>
  useQuery({
    queryKey: [...EDITOR_QUERY_KEY, 'entry', id],
    queryFn: () => fetchEditorEntry(id ?? ''),
    enabled: Boolean(id),
    retry: noRetryOnClientErrors,
    staleTime: 0,
  });

export const useEditorAsset = (id: string | null) =>
  useQuery({
    queryKey: [...EDITOR_QUERY_KEY, 'asset', id],
    queryFn: () => fetchEditorAsset(id ?? ''),
    enabled: Boolean(id),
    retry: noRetryOnClientErrors,
  });

export const useEntryReferences = (id: string | null) =>
  useQuery({
    queryKey: [...EDITOR_QUERY_KEY, 'references', id],
    queryFn: () => fetchEntryReferences(id ?? ''),
    enabled: Boolean(id),
    retry: noRetryOnClientErrors,
  });

export const useContentChanges = () =>
  useQuery({
    queryKey: [...EDITOR_QUERY_KEY, 'changes'],
    queryFn: fetchContentChanges,
    retry: noRetryOnClientErrors,
    refetchInterval: 30_000,
  });

export const useRefreshRecordQueries = () => {
  const queryClient = useQueryClient();
  return useCallback(() => {
    invalidateRecordDrafts();
    return queryClient.invalidateQueries({
      predicate: (query) => RECORD_QUERY_ROOTS.includes(String(query.queryKey[0])),
    });
  }, [queryClient]);
};

const useRefreshAfter = () => {
  const queryClient = useQueryClient();
  const refreshRecords = useRefreshRecordQueries();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: EDITOR_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: PREVIEW_CONTENT_QUERY_KEY }),
      refreshRecords(),
    ]);
};

const useRefreshRecordsAfter = () => {
  const queryClient = useQueryClient();
  const refreshRecords = useRefreshRecordQueries();
  return () =>
    Promise.all([queryClient.invalidateQueries({ queryKey: EDITOR_QUERY_KEY }), refreshRecords()]);
};

export const useEditorRecord = (resource: RecordResource | null, key: string | null) =>
  useQuery({
    queryKey: [...EDITOR_QUERY_KEY, 'record', resource, key],
    queryFn: () => fetchRecord(resource ?? 'project', key ?? ''),
    enabled: Boolean(resource && key),
    retry: noRetryOnClientErrors,
    staleTime: 0,
  });

export const useSaveRecord = () => {
  const refresh = useRefreshRecordsAfter();
  return useMutation({
    mutationFn: ({
      resource,
      key,
      dto,
    }: {
      resource: RecordResource;
      key: string;
      dto: SaveRecordRequestDto;
    }) => saveRecord(resource, key, dto),
    onSuccess: refresh,
  });
};

export const useCreateRecord = () => {
  const refresh = useRefreshRecordsAfter();
  return useMutation({
    mutationFn: ({ resource, dto }: { resource: RecordResource; dto: CreateRecordRequestDto }) =>
      createRecord(resource, dto),
    onSuccess: refresh,
  });
};

export const useDeleteRecord = () => {
  const refresh = useRefreshRecordsAfter();
  return useMutation({
    mutationFn: ({
      resource,
      key,
      label,
    }: {
      resource: RecordResource;
      key: string;
      label: string;
    }) => deleteRecord(resource, key, label),
    onSuccess: refresh,
  });
};

export const useSaveEntry = () => {
  const refresh = useRefreshAfter();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: SaveContentEntryRequestDto }) =>
      saveEditorEntry(id, dto),
    onSuccess: refresh,
  });
};

export const useCreateEntry = () => {
  const refresh = useRefreshAfter();
  return useMutation({ mutationFn: createEditorEntry, onSuccess: refresh });
};

export const useUploadAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadEditorAsset,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...EDITOR_QUERY_KEY, 'changes'] }),
  });
};

export const useDiscardChange = () => {
  const refresh = useRefreshAfter();
  return useMutation({ mutationFn: discardContentChange, onSuccess: refresh });
};

export const usePublishContent = () => {
  const refresh = useRefreshAfter();
  return useMutation({ mutationFn: publishContent, onSettled: refresh });
};

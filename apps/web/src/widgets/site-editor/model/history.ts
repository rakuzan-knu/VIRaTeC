import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type {
  ContentEntryDto,
  ContentFields,
  ContentResourceKind,
  RecordData,
  RecordResource,
} from '@viratec/contracts';
import { PREVIEW_CONTENT_QUERY_KEY } from '@/shared/lib';
import {
  deleteRecord,
  fetchContentChanges,
  fetchEditorEntry,
  fetchRecord,
  saveEditorEntry,
  saveRecord,
} from '../api/editorApi';
import { discardChange } from './discard';
import { useSiteEditorMessages } from './messages';
import { EDITOR_QUERY_KEY, useRefreshRecordQueries } from './queries';
import { useSiteEditorStore, type EditorAction } from './store';

const RECORD_KINDS: Record<RecordResource, ContentResourceKind> = {
  project: 'PROJECT',
  event: 'EVENT',
  publication: 'PUBLICATION',
};

const discard = async (kind: ContentResourceKind, resourceId: string) => {
  const change = (await fetchContentChanges()).find(
    (item) => item.resourceType === kind && item.resourceId === resourceId,
  );
  if (change) await discardChange(change);
};

const saveEntryFields = async (id: string, fields: ContentFields, label: string) => {
  const current = await fetchEditorEntry(id);
  await saveEditorEntry(id, { version: current.version, fields, label });
};

const saveRecordData = async (
  resource: RecordResource,
  key: string,
  data: RecordData,
  label: string,
) => {
  const current = await fetchRecord(resource, key);
  await saveRecord(resource, key, { data, baseUpdatedAt: current.updatedAt, label });
};

export const isCleanlyPublished = (entry: ContentEntryDto) =>
  entry.publishedVersion !== null && entry.version === entry.publishedVersion + 1;

export const entrySaveAction = (options: {
  entry: ContentEntryDto;
  after: ContentFields;
  label: string;
  changeLabel: string;
}): EditorAction => ({
  label: options.label,
  undo: () =>
    isCleanlyPublished(options.entry)
      ? discard('ENTRY', options.entry.id)
      : saveEntryFields(options.entry.id, options.entry.fields, options.changeLabel),
  redo: () => saveEntryFields(options.entry.id, options.after, options.changeLabel),
});

export const entryCreateAction = (options: { id: string; label: string }): EditorAction => ({
  label: options.label,
  undo: () => discard('ENTRY', options.id),
});

export const recordSaveAction = (options: {
  resource: RecordResource;
  key: string;
  before: RecordData;
  after: RecordData;
  hadDraft: boolean;
  label: string;
  changeLabel: string;
}): EditorAction => ({
  label: options.label,
  undo: () =>
    options.hadDraft
      ? saveRecordData(options.resource, options.key, options.before, options.changeLabel)
      : discard(RECORD_KINDS[options.resource], options.key),
  redo: () => saveRecordData(options.resource, options.key, options.after, options.changeLabel),
});

export const recordCreateAction = (options: {
  resource: RecordResource;
  key: string;
  label: string;
}): EditorAction => ({
  label: options.label,
  undo: () => discard(RECORD_KINDS[options.resource], options.key),
});

export const recordDeleteAction = (options: {
  resource: RecordResource;
  key: string;
  before: RecordData;
  hadDraft: boolean;
  label: string;
  changeLabel: string;
}): EditorAction => ({
  label: options.label,
  undo: () =>
    options.hadDraft
      ? saveRecordData(options.resource, options.key, options.before, options.changeLabel)
      : discard(RECORD_KINDS[options.resource], options.key),
  redo: () => deleteRecord(options.resource, options.key, options.changeLabel),
});

export function useEditorHistory() {
  const t = useSiteEditorMessages();
  const queryClient = useQueryClient();
  const refreshRecords = useRefreshRecordQueries();

  const refresh = useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: EDITOR_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: PREVIEW_CONTENT_QUERY_KEY }),
        refreshRecords(),
      ]),
    [queryClient, refreshRecords],
  );

  const step = useCallback(
    async (direction: 'undo' | 'redo') => {
      const store = useSiteEditorStore.getState();
      const stack = direction === 'undo' ? store.past : store.future;
      const action = stack[stack.length - 1];
      if (!action || store.isHistoryBusy) return false;
      const run = direction === 'undo' ? action.undo : action.redo;
      if (!run) return false;

      store.setHistoryStatus({ busy: true, error: false });
      try {
        await run();
      } catch {
        store.setHistoryStatus({ busy: false, error: true });
        await refresh();
        return false;
      }

      const { past, future } = useSiteEditorStore.getState();
      if (direction === 'undo') {
        store.setHistory(past.slice(0, -1), action.redo ? [...future, action] : []);
        store.announce(t.announce.undone(action.label));
      } else {
        store.setHistory([...past, action], future.slice(0, -1));
        store.announce(t.announce.redone(action.label));
      }
      store.setHistoryStatus({ busy: false, error: false });
      await refresh();
      return true;
    },
    [refresh, t],
  );

  const undo = useCallback(() => step('undo'), [step]);
  const redo = useCallback(() => step('redo'), [step]);

  const undoAll = useCallback(async () => {
    while (useSiteEditorStore.getState().past.length > 0) {
      if (!(await step('undo'))) return;
    }
  }, [step]);

  return { undo, redo, undoAll };
}

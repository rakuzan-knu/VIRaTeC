import { useEffect } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import {
  isRecordResource,
  type ContentEntryDto,
  type ContentFields,
  type RecordData,
  type RecordDto,
  type RecordResource,
} from '@viratec/contracts';
import { PREVIEW_CONTENT_QUERY_KEY, useContentPreviewStore } from '@/shared/lib';
import { useLocale, type Locale } from '@/shared/i18n';
import { fetchEditorEntry, fetchRecord, saveEditorEntry, saveRecord } from '../api/editorApi';
import {
  changeLabel,
  entryLabel,
  findContentType,
  normalizeFields,
  sameValue,
} from './contentModel';
import { isConflict } from './errors';
import { typeName } from './fieldText';
import { entrySaveAction, recordSaveAction } from './history';
import { useSiteEditorMessages, type SiteEditorMessages } from './messages';
import { EDITOR_QUERY_KEY, editorKeys, refreshRecordQueries } from './queries';
import { changeGroup, rebaseDraft } from './rebase';
import { normalizeRecordData, recordLabel } from './recordModel';
import { setActiveAutosave, type ConflictChoice } from './autosaveRegistry';
import { useSiteEditorStore, type SaveStatus } from './store';

const AUTOSAVE_DELAY_MS = 1000;

const MAX_REBASE_ATTEMPTS = 2;

interface AutosaveContext {
  queryClient: QueryClient;
  t: SiteEditorMessages;
  locale: Locale;
}

const ENTRY_PREFIX = 'entry:';
const RECORD_PREFIX = 'record:';

export const entrySaveKey = (entryId: string) => `${ENTRY_PREFIX}${entryId}`;

export const recordSaveKey = (draftKey: string) => `${RECORD_PREFIX}${draftKey}`;

const parseRecordKey = (draftKey: string) => {
  const separator = draftKey.indexOf(':');
  const resource = draftKey.slice(0, separator);
  return isRecordResource(resource) ? { resource, key: draftKey.slice(separator + 1) } : null;
};

const mapValues = <T, R>(source: Record<string, T>, map: (value: T) => R) =>
  Object.fromEntries(Object.entries(source).map(([key, value]) => [key, map(value)]));

function createAutosave({ queryClient, t, locale }: AutosaveContext) {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const chains = new Map<string, Promise<void>>();
  let isWriting = false;
  const store = () => useSiteEditorStore.getState();
  const write = (update: () => void) => {
    isWriting = true;
    try {
      update();
    } finally {
      isWriting = false;
    }
  };
  const setStatus = (key: string, status: SaveStatus | null) => store().setSaveState(key, status);

  const refreshEntries = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: EDITOR_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: PREVIEW_CONTENT_QUERY_KEY }),
    ]);

  const refreshRecords = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: EDITOR_QUERY_KEY }),
      refreshRecordQueries(queryClient),
    ]);

  const loadEntry = async (id: string) =>
    queryClient.getQueryData<ContentEntryDto>(editorKeys.entry(id)) ?? fetchEditorEntry(id);

  const loadRecord = async (resource: RecordResource, key: string) =>
    queryClient.getQueryData<RecordDto>(editorKeys.record(resource, key)) ??
    fetchRecord(resource, key);

  const isEntryClean = (id: string) => {
    const draft = store().drafts[id];
    return !draft || sameValue(normalizeFields(draft.fields), normalizeFields(draft.base));
  };

  const isRecordClean = (draftKey: string, resource: RecordResource) => {
    const draft = store().recordDrafts[draftKey];
    return (
      !draft ||
      sameValue(
        normalizeRecordData(resource, draft.data),
        normalizeRecordData(resource, draft.base),
      )
    );
  };

  const settle = (key: string, isClean: boolean, drop: () => void) => {
    if (isClean) write(drop);
    setStatus(key, isClean || !timers.has(key) ? 'saved' : 'saving');
  };

  const saveEntry = async (id: string, attempt = 0): Promise<void> => {
    const key = entrySaveKey(id);
    const draft = store().drafts[id];
    if (!draft) {
      if (store().saveStates[key] === 'saving') setStatus(key, null);
      return;
    }
    if (isEntryClean(id)) {
      settle(key, true, () => store().dropDraft(id));
      return;
    }

    setStatus(key, 'saving');
    const fields = normalizeFields(draft.fields);
    let before: ContentEntryDto;
    let saved: ContentEntryDto;
    let label = '';
    try {
      before = await loadEntry(id);
      const type = findContentType(before.contentTypeId);
      label = changeLabel(
        typeName(t.fields, before.contentTypeId, type?.name ?? before.contentTypeId),
        entryLabel(before.contentTypeId, fields, before.locales, locale),
      );
      saved = await saveEditorEntry(id, { version: draft.version, fields, label });
    } catch (error) {
      if (isConflict(error) && attempt < MAX_REBASE_ATTEMPTS) return rebaseEntry(id, attempt + 1);
      setStatus(key, isConflict(error) ? 'conflict' : 'error');
      return;
    }

    const current = store().drafts[id];
    if (current) {
      write(() =>
        store().setDraft(id, {
          version: saved.version,
          base: saved.fields,
          fields: current.fields,
        }),
      );
    }
    queryClient.setQueryData(editorKeys.entry(id), saved);
    store().pushAction({
      ...entrySaveAction({
        entry: before,
        after: fields,
        label: t.history.saved(label),
        changeLabel: label,
      }),
      group: changeGroup(key, draft.base, draft.fields),
    });
    await refreshEntries();
    settle(key, isEntryClean(id), () => store().dropDraft(id));
  };

  const rebaseEntry = async (id: string, attempt: number, keepMine = false) => {
    const key = entrySaveKey(id);
    const draft = store().drafts[id];
    if (!draft) return;
    const latest = await fetchEditorEntry(id);
    queryClient.setQueryData(editorKeys.entry(id), latest);
    const { merged, hasConflict } = rebaseDraft<ContentFields>(
      latest.fields,
      draft.base,
      draft.fields,
      keepMine,
    );
    if (hasConflict) {
      setStatus(key, 'conflict');
      return;
    }
    write(() =>
      store().setDraft(id, { version: latest.version, base: latest.fields, fields: merged }),
    );
    await saveEntry(id, attempt);
  };

  const saveRecordDraft = async (draftKey: string, attempt = 0): Promise<void> => {
    const parsed = parseRecordKey(draftKey);
    const draft = store().recordDrafts[draftKey];
    const key = recordSaveKey(draftKey);
    if (!parsed || !draft) {
      if (store().saveStates[key] === 'saving') setStatus(key, null);
      return;
    }
    const { resource, key: recordKey } = parsed;
    const drop = () => store().dropRecordDraft(draftKey);
    if (isRecordClean(draftKey, resource)) {
      settle(key, true, drop);
      return;
    }

    setStatus(key, 'saving');
    const data = normalizeRecordData(resource, draft.data);
    const label = `${t.records.resource[resource]}: ${recordLabel(resource, data, locale)}`;
    let before: RecordDto;
    let saved: RecordDto;
    try {
      before = await loadRecord(resource, recordKey);
      saved = await saveRecord(resource, recordKey, {
        data,
        baseUpdatedAt: draft.baseUpdatedAt,
        label,
      });
    } catch (error) {
      if (isConflict(error) && attempt < MAX_REBASE_ATTEMPTS) {
        return rebaseRecord(draftKey, attempt + 1);
      }
      setStatus(key, isConflict(error) ? 'conflict' : 'error');
      return;
    }

    const current = store().recordDrafts[draftKey];
    if (current) {
      write(() =>
        store().setRecordDraft(draftKey, {
          baseUpdatedAt: saved.updatedAt,
          base: saved.data,
          data: current.data,
        }),
      );
    }
    queryClient.setQueryData(editorKeys.record(resource, recordKey), saved);
    store().pushAction({
      ...recordSaveAction({
        resource,
        key: recordKey,
        before: before.data,
        after: data,
        hadDraft: before.hasDraft,
        label: t.history.saved(label),
        changeLabel: label,
      }),
      group: changeGroup(key, draft.base, draft.data),
    });
    await refreshRecords();
    settle(key, isRecordClean(draftKey, resource), drop);
  };

  const rebaseRecord = async (draftKey: string, attempt: number, keepMine = false) => {
    const parsed = parseRecordKey(draftKey);
    const draft = store().recordDrafts[draftKey];
    if (!parsed || !draft) return;
    const latest = await fetchRecord(parsed.resource, parsed.key);
    queryClient.setQueryData(editorKeys.record(parsed.resource, parsed.key), latest);
    const { merged, hasConflict } = rebaseDraft<RecordData>(
      latest.data,
      draft.base,
      draft.data,
      keepMine,
    );
    if (hasConflict) {
      setStatus(recordSaveKey(draftKey), 'conflict');
      return;
    }
    write(() =>
      store().setRecordDraft(draftKey, {
        baseUpdatedAt: latest.updatedAt,
        base: latest.data,
        data: merged,
      }),
    );
    await saveRecordDraft(draftKey, attempt);
  };

  const runSave = async (key: string) => {
    if (store().saveStates[key] === 'conflict') return;
    if (key.startsWith(ENTRY_PREFIX)) return saveEntry(key.slice(ENTRY_PREFIX.length));
    return saveRecordDraft(key.slice(RECORD_PREFIX.length));
  };

  const enqueue = (key: string, task: () => Promise<void>) => {
    const previous = chains.get(key) ?? Promise.resolve();
    const next = previous
      .then(task)
      .catch(() => setStatus(key, 'error'))
      .finally(() => {
        if (chains.get(key) === next) chains.delete(key);
      });
    chains.set(key, next);
    return next;
  };

  const run = (key: string) => {
    const timer = timers.get(key);
    if (timer) clearTimeout(timer);
    timers.delete(key);
    return enqueue(key, () => runSave(key));
  };

  const schedule = (key: string) => {
    const timer = timers.get(key);
    if (timer) clearTimeout(timer);
    if (store().saveStates[key] !== 'conflict') setStatus(key, 'saving');
    timers.set(
      key,
      setTimeout(() => void run(key), AUTOSAVE_DELAY_MS),
    );
  };

  const flush = async (key?: string) => {
    const keys = key ? [key] : [...timers.keys()];
    await Promise.all([
      ...keys.map(run),
      ...[...chains.entries()].filter(([item]) => !key || item === key).map(([, chain]) => chain),
    ]);
    store().closeGroup();
  };

  const cancel = (key: string) => {
    const timer = timers.get(key);
    if (timer) clearTimeout(timer);
    timers.delete(key);
    setStatus(key, null);
  };

  const retry = () =>
    Promise.all(
      Object.entries(store().saveStates)
        .filter(([, status]) => status === 'error')
        .map(([key]) => run(key)),
    );

  const resolve = (key: string, choice: ConflictChoice) =>
    enqueue(key, async () => {
      if (key.startsWith(ENTRY_PREFIX)) {
        const id = key.slice(ENTRY_PREFIX.length);
        if (choice === 'mine') {
          await rebaseEntry(id, MAX_REBASE_ATTEMPTS, true);
          return;
        }
        queryClient.setQueryData(editorKeys.entry(id), await fetchEditorEntry(id));
        write(() => store().dropDraft(id));
      } else {
        const draftKey = key.slice(RECORD_PREFIX.length);
        const parsed = parseRecordKey(draftKey);
        if (choice === 'mine') {
          await rebaseRecord(draftKey, MAX_REBASE_ATTEMPTS, true);
          return;
        }
        if (parsed) {
          queryClient.setQueryData(
            editorKeys.record(parsed.resource, parsed.key),
            await fetchRecord(parsed.resource, parsed.key),
          );
        }
        write(() => store().dropRecordDraft(draftKey));
      }
      setStatus(key, null);
      await (key.startsWith(ENTRY_PREFIX) ? refreshEntries() : refreshRecords());
    });

  const isBusy = () => timers.size > 0 || chains.size > 0;

  const isOwnWrite = () => isWriting;

  const dispose = () => {
    for (const timer of timers.values()) clearTimeout(timer);
    timers.clear();
  };

  return { schedule, flush, cancel, retry, resolve, isBusy, isOwnWrite, dispose };
}

const syncPreview = () => {
  const { drafts, recordDrafts } = useSiteEditorStore.getState();
  const preview = useContentPreviewStore.getState();
  preview.setEntryOverrides(mapValues(drafts, (draft) => draft.fields));
  preview.setRecordOverrides(mapValues(recordDrafts, (draft) => draft.data));
};

export function useAutosave() {
  const queryClient = useQueryClient();
  const t = useSiteEditorMessages();
  const locale = useLocale();

  useEffect(() => {
    const autosave = createAutosave({ queryClient, t, locale });
    setActiveAutosave(autosave);
    syncPreview();
    const unsubscribe = useSiteEditorStore.subscribe((state, previous) => {
      if (state.history !== previous.history) void autosave.flush();
      if (state.drafts === previous.drafts && state.recordDrafts === previous.recordDrafts) return;
      syncPreview();
      if (autosave.isOwnWrite()) return;
      for (const [id, draft] of Object.entries(state.drafts)) {
        if (previous.drafts[id] !== draft) autosave.schedule(entrySaveKey(id));
      }
      for (const [draftKey, draft] of Object.entries(state.recordDrafts)) {
        if (previous.recordDrafts[draftKey] !== draft) autosave.schedule(recordSaveKey(draftKey));
      }
    });
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!autosave.isBusy()) return;
      void autosave.flush();
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      void autosave.flush().finally(autosave.dispose);
      setActiveAutosave(null, autosave);
    };
  }, [queryClient, t, locale]);
}

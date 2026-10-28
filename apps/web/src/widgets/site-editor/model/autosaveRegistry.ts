export type ConflictChoice = 'mine' | 'theirs';

interface AutosaveHandle {
  flush: (key?: string) => Promise<void>;
  cancel: (key: string) => void;
  retry: () => Promise<unknown>;
  resolve: (key: string, choice: ConflictChoice) => Promise<void>;
}

let active: AutosaveHandle | null = null;

export const setActiveAutosave = (next: AutosaveHandle | null, previous?: AutosaveHandle) => {
  if (next || active === previous) active = next;
};

export const flushDrafts = (key?: string) => active?.flush(key) ?? Promise.resolve();

export const cancelDraftSave = (key: string) => active?.cancel(key);

export const retryFailedSaves = () => active?.retry() ?? Promise.resolve();

export const resolveConflict = (key: string, choice: ConflictChoice) =>
  active?.resolve(key, choice) ?? Promise.resolve();

import { create } from 'zustand';
import type { ContentFields, RecordData } from '@viratec/contracts';
import type { PageSectionItem } from '@/shared/config/pageLayout';
import type { Locale } from '@/shared/i18n';

export interface EditorSelection {
  entryId: string;
  contentTypeId?: string;
  fieldId?: string;
  locale?: Locale;
}

export interface EntryDraft {
  version: number;
  fields: ContentFields;
}

export type EditorMode = 'edit' | 'preview';

export interface LayoutDraft {
  version: number | null;
  sections: PageSectionItem[];
}

export interface StructureFocus {
  sectionId?: string;
}

export interface EditorAction {
  label: string;
  undo: () => Promise<unknown>;
  redo?: () => Promise<unknown>;
}

export interface Announcement {
  id: number;
  text: string;
}

interface SiteEditorState {
  mode: EditorMode;
  history: EditorSelection[];
  isSummaryOpen: boolean;
  drafts: Record<string, EntryDraft>;
  recordDrafts: Record<string, RecordData>;
  layoutDrafts: Record<string, LayoutDraft>;
  structure: StructureFocus | null;
  past: EditorAction[];
  future: EditorAction[];
  isHistoryBusy: boolean;
  hasHistoryError: boolean;
  announcement: Announcement | null;
  isSummaryCollapsed: boolean;
  setMode: (mode: EditorMode) => void;
  select: (selection: EditorSelection) => void;
  open: (selection: EditorSelection) => void;
  back: () => void;
  close: () => void;
  setSummaryOpen: (open: boolean) => void;
  setDraft: (entryId: string, draft: EntryDraft) => void;
  dropDraft: (entryId: string) => void;
  setRecordDraft: (key: string, data: RecordData) => void;
  dropRecordDraft: (key: string) => void;
  setLayoutDraft: (page: string, draft: LayoutDraft) => void;
  dropLayoutDraft: (page: string) => void;
  openStructure: (focus: StructureFocus) => void;
  closeStructure: () => void;
  pushAction: (action: EditorAction) => void;
  setHistory: (past: EditorAction[], future: EditorAction[]) => void;
  setHistoryStatus: (status: { busy: boolean; error: boolean }) => void;
  announce: (text: string) => void;
  setSummaryCollapsed: (collapsed: boolean) => void;
  reset: () => void;
}

export const useSiteEditorStore = create<SiteEditorState>((set) => ({
  mode: 'edit',
  history: [],
  isSummaryOpen: false,
  drafts: {},
  recordDrafts: {},
  layoutDrafts: {},
  structure: null,
  past: [],
  future: [],
  isHistoryBusy: false,
  hasHistoryError: false,
  announcement: null,
  isSummaryCollapsed: false,
  setMode: (mode) => set({ mode }),
  select: (selection) => set({ history: [selection], isSummaryOpen: false, structure: null }),
  open: (selection) => set((state) => ({ history: [...state.history, selection] })),
  back: () => set((state) => ({ history: state.history.slice(0, -1) })),
  close: () => set({ history: [] }),
  setSummaryOpen: (isSummaryOpen) =>
    set((state) => ({ isSummaryOpen, structure: isSummaryOpen ? null : state.structure })),
  setDraft: (entryId, draft) => set((state) => ({ drafts: { ...state.drafts, [entryId]: draft } })),
  dropDraft: (entryId) =>
    set((state) => {
      const { [entryId]: _dropped, ...drafts } = state.drafts;
      return { drafts };
    }),
  setRecordDraft: (key, data) =>
    set((state) => ({ recordDrafts: { ...state.recordDrafts, [key]: data } })),
  dropRecordDraft: (key) =>
    set((state) => {
      const { [key]: _dropped, ...recordDrafts } = state.recordDrafts;
      return { recordDrafts };
    }),
  setLayoutDraft: (page, draft) =>
    set((state) => ({ layoutDrafts: { ...state.layoutDrafts, [page]: draft } })),
  dropLayoutDraft: (page) =>
    set((state) => {
      const { [page]: _dropped, ...layoutDrafts } = state.layoutDrafts;
      return { layoutDrafts };
    }),
  openStructure: (structure) => set({ structure, history: [], isSummaryOpen: false }),
  closeStructure: () => set({ structure: null }),
  pushAction: (action) =>
    set((state) => ({ past: [...state.past, action], future: [], hasHistoryError: false })),
  setHistory: (past, future) => set({ past, future }),
  setHistoryStatus: ({ busy, error }) => set({ isHistoryBusy: busy, hasHistoryError: error }),
  announce: (text) =>
    set((state) => ({ announcement: { id: (state.announcement?.id ?? 0) + 1, text } })),
  setSummaryCollapsed: (isSummaryCollapsed) => set({ isSummaryCollapsed }),
  reset: () =>
    set({
      mode: 'edit',
      history: [],
      isSummaryOpen: false,
      drafts: {},
      recordDrafts: {},
      layoutDrafts: {},
      structure: null,
      past: [],
      future: [],
      isHistoryBusy: false,
      hasHistoryError: false,
      announcement: null,
      isSummaryCollapsed: false,
    }),
}));

export const useCurrentSelection = () =>
  useSiteEditorStore((state) => state.history[state.history.length - 1] ?? null);

export const useHasUnsavedDrafts = () =>
  useSiteEditorStore(
    (state) =>
      Object.keys(state.drafts).length +
        Object.keys(state.recordDrafts).length +
        Object.keys(state.layoutDrafts).length >
      0,
  );

export const recordDraftKey = (resource: string, key: string) => `${resource}:${key}`;

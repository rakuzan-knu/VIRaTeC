import { useCallback, useEffect, useRef, useState } from 'react';
import { CircleHelp, Eye, LayoutList, ListChecks, LogOut, PencilLine } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { AdminPermission, recordResourceOf } from '@viratec/contracts';
import { useSessionStore } from '@/entities/session';
import { getApiErrorCode } from '@/shared/api/apiClient';
import { SITE_EDITOR_INTRO_STORAGE_KEY } from '@/shared/config/storageKeys';
import { cn, PREVIEW_CONTENT_QUERY_KEY, useContentPreviewStore } from '@/shared/lib';
import { Tooltip } from '@/shared/ui/Tooltip';
import type { EditorGateCode } from './EditorGate';
import { useAutosave } from '../model/autosave';
import { flushDrafts } from '../model/autosaveRegistry';
import { useEditorHistory } from '../model/history';
import { NO_PERMISSIONS } from '../model/permissions';
import { useSiteEditorMessages } from '../model/messages';
import { EDITOR_QUERY_KEY, useContentChanges, useRefreshRecordQueries } from '../model/queries';
import {
  useCurrentSelection,
  useHasUnsavedDrafts,
  useSiteEditorStore,
  type EditorMode,
} from '../model/store';
import { isTextInput } from '../model/shortcuts';
import {
  EDITOR_ROOT_ATTRIBUTE,
  stepCanvasTarget,
  useCanvasTargets,
  type CanvasTarget,
} from '../model/useCanvasTargets';
import { ConfirmDialog } from './ConfirmDialog';
import { DeviceFrame } from './DeviceFrame';
import { DeviceSwitch } from './DeviceSwitch';
import { EditorGate } from './EditorGate';
import { EditorOutlines } from './EditorOutlines';
import { SectionBadge } from './SectionBadge';
import { HelpDialog } from './HelpDialog';
import { EDITOR_TOOLTIP_CLASS, IconButton } from './IconButton';
import { InspectorPanel } from './InspectorPanel';
import { PublishControl } from './PublishControl';
import { RecordPanel } from './RecordPanel';
import { SaveIndicator } from './SaveIndicator';
import { SelectionActions } from './SelectionActions';
import { StructurePanel } from './StructurePanel';
import { SummaryPanel } from './SummaryPanel';

const TOOLBAR_BUTTON =
  'inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl px-3 text-[14px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus motion-reduce:transition-none';

const readIntroPending = () => {
  try {
    return localStorage.getItem(SITE_EDITOR_INTRO_STORAGE_KEY) !== '1';
  } catch {
    return false;
  }
};

const gateFor = (error: unknown): EditorGateCode | null => {
  const code = getApiErrorCode(error);
  if (code === 'MFA_REVERIFY_REQUIRED' || code === 'MFA_SETUP_REQUIRED') return code;
  if (code === 'ADMIN_ACCESS_REQUIRED' || code === 'PERMISSION_DENIED') return 'NO_ACCESS';
  return null;
};

export function SiteEditor() {
  const t = useSiteEditorMessages();
  const queryClient = useQueryClient();
  const mode = useSiteEditorStore((state) => state.mode);
  const isSummaryOpen = useSiteEditorStore((state) => state.isSummaryOpen);
  const structure = useSiteEditorStore((state) => state.structure);
  const activeLayout = useContentPreviewStore((state) => state.activeLayout);
  const layoutDraft = useSiteEditorStore((state) =>
    activeLayout ? state.layoutDrafts[activeLayout.page] : undefined,
  );
  const { setMode, select, setSummaryOpen, reset, openStructure, closeStructure } =
    useSiteEditorStore.getState();
  const selection = useCurrentSelection();
  const hasUnsavedDrafts = useHasUnsavedDrafts();
  const changes = useContentChanges();
  const gate = gateFor(changes.error);
  const [selected, setSelected] = useState<CanvasTarget | null>(null);
  const [isConfirmingExit, setConfirmingExit] = useState(false);
  const [isHelpOpen, setHelpOpen] = useState(readIntroPending);
  const [focusRequest, setFocusRequest] = useState(0);
  const announcement = useSiteEditorStore((state) => state.announcement);
  const history = useEditorHistory();
  const refreshRecords = useRefreshRecordQueries();
  const device = useSiteEditorStore((state) => state.device);
  const canPublish = useSessionStore((state) =>
    (state.user?.permissions ?? NO_PERMISSIONS).includes(AdminPermission.CONTENT_PUBLISH),
  );
  useAutosave();

  useEffect(() => {
    void refreshRecords();
  }, [refreshRecords]);

  const open = useCallback(
    (target: CanvasTarget) => {
      setSelected(target);
      if (target.kind === 'section') {
        openStructure({ sectionId: target.sectionId });
        return;
      }
      select({
        entryId: target.address.entryId,
        contentTypeId: target.address.contentTypeId,
        fieldId: target.kind === 'entry' ? undefined : target.address.fieldId,
        locale: target.kind === 'field' ? target.address.locale : undefined,
      });
    },
    [select, openStructure],
  );

  const isCanvasActive = mode === 'edit' && !gate && device === 'desktop';
  const { hovered, section } = useCanvasTargets(isCanvasActive, setSelected, open);

  const step = (direction: 1 | -1) => {
    const next = stepCanvasTarget(selected, direction);
    if (!next) {
      useSiteEditorStore.getState().announce(t.canvas.nothing);
      return;
    }
    next.element.scrollIntoView({ block: 'center' });
    setSelected(next);
    setFocusRequest((count) => count + 1);
  };
  const stepRef = useRef(step);
  stepRef.current = step;

  const isPanelOpen = Boolean(selection) || Boolean(structure);
  const wasPanelOpen = useRef(isPanelOpen);
  useEffect(() => {
    const isFocusLost = !document.activeElement || document.activeElement === document.body;
    if (wasPanelOpen.current && !isPanelOpen && isFocusLost) setFocusRequest((count) => count + 1);
    wasPanelOpen.current = isPanelOpen;
  }, [isPanelOpen]);

  useEffect(() => {
    const { setLayoutOverride } = useContentPreviewStore.getState();
    setLayoutOverride(
      activeLayout && layoutDraft
        ? { page: activeLayout.page, sections: layoutDraft.sections }
        : null,
    );
  }, [activeLayout, layoutDraft]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const isModifier = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      if (
        event.altKey &&
        !isModifier &&
        (event.key === 'ArrowDown' || event.key === 'ArrowUp') &&
        useSiteEditorStore.getState().mode === 'edit' &&
        !isTextInput(event.target) &&
        !document.querySelector('dialog[open]')
      ) {
        event.preventDefault();
        stepRef.current(event.key === 'ArrowDown' ? 1 : -1);
        return;
      }
      if (
        isModifier &&
        (key === 'z' || key === 'y') &&
        !isTextInput(event.target) &&
        !document.querySelector('dialog[open]')
      ) {
        event.preventDefault();
        void (key === 'y' || event.shiftKey ? history.redo() : history.undo());
        return;
      }
      if (event.key !== 'Escape' || document.querySelector('dialog[open]')) return;
      const state = useSiteEditorStore.getState();
      if (state.isSummaryOpen) state.setSummaryOpen(false);
      else if (state.history.length === 0 && !state.structure && state.device !== 'desktop') {
        state.setDevice('desktop');
      } else if (state.mode !== 'edit') return;
      else if (state.structure) state.closeStructure();
      else if (state.history.length > 0) state.close();
      else setSelected(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [history]);

  const closeHelp = () => {
    setHelpOpen(false);
    try {
      localStorage.setItem(SITE_EDITOR_INTRO_STORAGE_KEY, '1');
    } catch {
      return;
    }
  };

  const exit = async () => {
    await flushDrafts();
    reset();
    useContentPreviewStore.getState().setEnabled(false);
    queryClient.removeQueries({ queryKey: PREVIEW_CONTENT_QUERY_KEY });
    queryClient.removeQueries({ queryKey: EDITOR_QUERY_KEY });
    void refreshRecords();
  };

  const isStructureShown = mode === 'edit' && Boolean(structure);

  const switchMode = (next: EditorMode) => {
    setMode(next);
    if (next === 'preview') setSummaryOpen(false);
  };

  const pending = changes.data?.length ?? 0;

  const exitDescription = hasUnsavedDrafts
    ? t.exitUnsaved
    : pending > 0
      ? t.exitPending(pending)
      : t.exitClean;

  return (
    <div {...{ [EDITOR_ROOT_ATTRIBUTE]: '' }}>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[2147483000] shadow-[inset_0_0_0_2px_var(--color-viratec-cyan),inset_0_0_32px_rgba(3,197,234,0.35)]"
      />

      {isCanvasActive && (
        <>
          <EditorOutlines hovered={hovered} selected={selected} t={t} />
          {selected && !gate && !isPanelOpen && !isSummaryOpen && (
            <SelectionActions
              target={selected}
              focusRequest={focusRequest}
              t={t}
              onOpen={open}
              onStep={step}
            />
          )}
          {section && (
            <SectionBadge
              key={section.sectionId}
              section={section}
              page={activeLayout?.page ?? null}
              t={t}
              onSelect={setSelected}
              onOpen={open}
            />
          )}
        </>
      )}

      <p role="status" aria-live="polite" className="sr-only">
        {announcement?.text}
      </p>

      <div
        role="toolbar"
        aria-label={t.toolbar}
        className="pointer-events-auto fixed top-[72px] right-3 z-[2147483004] flex items-center gap-1 rounded-2xl border border-white/12 bg-viratec-deep/95 p-1 shadow-[0_12px_32px_rgba(0,0,0,0.45)] xl:top-[96px]"
      >
        <span className="hidden items-center gap-2 px-3 text-[13px] font-medium text-viratec-cyan sm:flex">
          <span aria-hidden="true" className="size-2 rounded-full bg-viratec-cyan" />
          {t.editing}
        </span>
        <SaveIndicator t={t} />
        <div
          role="radiogroup"
          aria-label={t.modeLabel}
          className="flex rounded-xl bg-white/5 p-0.5"
        >
          {(
            [
              ['edit', t.modeEdit, t.modeEditHint, PencilLine],
              ['preview', t.modePreview, t.modePreviewHint, Eye],
            ] as const
          ).map(([value, label, hint, Icon]) => (
            <Tooltip
              key={value}
              text={hint}
              placement="bottom"
              floatingClassName={EDITOR_TOOLTIP_CLASS}
            >
              <button
                type="button"
                role="radio"
                aria-checked={mode === value}
                aria-label={label}
                onClick={() => switchMode(value)}
                className={cn(
                  TOOLBAR_BUTTON,
                  'h-8 px-2.5',
                  mode === value
                    ? 'bg-viratec-cyan text-viratec-ink'
                    : 'text-text-muted hover:text-text-primary',
                )}
              >
                <Icon aria-hidden="true" className="size-4" />
                <span aria-hidden="true" className="hidden md:inline">
                  {label}
                </span>
              </button>
            </Tooltip>
          ))}
        </div>
        {activeLayout && (
          <IconButton
            icon={LayoutList}
            label={t.structure.open}
            aria-pressed={isStructureShown}
            onClick={() => {
              if (isStructureShown) {
                closeStructure();
                return;
              }
              setMode('edit');
              openStructure({});
            }}
            className={isStructureShown ? 'bg-white/10 text-text-primary' : 'text-text-primary'}
          />
        )}
        <Tooltip text={t.summaryHint} placement="bottom" floatingClassName={EDITOR_TOOLTIP_CLASS}>
          <button
            type="button"
            aria-expanded={isSummaryOpen}
            aria-label={t.summaryCount(pending)}
            onClick={() => setSummaryOpen(!isSummaryOpen)}
            className={cn(
              TOOLBAR_BUTTON,
              isSummaryOpen
                ? 'bg-white/10 text-text-primary'
                : 'text-text-primary hover:bg-white/8',
            )}
          >
            <ListChecks aria-hidden="true" className="size-4" />
            <span aria-hidden="true" className="hidden sm:inline">
              {t.summary}
            </span>
            {pending > 0 && (
              <span
                aria-hidden="true"
                className="min-w-5 rounded-full bg-brand-lime px-1.5 text-center text-[12px] leading-5 text-text-on-lime"
              >
                {pending}
              </span>
            )}
          </button>
        </Tooltip>
        <DeviceSwitch t={t} />
        {canPublish && <PublishControl count={pending} t={t} />}
        <IconButton icon={CircleHelp} label={t.helpOpen} onClick={() => setHelpOpen(true)} />
        <IconButton icon={LogOut} label={t.exitHint} onClick={() => setConfirmingExit(true)} />
      </div>

      {device !== 'desktop' && !gate && (
        <DeviceFrame device={device} isPanelOpen={isPanelOpen || isSummaryOpen} t={t} />
      )}

      {gate ? (
        <EditorGate code={gate} t={t} />
      ) : (
        <>
          {isSummaryOpen && <SummaryPanel t={t} onExit={() => setConfirmingExit(true)} />}
          {mode === 'edit' && structure && !isSummaryOpen && <StructurePanel t={t} />}
          {mode === 'edit' &&
            selection &&
            !isSummaryOpen &&
            !structure &&
            (recordResourceOf(selection.contentTypeId) ? (
              <RecordPanel key={`${selection.contentTypeId}:${selection.entryId}`} t={t} />
            ) : (
              <InspectorPanel key={selection.entryId} t={t} />
            ))}
        </>
      )}

      <HelpDialog open={isHelpOpen} t={t} onClose={closeHelp} />
      <ConfirmDialog
        open={isConfirmingExit}
        title={t.exitTitle}
        description={exitDescription}
        confirmLabel={t.exitConfirmLeave}
        cancelLabel={t.keepEditing}
        closeLabel={t.close}
        onConfirm={() => {
          setConfirmingExit(false);
          void exit();
        }}
        onClose={() => setConfirmingExit(false)}
      />
    </div>
  );
}

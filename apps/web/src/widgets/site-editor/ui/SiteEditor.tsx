import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CalendarPlus,
  CircleHelp,
  Eye,
  FilePlus2,
  FolderPlus,
  Highlighter,
  LayoutList,
  ListChecks,
  LogOut,
  Menu,
  Monitor,
  PencilLine,
  Plus,
  Search,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  AdminPermission,
  recordResourceOf,
  recordTypeId,
  type ContentChangeDto,
  type RecordResource,
} from '@viratec/contracts';
import { useSessionStore } from '@/entities/session';
import { getApiErrorCode } from '@/shared/api/apiClient';
import { SITE_EDITOR_INTRO_STORAGE_KEY } from '@/shared/config/storageKeys';
import { PREVIEW_CONTENT_QUERY_KEY, useContentPreviewStore } from '@/shared/lib';
import type { EditorGateCode } from './EditorGate';
import { useAutosave } from '../model/autosave';
import { flushDrafts } from '../model/autosaveRegistry';
import { useEditorHistory } from '../model/history';
import { inlineFieldOf, type InlineField } from '../model/inlineEdit';
import { useCollectionGrids } from '../model/useCollectionGrids';
import { useImageDrop } from '../model/useImageDrop';
import { useIssueAnchors } from '../model/useIssueAnchors';
import { useIssueTargets } from '../model/useIssueTargets';
import { changeTargets } from '../model/changeTargets';
import type { SearchItem } from '../model/siteSearch';
import { targetLabel } from '../model/targetLabel';
import { NO_PERMISSIONS, canEditRecords } from '../model/permissions';
import { useSiteEditorMessages } from '../model/messages';
import {
  EDITOR_QUERY_KEY,
  prefetchEditorSource,
  useContentChanges,
  useRefreshRecordQueries,
} from '../model/queries';
import {
  useCurrentSelection,
  useHasUnsavedDrafts,
  useSiteEditorStore,
  type EditorMode,
} from '../model/store';
import { SHORTCUTS, isTextInput } from '../model/shortcuts';
import {
  EDITOR_ROOT_ATTRIBUTE,
  collectCanvasTargets,
  stepCanvasTarget,
  targetKey,
  useCanvasTargets,
  type CanvasTarget,
} from '../model/useCanvasTargets';
import { CollectionOverlay } from './CollectionOverlay';
import { ConfirmDialog } from './ConfirmDialog';
import { DeviceFrame } from './DeviceFrame';
import { EditorGate } from './EditorGate';
import { EditorTour } from './EditorTour';
import { EditorOutlines } from './EditorOutlines';
import { SectionBadge } from './SectionBadge';
import { HelpDialog } from './HelpDialog';
import { IconButton } from './IconButton';
import { ImageDropOverlay } from './ImageDropOverlay';
import { InlineEditor, type InlineCloseReason } from './InlineEditor';
import { ChangeHighlights } from './ChangeHighlights';
import { IssueDots } from './IssueDots';
import { InspectorPanel } from './InspectorPanel';
import { PublishControl } from './PublishControl';
import { RecordPanel } from './RecordPanel';
import { PresenceBanner } from './PresenceBanner';
import { useEditorPresence } from '../model/useEditorPresence';
import { RecordWizard } from './RecordWizard';
import { SaveIndicator } from './SaveIndicator';
import { ToolbarMenu, type ToolbarMenuItem } from './ToolbarMenu';
import { SiteSearchDialog } from './SiteSearchDialog';
import { SelectionActions } from './SelectionActions';
import { StructurePanel } from './StructurePanel';
import { SummaryPanel } from './SummaryPanel';

const NO_CHANGES: ContentChangeDto[] = [];

const PENDING_FOCUS_ATTEMPTS = 20;
const PENDING_FOCUS_INTERVAL_MS = 300;

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
  const { setMode, select, setSummaryOpen, reset, openStructure } = useSiteEditorStore.getState();
  const selection = useCurrentSelection();
  const editingNames = useEditorPresence(
    selection && mode === 'edit'
      ? `${selection.contentTypeId ?? 'entry'}:${selection.entryId}`
      : null,
  );
  const hasUnsavedDrafts = useHasUnsavedDrafts();
  const changes = useContentChanges();
  const gate = gateFor(changes.error);
  const [selected, setSelected] = useState<CanvasTarget | null>(null);
  const [isConfirmingExit, setConfirmingExit] = useState(false);
  const [isHelpOpen, setHelpOpen] = useState(false);
  const [isTourOpen, setTourOpen] = useState(readIntroPending);
  const [focusRequest, setFocusRequest] = useState(0);
  const announcement = useSiteEditorStore((state) => state.announcement);
  const history = useEditorHistory();
  const refreshRecords = useRefreshRecordQueries();
  const device = useSiteEditorStore((state) => state.device);
  const permissions = useSessionStore((state) => state.user?.permissions ?? NO_PERMISSIONS);
  const canPublish = permissions.includes(AdminPermission.CONTENT_PUBLISH);
  const [inline, setInline] = useState<InlineField | null>(null);
  const [wizard, setWizard] = useState<RecordResource | null>(null);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isChangesShown, setChangesShown] = useState(false);
  const [pendingFocus, setPendingFocus] = useState<SearchItem['selection'] | null>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useAutosave();

  useEffect(() => {
    void refreshRecords();
  }, [refreshRecords]);

  useEffect(() => {
    if (!selected || selected.kind === 'section' || gate) return;
    const { contentTypeId, entryId } = selected.address;
    void prefetchEditorSource(queryClient, contentTypeId, entryId);
  }, [selected, gate, queryClient]);

  const openPanel = useCallback(
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

  const open = useCallback(
    (target: CanvasTarget) => {
      const field = inlineFieldOf(target);
      const canEdit = field?.resource
        ? canEditRecords(permissions, field.resource)
        : permissions.includes(AdminPermission.CONTENT_EDIT);
      if (!field || !canEdit) {
        openPanel(target);
        return;
      }
      setSelected(target);
      useSiteEditorStore.getState().close();
      setInline(field);
    },
    [openPanel, permissions],
  );

  const closeInline = (reason: InlineCloseReason) => {
    const target = inline?.target;
    setInline(null);
    if (reason === 'panel' && target) openPanel(target);
    else setFocusRequest((count) => count + 1);
  };

  const isCanvasActive = mode === 'edit' && !gate && device === 'desktop';
  const { hovered, section } = useCanvasTargets(isCanvasActive, setSelected, open);
  const grids = useCollectionGrids(isCanvasActive && !inline);
  const drop = useImageDrop(isCanvasActive);
  const issueTargets = useIssueTargets(!gate);
  const issueAnchors = useIssueAnchors(isCanvasActive && !inline, issueTargets);
  const changeAnchors = useIssueAnchors(
    isCanvasActive && isChangesShown && !inline,
    changeTargets(changes.data ?? NO_CHANGES),
  );

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
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const openRef = useRef(open);
  openRef.current = open;

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
    const handleSearchKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.code !== 'KeyK') return;
      if (useSiteEditorStore.getState().mode !== 'edit' || document.querySelector('dialog[open]')) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      setSearchOpen(true);
    };
    window.addEventListener('keydown', handleSearchKey, true);
    return () => window.removeEventListener('keydown', handleSearchKey, true);
  }, []);

  useEffect(() => {
    if (!pendingFocus) return;
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      const targets = collectCanvasTargets();
      const found =
        targets.find(
          (target) =>
            target.kind === 'field' &&
            target.address.entryId === pendingFocus.entryId &&
            target.address.fieldId === pendingFocus.fieldId &&
            target.address.locale === pendingFocus.locale,
        ) ??
        targets.find(
          (target) => target.kind !== 'section' && target.address.entryId === pendingFocus.entryId,
        );
      const { announce, select: openPanel } = useSiteEditorStore.getState();
      if (found) {
        clearInterval(timer);
        setPendingFocus(null);
        found.element.scrollIntoView({ block: 'center' });
        setSelected(found);
        setFocusRequest((count) => count + 1);
        announce(t.search.found(targetLabel(found, t)));
      } else if (attempts >= PENDING_FOCUS_ATTEMPTS) {
        clearInterval(timer);
        setPendingFocus(null);
        openPanel(pendingFocus);
        announce(t.search.notOnPage);
      }
    }, PENDING_FOCUS_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [pendingFocus, t]);

  const chooseResult = (item: SearchItem) => {
    setSearchOpen(false);
    setSelected(null);
    useSiteEditorStore.getState().close();
    useSiteEditorStore.getState().setDevice('desktop');
    setMode('edit');
    if (pathname !== item.route) navigate(item.route);
    setPendingFocus(item.selection);
  };

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
        event.key === 'Enter' &&
        !isModifier &&
        !event.altKey &&
        !event.shiftKey &&
        selectedRef.current &&
        (event.target === document.body || event.target === document.documentElement) &&
        useSiteEditorStore.getState().history.length === 0 &&
        !document.querySelector('dialog[open]')
      ) {
        event.preventDefault();
        openRef.current(selectedRef.current);
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

  const finishTour = () => {
    setTourOpen(false);
    try {
      localStorage.setItem(SITE_EDITOR_INTRO_STORAGE_KEY, '1');
    } catch {
      return;
    }
  };

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

  const switchMode = (next: EditorMode) => {
    setMode(next);
    if (next === 'preview') setSummaryOpen(false);
  };

  const pending = changes.data?.length ?? 0;

  const addItems: ToolbarMenuItem[] = (
    [
      ['project', FolderPlus],
      ['publication', FilePlus2],
      ['event', CalendarPlus],
    ] as const
  )
    .filter(([resource]) => canEditRecords(permissions, resource))
    .map(([resource, icon]) => ({
      key: resource,
      label: t.wizard.title[resource],
      icon,
      onSelect: () => setWizard(resource),
    }));

  const moreItems: ToolbarMenuItem[] = [
    {
      key: 'edit',
      label: t.menu.edit,
      icon: PencilLine,
      kind: 'radio',
      checked: mode === 'edit',
      group: 'view',
      onSelect: () => switchMode('edit'),
    },
    {
      key: 'preview',
      label: t.menu.preview,
      icon: Eye,
      kind: 'radio',
      checked: mode === 'preview',
      group: 'view',
      onSelect: () => switchMode('preview'),
    },
    {
      key: 'changes',
      label: t.menu.showChanges,
      icon: Highlighter,
      kind: 'check',
      checked: isChangesShown,
      group: 'view',
      onSelect: () => {
        const next = !isChangesShown;
        setChangesShown(next);
        useSiteEditorStore
          .getState()
          .announce(
            next
              ? t.highlight.shown(changeTargets(changes.data ?? NO_CHANGES).length)
              : t.highlight.hidden,
          );
      },
    },
    ...(activeLayout
      ? [
          {
            key: 'sections',
            label: t.menu.sections,
            icon: LayoutList,
            group: 'tools',
            onSelect: () => {
              setMode('edit');
              openStructure({});
            },
          },
        ]
      : []),
    {
      key: 'summary',
      label: t.menu.changesList(pending),
      icon: ListChecks,
      group: 'tools',
      onSelect: () => setSummaryOpen(true),
    },
    ...(
      [
        ['desktop', Monitor],
        ['tablet', Tablet],
        ['phone', Smartphone],
      ] as const
    ).map(([value, icon]) => ({
      key: `device-${value}`,
      label: `${t.menu.device}: ${t.device[value]}`,
      icon,
      kind: 'radio' as const,
      checked: device === value,
      group: 'device',
      onSelect: () => useSiteEditorStore.getState().setDevice(value),
    })),
    {
      key: 'help',
      label: t.menu.help,
      icon: CircleHelp,
      group: 'app',
      onSelect: () => setHelpOpen(true),
    },
    {
      key: 'exit',
      label: t.menu.exit,
      icon: LogOut,
      group: 'app',
      onSelect: () => setConfirmingExit(true),
    },
  ];

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
          {isChangesShown && !inline && <ChangeHighlights anchors={changeAnchors} t={t} />}
          {!inline && <IssueDots anchors={issueAnchors} t={t} onOpen={select} />}
          {drop.target && (
            <ImageDropOverlay
              target={drop.target}
              isUploading={drop.isUploading}
              previewUrl={drop.previewUrl}
              t={t}
            />
          )}
          {!inline && (
            <CollectionOverlay
              grids={grids}
              activeElement={hovered?.element ?? selected?.element ?? null}
              t={t}
              onAddRecord={setWizard}
            />
          )}
          {inline && (
            <InlineEditor
              key={targetKey(inline.target)}
              field={inline}
              t={t}
              onClose={closeInline}
            />
          )}
          {selected && !inline && !gate && !isPanelOpen && !isSummaryOpen && (
            <SelectionActions
              target={selected}
              focusRequest={focusRequest}
              t={t}
              onOpen={open}
              onStep={step}
              onReplaceImage={
                selected.kind === 'asset'
                  ? (file) =>
                      void drop.replace(
                        { element: selected.element, address: selected.address },
                        file,
                      )
                  : undefined
              }
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
        data-tour="publish"
        aria-label={t.toolbar}
        className="pointer-events-auto fixed top-[72px] right-3 z-[2147483004] flex items-center gap-1 rounded-2xl border border-white/12 bg-viratec-deep/95 p-1 shadow-[0_12px_32px_rgba(0,0,0,0.45)] xl:top-[96px]"
      >
        <span className="hidden items-center gap-2 px-3 text-[13px] font-medium text-viratec-cyan lg:flex">
          <span aria-hidden="true" className="size-2 rounded-full bg-viratec-cyan" />
          {mode === 'edit' ? t.editing : t.modePreview}
        </span>
        <SaveIndicator t={t} />
        {mode === 'edit' && addItems.length > 0 && (
          <ToolbarMenu
            label={t.menu.addLabel}
            buttonLabel={t.menu.add}
            icon={Plus}
            items={addItems}
            variant="accent"
          />
        )}
        <IconButton
          icon={Search}
          label={t.search.open}
          shortcut={SHORTCUTS.search}
          aria-haspopup="dialog"
          onClick={() => setSearchOpen(true)}
        />
        {canPublish && (
          <PublishControl
            changes={changes.data ?? NO_CHANGES}
            issueCount={issueTargets.length}
            t={t}
          />
        )}
        <ToolbarMenu
          label={t.menu.moreLabel}
          buttonLabel={t.menu.more}
          icon={Menu}
          items={moreItems}
        />
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

      {!gate && <PresenceBanner names={editingNames} t={t} />}

      {wizard && (
        <RecordWizard
          resource={wizard}
          t={t}
          onClose={() => setWizard(null)}
          onCreated={(record) => {
            setWizard(null);
            select({ entryId: record.key, contentTypeId: recordTypeId(wizard) });
          }}
        />
      )}
      <SiteSearchDialog
        open={isSearchOpen}
        t={t}
        onClose={() => setSearchOpen(false)}
        onChoose={chooseResult}
      />
      <HelpDialog
        open={isHelpOpen}
        t={t}
        onClose={closeHelp}
        onTour={() => {
          closeHelp();
          setMode('edit');
          setTourOpen(true);
        }}
      />
      {isTourOpen && !gate && mode === 'edit' && <EditorTour t={t} onFinish={finishTour} />}
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

import {
  ChevronRight,
  CircleHelp,
  Eye,
  Highlighter,
  LayoutList,
  ListChecks,
  LogOut,
  Menu,
  Monitor,
  PencilLine,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { cn } from '@/shared/lib';
import type { SiteEditorMessages } from '../model/messages';
import { useSiteEditorStore, type EditorMode, type PreviewDevice } from '../model/store';
import { MoreMenuRow } from './MoreMenuRow';
import { SegmentedChoice } from './SegmentedChoice';
import { ToolbarMenu } from './ToolbarMenu';

const GROUP_TITLE_CLASS = 'px-2 text-[12px] leading-4 font-medium text-text-subtle';

interface MoreMenuProps {
  t: SiteEditorMessages;
  hasSections: boolean;
  pendingCount: number;
  isHighlightOn: boolean;
  highlightedCount: number;
  onToggleHighlight: () => void;
  onHelp: () => void;
  onExit: () => void;
}

export function MoreMenu({
  t,
  hasSections,
  pendingCount,
  isHighlightOn,
  highlightedCount,
  onToggleHighlight,
  onHelp,
  onExit,
}: MoreMenuProps) {
  const mode = useSiteEditorStore((state) => state.mode);
  const device = useSiteEditorStore((state) => state.device);
  const isSummaryOpen = useSiteEditorStore((state) => state.isSummaryOpen);
  const { setMode, setDevice, setSummaryOpen, openStructure } = useSiteEditorStore.getState();
  const isEditing = mode === 'edit' && device === 'desktop';
  const activeMode: EditorMode = isEditing ? 'edit' : 'preview';

  const chooseMode = (next: EditorMode) => {
    if (next === activeMode) return;
    if (next === 'edit') setDevice('desktop');
    else setSummaryOpen(false);
    setMode(next);
  };

  const openSections = () => {
    setDevice('desktop');
    setMode('edit');
    openStructure({});
  };

  const modeHint =
    device !== 'desktop' ? t.device.previewOnly : isEditing ? t.modeEditHint : t.modePreviewHint;

  const highlightHint = !isEditing
    ? t.menu.highlightUnavailable
    : isHighlightOn
      ? t.highlight.shown(highlightedCount)
      : t.menu.highlightHint;

  const footerActions = [
    { key: 'help', label: t.menu.help, icon: CircleHelp, onSelect: onHelp },
    { key: 'exit', label: t.menu.exit, icon: LogOut, onSelect: onExit },
  ];

  return (
    <ToolbarMenu
      label={t.menu.moreLabel}
      buttonLabel={t.menu.more}
      icon={Menu}
      panelClassName="w-[min(360px,calc(100vw-24px))] gap-3 overflow-y-auto overscroll-contain p-2 max-h-[calc(100svh-132px)] xl:max-h-[calc(100svh-156px)]"
    >
      {(close) => (
        <>
          <div className="flex flex-col gap-2 pt-1">
            <span className={GROUP_TITLE_CLASS}>{t.menu.modeTitle}</span>
            <SegmentedChoice<EditorMode>
              inMenu
              label={t.menu.modeTitle}
              value={activeMode}
              options={[
                { value: 'edit', label: t.menu.edit, icon: PencilLine },
                { value: 'preview', label: t.menu.preview, icon: Eye },
              ]}
              onChange={(next) => {
                close();
                chooseMode(next);
              }}
            />
            <p className="px-2 text-[13px] leading-[18px] text-text-muted">{modeHint}</p>
          </div>

          <div className="flex flex-col gap-2">
            <span className={GROUP_TITLE_CLASS}>{t.menu.device}</span>
            <SegmentedChoice<PreviewDevice>
              inMenu
              label={t.menu.device}
              value={device}
              options={[
                { value: 'desktop', label: t.device.desktop, icon: Monitor },
                { value: 'tablet', label: t.device.tablet, icon: Tablet },
                { value: 'phone', label: t.device.phone, icon: Smartphone },
              ]}
              onChange={(next) => {
                close();
                setDevice(next);
              }}
            />
          </div>

          <div role="group" aria-label={t.menu.pageTitle} className="flex flex-col gap-0.5">
            <span className={cn(GROUP_TITLE_CLASS, 'pb-1')}>{t.menu.pageTitle}</span>
            <MoreMenuRow
              icon={Highlighter}
              label={t.menu.showChanges}
              hint={highlightHint}
              checked={isHighlightOn}
              disabled={!isEditing}
              isHintLive
              trailing={
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex h-5 w-9 shrink-0 items-center rounded-full transition-colors motion-reduce:transition-none',
                    isHighlightOn ? 'bg-viratec-cyan' : 'bg-white/15',
                  )}
                >
                  <span
                    className={cn(
                      'size-4 rounded-full transition-[margin] motion-reduce:transition-none',
                      isHighlightOn ? 'ms-[18px] bg-viratec-ink' : 'ms-0.5 bg-white',
                    )}
                  />
                </span>
              }
              onClick={onToggleHighlight}
            />
            <MoreMenuRow
              icon={LayoutList}
              label={t.menu.sections}
              hint={hasSections ? t.menu.sectionsHint : t.menu.noSections}
              disabled={!hasSections}
              trailing={
                hasSections && (
                  <ChevronRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-text-subtle rtl:rotate-180"
                  />
                )
              }
              onClick={() => {
                close();
                openSections();
              }}
            />
            <MoreMenuRow
              icon={ListChecks}
              label={t.menu.changesList}
              hint={pendingCount > 0 ? t.menu.changesPending : t.menu.changesNone}
              trailing={
                <span className="flex shrink-0 items-center gap-1.5">
                  {pendingCount > 0 && (
                    <span className="rounded-full bg-brand-lime px-2 py-0.5 text-[12px] leading-4 font-medium text-text-on-lime tabular-nums">
                      {pendingCount}
                    </span>
                  )}
                  <ChevronRight
                    aria-hidden="true"
                    className="size-4 text-text-subtle rtl:rotate-180"
                  />
                </span>
              }
              onClick={() => {
                close();
                setSummaryOpen(!isSummaryOpen);
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-1 border-t border-white/8 pt-2">
            {footerActions.map(({ key, label, icon: Icon, onSelect }) => (
              <button
                key={key}
                type="button"
                role="menuitem"
                data-menu-item
                tabIndex={-1}
                onClick={() => {
                  close();
                  onSelect();
                }}
                className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl px-2 text-center text-[13px] font-medium text-text-muted transition-colors hover:bg-white/8 hover:text-text-primary focus-visible:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-border-focus motion-reduce:transition-none"
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </ToolbarMenu>
  );
}

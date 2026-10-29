import { useEffect, useRef, type ReactNode } from 'react';
import { ArrowLeft, CircleDot, History, X } from 'lucide-react';
import { flushDrafts } from '../model/autosaveRegistry';
import type { SiteEditorMessages } from '../model/messages';
import { useSiteEditorStore } from '../model/store';
import { EDITOR_ROOT_ATTRIBUTE } from '../model/useCanvasTargets';
import { SHORTCUTS } from '../model/shortcuts';
import { IconButton } from './IconButton';

interface EditorPanelProps {
  t: SiteEditorMessages;
  label: string;
  kicker: string;
  title: string;
  status: string | null;
  footer?: ReactNode;
  onClose?: () => void;
  focusTitle?: boolean;
  saveKey?: string;
  onHistory?: () => void;
  children: ReactNode;
}

export function EditorPanel({
  t,
  label,
  kicker,
  title,
  status,
  footer,
  onClose,
  focusTitle = false,
  saveKey,
  onHistory,
  children,
}: EditorPanelProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (focusTitle) titleRef.current?.focus({ preventScroll: true });
  }, [focusTitle]);

  const historyLength = useSiteEditorStore((state) => state.history.length);
  const { back, close } = useSiteEditorStore.getState();

  return (
    <aside
      {...{ [EDITOR_ROOT_ATTRIBUTE]: '' }}
      aria-label={label}
      className="editor-slide-up pointer-events-auto fixed inset-x-0 bottom-0 z-[2147483002] flex max-h-[min(78svh,calc(100svh-128px))] flex-col rounded-t-3xl pb-[env(safe-area-inset-bottom)] lg:pb-0 border border-white/12 bg-viratec-deep shadow-[0_-12px_40px_rgba(0,0,0,0.45)] lg:inset-x-auto lg:top-[128px] xl:top-[152px] lg:right-4 lg:bottom-4 lg:max-h-none lg:w-[440px] lg:rounded-3xl lg:shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
    >
      <span
        aria-hidden="true"
        className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-white/20 lg:hidden"
      />
      <header className="flex items-start gap-2 border-b border-white/8 p-3 pl-4">
        {historyLength > 1 && (
          <IconButton icon={ArrowLeft} size="lg" label={t.back} onClick={back} />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 py-1">
          <span className="text-[12px] font-medium tracking-[0.08em] text-viratec-cyan uppercase">
            {kicker}
          </span>
          <h2
            ref={titleRef}
            tabIndex={-1}
            className="text-[17px] font-medium break-words text-text-primary outline-none"
          >
            {title}
          </h2>
          {status && (
            <span className="flex items-center gap-1.5 text-[13px] text-text-muted">
              <CircleDot aria-hidden="true" className="size-3.5" />
              {status}
            </span>
          )}
        </div>
        {onHistory && (
          <IconButton icon={History} size="lg" label={t.versions.open} onClick={onHistory} />
        )}
        <IconButton
          icon={X}
          label={t.close}
          shortcut={SHORTCUTS.close}
          size="lg"
          onClick={onClose ?? close}
        />
      </header>

      <div
        onBlur={saveKey ? () => void flushDrafts(saveKey) : undefined}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto overscroll-contain p-4"
      >
        {children}
      </div>

      {footer && (
        <footer className="flex flex-col gap-3 border-t border-white/8 p-4">{footer}</footer>
      )}
    </aside>
  );
}

export function useSaveShortcut(save: () => void) {
  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);
}

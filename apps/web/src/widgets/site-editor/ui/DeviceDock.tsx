import { useState } from 'react';
import { Eye, Monitor, PencilLine, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/shared/lib';
import type { SiteEditorMessages } from '../model/messages';
import { useSiteEditorStore, type EditorMode } from '../model/store';
import { DeviceSettings } from './DeviceSettings';
import { SegmentedChoice } from './SegmentedChoice';

interface DeviceDockProps {
  width: number;
  t: SiteEditorMessages;
}

const WIDE_QUERY = '(min-width: 1280px)';

const isWide = () => typeof window !== 'undefined' && window.matchMedia(WIDE_QUERY).matches;

const BUTTON_CLASS =
  'inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-[14px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus motion-reduce:transition-none';

export function DeviceDock({ width, t }: DeviceDockProps) {
  const mode = useSiteEditorStore((state) => state.mode);
  const { setDevice, setMode, setSummaryOpen } = useSiteEditorStore.getState();
  const [isSettingsOpen, setSettingsOpen] = useState(isWide);

  const chooseMode = (next: EditorMode) => {
    if (next === 'preview') setSummaryOpen(false);
    setMode(next);
  };

  return (
    <div className="editor-pop-in flex max-h-[45svh] w-full max-w-[560px] shrink-0 flex-col gap-3 overflow-y-auto overscroll-contain rounded-2xl border border-white/12 bg-viratec-deep/95 p-2 xl:absolute xl:top-[160px] xl:right-3 xl:max-h-[calc(100svh-176px)] xl:w-[360px] xl:p-4">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <SegmentedChoice<EditorMode>
            label={t.modeLabel}
            value={mode}
            options={[
              { value: 'edit', label: t.device.edit, icon: PencilLine },
              { value: 'preview', label: t.device.view, icon: Eye },
            ]}
            onChange={chooseMode}
          />
        </div>
        <button
          type="button"
          aria-expanded={isSettingsOpen}
          aria-label={t.device.settings}
          title={t.device.settings}
          onClick={() => setSettingsOpen((open) => !open)}
          className={cn(
            BUTTON_CLASS,
            'w-11 shrink-0 px-0',
            isSettingsOpen
              ? 'bg-white/15 text-text-primary'
              : 'bg-white/6 text-text-muted hover:bg-white/10 hover:text-text-primary',
          )}
        >
          <SlidersHorizontal aria-hidden="true" className="size-4" />
        </button>
      </div>
      <p className="px-1 text-[13px] leading-[18px] text-text-muted">
        {mode === 'edit' ? t.device.editHint : t.device.viewHint}
      </p>
      {isSettingsOpen && <DeviceSettings width={width} t={t} />}
      <button
        type="button"
        onClick={() => setDevice('desktop')}
        className={cn(BUTTON_CLASS, 'bg-viratec-cyan text-viratec-ink hover:bg-viratec-cyan/85')}
      >
        <Monitor aria-hidden="true" className="size-4" />
        {t.device.desktop}
      </button>
    </div>
  );
}

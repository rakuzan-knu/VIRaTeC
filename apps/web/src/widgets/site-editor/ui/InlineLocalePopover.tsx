import { useLayoutEffect, useRef, useState } from 'react';
import { PanelRight } from 'lucide-react';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import type { SiteEditorMessages } from '../model/messages';
import type { useInlineEdit } from '../model/useInlineEdit';
import { TranslationHint } from './TranslationHint';

const GAP = 10;
const EDGE = 8;
const WIDTH = 340;

interface InlineLocalePopoverProps {
  edit: ReturnType<typeof useInlineEdit>;
  hintId: string;
  multiline: boolean;
  anchor: { top: number; bottom: number; left: number };
  t: SiteEditorMessages;
  onSave: () => void;
  onOpenPanel: () => void;
}

export function InlineLocalePopover({
  edit,
  hintId,
  multiline,
  anchor,
  t,
  onSave,
  onOpenPanel,
}: InlineLocalePopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setHeight(element.offsetHeight));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const fitsBelow = anchor.bottom + GAP + height <= window.innerHeight - EDGE;
  const top = fitsBelow ? anchor.bottom + GAP : Math.max(anchor.top - GAP - height, EDGE);
  const left = Math.min(Math.max(anchor.left, EDGE), window.innerWidth - WIDTH - EDGE);
  const otherLabel = t.inline.otherLocale(t.locales[edit.other]);

  return (
    <div
      ref={ref}
      role="group"
      aria-label={otherLabel}
      className="pointer-events-auto fixed z-[2147483004] flex w-[min(340px,calc(100vw-16px))] flex-col gap-3 rounded-2xl border border-white/12 bg-viratec-deep p-3 shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
      style={{ top, left: Math.max(left, EDGE) }}
    >
      <p id={hintId} className="text-[12px] text-text-subtle">
        {multiline ? t.inline.hintMultiline : t.inline.hint}
      </p>
      {edit.localized && (
        <>
          <TranslationHint
            values={edit.values}
            readOnly={false}
            t={t}
            onCopy={(from, to) => edit.write(to, edit.values[from])}
          />
          {multiline ? (
            <Textarea
              label={otherLabel}
              lang={edit.other}
              value={edit.otherValue}
              rows={3}
              onChange={(event) => edit.setOther(event.target.value)}
            />
          ) : (
            <Input
              label={otherLabel}
              lang={edit.other}
              value={edit.otherValue}
              onChange={(event) => edit.setOther(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                onSave();
              }}
            />
          )}
        </>
      )}
      <button
        type="button"
        onClick={onOpenPanel}
        className="inline-flex min-h-6 cursor-pointer items-center gap-1.5 self-start rounded-lg px-2 py-1 text-[13px] text-viratec-cyan hover:bg-white/6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
      >
        <PanelRight aria-hidden="true" className="size-3.5" />
        {t.inline.allFields}
      </button>
    </div>
  );
}

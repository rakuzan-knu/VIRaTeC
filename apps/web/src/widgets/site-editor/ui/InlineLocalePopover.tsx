import { useLayoutEffect, useRef, useState } from 'react';
import { PanelRight } from 'lucide-react';
import { cn } from '@/shared/lib';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { withLengthHint } from '../model/lengthLimits';
import type { SiteEditorMessages } from '../model/messages';
import type { useInlineEdit } from '../model/useInlineEdit';
import { InlineLinkTarget } from './InlineLinkTarget';
import { TranslationHint } from './TranslationHint';

const GAP = 10;
const EDGE = 8;
const WIDTH = 340;

interface InlineLocalePopoverProps {
  edit: ReturnType<typeof useInlineEdit>;
  hintId: string;
  multiline: boolean;
  anchor: { top: number; bottom: number; left: number };
  linkField: string | null;
  entryId: string;
  limit?: number;
  t: SiteEditorMessages;
  onSave: () => void;
  onOpenPanel: () => void;
}

export function InlineLocalePopover({
  edit,
  hintId,
  multiline,
  anchor,
  linkField,
  entryId,
  limit,
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
      className="editor-pop-in pointer-events-auto fixed z-[2147483004] flex w-[min(340px,calc(100vw-16px))] flex-col gap-3 rounded-2xl border border-white/12 bg-viratec-deep p-3 shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
      style={{ top, left: Math.max(left, EDGE) }}
    >
      <p id={hintId} className="text-[12px] text-text-subtle">
        {multiline ? t.inline.hintMultiline : t.inline.hint}
      </p>
      {limit && edit.value && (
        <p
          aria-live="polite"
          className={cn(
            'text-[12px]',
            edit.value.trim().length > limit ? 'text-text-primary' : 'text-text-subtle',
          )}
        >
          {withLengthHint(undefined, edit.value, limit, t)}
        </p>
      )}
      {edit.localized && (
        <>
          <TranslationHint
            values={edit.values}
            readOnly={false}
            t={t}
            onCopy={(from, to) => edit.write(to, edit.values[from])}
            onTranslated={(to, text) => edit.write(to, text)}
          />
          {multiline ? (
            <Textarea
              label={otherLabel}
              lang={edit.other}
              helperText={withLengthHint(undefined, edit.otherValue, limit, t)}
              value={edit.otherValue}
              rows={3}
              onChange={(event) => edit.setOther(event.target.value)}
            />
          ) : (
            <Input
              label={otherLabel}
              lang={edit.other}
              helperText={withLengthHint(undefined, edit.otherValue, limit, t)}
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
      {linkField && <InlineLinkTarget entryId={entryId} linkFieldId={linkField} t={t} />}
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

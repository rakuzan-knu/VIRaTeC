import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useEditorErrorMessage } from '../model/errors';
import {
  contentBox,
  hideRange,
  targetRange,
  typographyOf,
  type InlineField,
} from '../model/inlineEdit';
import type { SiteEditorMessages } from '../model/messages';
import { useSiteEditorStore } from '../model/store';
import { targetLabel } from '../model/targetLabel';
import { EDITOR_ROOT_ATTRIBUTE, useElementRects } from '../model/useCanvasTargets';
import { useInlineEdit } from '../model/useInlineEdit';
import { InlineLocalePopover } from './InlineLocalePopover';

const POPOVER_GAP = 10;

export type InlineCloseReason = 'saved' | 'cancelled' | 'panel';

interface InlineEditorProps {
  field: InlineField;
  t: SiteEditorMessages;
  onClose: (reason: InlineCloseReason) => void;
}

export function InlineEditor({ field, t, onClose }: InlineEditorProps) {
  const { target, multiline } = field;
  const edit = useInlineEdit(field);
  const loadError = useEditorErrorMessage(edit.loadError);
  const [range] = useState(() => targetRange(target));
  const rects = useElementRects(target.element, range);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isClosing = useRef(false);
  const hintId = useId();
  const [typography] = useState(() => typographyOf(target.element));
  const label = targetLabel(target, t);

  useEffect(() => hideRange(range, target.element), [range, target.element]);

  const isPlaced = rects.length > 0;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!edit.isReady || !isPlaced || !textarea) return;
    textarea.focus({ preventScroll: true });
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }, [edit.isReady, isPlaced]);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [edit.value, rects]);

  const close = (reason: InlineCloseReason) => {
    if (isClosing.current) return;
    isClosing.current = true;
    if (reason === 'cancelled') {
      void edit.cancel();
      useSiteEditorStore.getState().announce(t.inline.cancelled);
    } else {
      void edit.commit();
    }
    onClose(reason);
  };

  if (!isPlaced) return null;

  const top = Math.min(...rects.map((rect) => rect.top));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));
  const firstLeft = rects[0]?.left ?? 0;
  const box = contentBox(target.element);
  const indent = Math.max(firstLeft - box.left, 0);
  const style: CSSProperties = {
    ...typography,
    top,
    left: box.left,
    width: box.width,
    minHeight: bottom - top,
    textIndent: indent,
  };

  if (!edit.isReady) {
    return (
      <div
        {...{ [EDITOR_ROOT_ATTRIBUTE]: '' }}
        role="status"
        className="pointer-events-auto fixed z-[2147483003] flex items-center gap-2 rounded-xl border border-white/12 bg-viratec-deep px-3 py-2 text-[13px] text-text-muted"
        style={{ top: bottom + POPOVER_GAP, left: box.left }}
      >
        {loadError ?? (
          <>
            <LoaderCircle
              aria-hidden="true"
              className="size-4 animate-spin motion-reduce:animate-none"
            />
            {t.inline.loading}
          </>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      {...{ [EDITOR_ROOT_ATTRIBUTE]: '' }}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        event.stopPropagation();
        close('cancelled');
      }}
      onBlur={(event) => {
        if (containerRef.current?.contains(event.relatedTarget)) return;
        close('saved');
      }}
    >
      <textarea
        ref={textareaRef}
        lang={edit.locale}
        aria-label={t.inline.label(label)}
        aria-describedby={hintId}
        aria-multiline={multiline}
        value={edit.value}
        rows={1}
        spellCheck
        onChange={(event) =>
          edit.setValue(multiline ? event.target.value : event.target.value.replace(/\n/g, ' '))
        }
        onKeyDown={(event) => {
          if (event.key !== 'Enter' || (multiline && event.shiftKey)) return;
          event.preventDefault();
          close('saved');
        }}
        style={style}
        className="pointer-events-auto fixed z-[2147483003] m-0 block resize-none overflow-hidden rounded-sm border-0 bg-transparent p-0 whitespace-pre-wrap text-text-primary caret-viratec-cyan outline-2 outline-offset-4 outline-viratec-cyan focus-visible:outline-2"
      />
      <InlineLocalePopover
        edit={edit}
        hintId={hintId}
        multiline={multiline}
        anchor={{ top, bottom, left: box.left }}
        t={t}
        onSave={() => close('saved')}
        onOpenPanel={() => close('panel')}
      />
    </div>
  );
}

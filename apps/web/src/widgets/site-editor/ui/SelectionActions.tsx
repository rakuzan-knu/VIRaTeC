import { useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, ImageUp, LayoutList, PencilLine } from 'lucide-react';
import { ACCEPTED_IMAGE_TYPES } from '../lib/prepareImage';
import type { SiteEditorMessages } from '../model/messages';
import { SHORTCUTS } from '../model/shortcuts';
import { targetLabel } from '../model/targetLabel';
import { useElementRects, type CanvasTarget } from '../model/useCanvasTargets';
import { IconButton } from './IconButton';

const GAP = 8;
const BAR_HEIGHT = 44;
const MIN_TOP = 64;

interface SelectionActionsProps {
  target: CanvasTarget;
  focusRequest: number;
  t: SiteEditorMessages;
  onOpen: (target: CanvasTarget) => void;
  onStep: (direction: 1 | -1) => void;
  onReplaceImage?: (file: File) => void;
}

export function SelectionActions({
  target,
  focusRequest,
  t,
  onOpen,
  onStep,
  onReplaceImage,
}: SelectionActionsProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLButtonElement>(null);
  const handledRequest = useRef(0);
  const rects = useElementRects(target.element, target.kind === 'field' ? target.range : undefined);
  const isPlaced = rects.length > 0;

  useEffect(() => {
    if (!isPlaced || focusRequest <= handledRequest.current || !editRef.current) return;
    handledRequest.current = focusRequest;
    editRef.current.focus({ preventScroll: true });
  }, [focusRequest, isPlaced]);

  if (!isPlaced) return null;

  const top = Math.min(...rects.map((rect) => rect.top));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));
  const right = Math.max(...rects.map((rect) => rect.right));
  const fitsBelow = bottom + GAP + BAR_HEIGHT <= window.innerHeight;
  const position = {
    top: fitsBelow ? bottom + GAP : Math.max(top - GAP - BAR_HEIGHT, MIN_TOP),
    right: Math.max(GAP, window.innerWidth - right),
  };
  const label = targetLabel(target, t);
  const isSection = target.kind === 'section';

  return (
    <div
      className="editor-pop-in pointer-events-auto fixed z-[2147483003] flex items-center gap-1 rounded-2xl border border-white/12 bg-viratec-deep/95 p-1 shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
      style={position}
    >
      <IconButton
        icon={ChevronUp}
        label={t.canvas.previous}
        shortcut={SHORTCUTS.previous}
        className="text-text-muted hover:text-text-primary"
        onClick={() => onStep(-1)}
      />
      <IconButton
        icon={ChevronDown}
        label={t.canvas.next}
        shortcut={SHORTCUTS.next}
        className="text-text-muted hover:text-text-primary"
        onClick={() => onStep(1)}
      />
      {target.kind === 'asset' && onReplaceImage && (
        <>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl px-3 text-[14px] font-medium text-text-primary transition-colors hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus motion-reduce:transition-none pointer-coarse:h-11"
          >
            <ImageUp aria-hidden="true" className="size-4" />
            {t.canvas.replacePhoto}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) onReplaceImage(file);
            }}
          />
        </>
      )}
      <button
        ref={editRef}
        type="button"
        aria-label={isSection ? t.canvas.sections : t.canvas.editLabel(label)}
        aria-keyshortcuts={SHORTCUTS.open.aria}
        onClick={() => onOpen(target)}
        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl bg-viratec-cyan px-3 text-[14px] font-medium text-viratec-ink transition-colors hover:bg-viratec-cyan/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus motion-reduce:transition-none"
      >
        {isSection ? (
          <LayoutList aria-hidden="true" className="size-4" />
        ) : (
          <PencilLine aria-hidden="true" className="size-4" />
        )}
        {isSection ? t.canvas.sections : t.canvas.edit}
      </button>
    </div>
  );
}

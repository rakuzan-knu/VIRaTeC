import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/shared/ui/Button';
import type { SiteEditorMessages } from '../model/messages';
import {
  EDITOR_ROOT_ATTRIBUTE,
  stepCanvasTarget,
  useElementRects,
} from '../model/useCanvasTargets';

const TOUR_ANCHOR_ATTRIBUTE = 'data-tour';

type TourStepId = 'select' | 'edit' | 'add' | 'publish';

const TOUR_STEPS: readonly TourStepId[] = ['select', 'edit', 'add', 'publish'];

const GAP = 12;
const EDGE = 12;
const WIDTH = 340;

const anchorOf = (step: TourStepId): Element | null => {
  if (step === 'select' || step === 'edit') return stepCanvasTarget(null, 1)?.element ?? null;
  return document.querySelector(`[${TOUR_ANCHOR_ATTRIBUTE}="${step}"]`);
};

interface EditorTourProps {
  t: SiteEditorMessages;
  onFinish: () => void;
}

export function EditorTour({ t, onFinish }: EditorTourProps) {
  const steps = TOUR_STEPS;
  const [index, setIndex] = useState(0);
  const step = steps[index] ?? 'select';
  const [anchor, setAnchor] = useState<Element | null>(null);
  const [rect] = useElementRects(anchor);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const textId = useId();
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const next = anchorOf(step);
    next?.scrollIntoView({ block: 'center' });
    setAnchor(next);
    titleRef.current?.focus({ preventScroll: true });
  }, [step]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const observer = new ResizeObserver(() => setHeight(card.offsetHeight));
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const isLast = index === steps.length - 1;
  const copy = t.tour.steps[step];
  const below = rect ? rect.bottom + GAP : EDGE * 8;
  const fitsBelow = below + height <= window.innerHeight - EDGE;
  const top = rect && !fitsBelow ? Math.max(rect.top - GAP - height, EDGE) : below;
  const left = rect
    ? Math.min(
        Math.max(rect.left, EDGE),
        window.innerWidth - Math.min(WIDTH, window.innerWidth - EDGE * 2) - EDGE,
      )
    : EDGE;

  return (
    <div {...{ [EDITOR_ROOT_ATTRIBUTE]: '' }}>
      {rect && (
        <div
          aria-hidden="true"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
          }}
          className="pointer-events-none fixed z-[2147483004] rounded-2xl ring-2 ring-brand-lime ring-offset-2 ring-offset-bg-page"
        />
      )}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        aria-describedby={textId}
        style={{ top, left }}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return;
          event.stopPropagation();
          onFinish();
        }}
        className="pointer-events-auto fixed z-[2147483005] flex w-[min(340px,calc(100vw-24px))] flex-col gap-3 rounded-2xl border border-white/12 bg-viratec-deep p-4 shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
      >
        <span className="text-[12px] font-medium text-viratec-cyan">
          {t.tour.step(index + 1, steps.length)}
        </span>
        <h2
          ref={titleRef}
          id={titleId}
          tabIndex={-1}
          className="font-display text-[18px] font-medium text-text-primary outline-none"
        >
          {copy.title}
        </h2>
        <p id={textId} className="text-[14px] leading-6 text-text-muted">
          {copy.text}
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          {!isLast && <Button label={t.tour.skip} variant="secondary" onClick={onFinish} />}
          <Button
            label={isLast ? t.tour.done : t.tour.next}
            onClick={() => (isLast ? onFinish() : setIndex(index + 1))}
          />
        </div>
      </div>
    </div>
  );
}

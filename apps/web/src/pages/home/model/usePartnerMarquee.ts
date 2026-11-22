import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import { usePauseOffscreen } from '@/shared/lib';

const NUDGE_DURATION_MS = 560;
const NUDGE_VIEWPORT_SHARE = 0.7;
const DRAG_START_PX = 6;
const FLICK_TRAVEL_MS = 220;
const FLICK_MAX_IDLE_MS = 100;

interface NudgeState {
  distance: number;
  applied: number;
  frame: number;
}

interface DragState {
  pointerId: number;
  startX: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  isActive: boolean;
}

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3;

const wrapTime = (time: number, duration: number) => ((time % duration) + duration) % duration;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function readTimeline(track: HTMLElement) {
  const animation = track.getAnimations()[0];
  const time = animation?.currentTime;
  const duration = animation?.effect?.getComputedTiming().duration;
  const loopWidth = track.offsetWidth / 2;

  if (!animation || typeof time !== 'number' || typeof duration !== 'number' || loopWidth === 0) {
    return null;
  }

  return { animation, time, duration, msPerPixel: duration / loopWidth };
}

function shiftTrack(track: HTMLElement, pixels: number) {
  const timeline = readTimeline(track);
  if (!timeline) return;
  timeline.animation.currentTime = wrapTime(
    timeline.time + pixels * timeline.msPerPixel,
    timeline.duration,
  );
}

function runNudge(track: HTMLElement, distance: number): NudgeState {
  const state: NudgeState = { distance, applied: 0, frame: 0 };
  const startedAt = performance.now();

  const step = (now: number) => {
    const progress = Math.min(Math.max((now - startedAt) / NUDGE_DURATION_MS, 0), 1);
    const position = distance * easeOutCubic(progress);
    shiftTrack(track, position - state.applied);
    state.applied = position;
    if (progress < 1) state.frame = requestAnimationFrame(step);
  };

  state.frame = requestAnimationFrame(step);
  return state;
}

export function usePartnerMarquee() {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const nudgeRef = useRef<NudgeState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const didDragRef = useRef(false);
  const [isPausedByUser, setIsPausedByUser] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  usePauseOffscreen(rootRef);

  useEffect(
    () => () => {
      if (nudgeRef.current) cancelAnimationFrame(nudgeRef.current.frame);
    },
    [],
  );

  const takePendingDistance = () => {
    const pending = nudgeRef.current;
    if (!pending) return 0;
    cancelAnimationFrame(pending.frame);
    nudgeRef.current = null;
    return pending.distance - pending.applied;
  };

  const nudge = (pixels: number) => {
    const track = trackRef.current;
    if (!track) return;
    const distance = pixels + takePendingDistance();
    if (prefersReducedMotion()) {
      shiftTrack(track, distance);
      return;
    }
    nudgeRef.current = runNudge(track, distance);
  };

  const nudgeByViewport = (direction: 1 | -1) => {
    const viewport = viewportRef.current;
    if (viewport) nudge(viewport.clientWidth * NUDGE_VIEWPORT_SHARE * direction);
  };

  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    const item = event.target.closest('li');
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!item || !viewport || !track || !event.target.matches(':focus-visible')) return;
    const timeline = readTimeline(track);
    if (!timeline) return;

    takePendingDistance();
    const itemOffset = item.getBoundingClientRect().left - track.getBoundingClientRect().left;
    const centeredOffset = Math.max(0, itemOffset - (viewport.clientWidth - item.offsetWidth) / 2);
    timeline.animation.currentTime = wrapTime(
      centeredOffset * timeline.msPerPixel,
      timeline.duration,
    );
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    didDragRef.current = false;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
      isActive: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag || !track || drag.pointerId !== event.pointerId) return;

    if (!drag.isActive) {
      if (Math.abs(event.clientX - drag.startX) < DRAG_START_PX) return;
      drag.isActive = true;
      didDragRef.current = true;
      takePendingDistance();
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
    }

    const delta = event.clientX - drag.lastX;
    const elapsed = event.timeStamp - drag.lastTime;
    if (elapsed > 0) drag.velocity = delta / elapsed;
    drag.lastX = event.clientX;
    drag.lastTime = event.timeStamp;
    shiftTrack(track, -delta);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (!drag.isActive) return;

    setIsDragging(false);
    const isFlick =
      event.type === 'pointerup' && event.timeStamp - drag.lastTime <= FLICK_MAX_IDLE_MS;
    if (isFlick) nudge(-drag.velocity * FLICK_TRAVEL_MS);
  };

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!didDragRef.current) return;
    didDragRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => event.preventDefault();

  return {
    rootRef,
    viewportRef,
    trackRef,
    isPaused: isPausedByUser || isDragging,
    isPausedByUser,
    togglePaused: () => setIsPausedByUser((paused) => !paused),
    showPrevious: () => nudgeByViewport(-1),
    showNext: () => nudgeByViewport(1),
    viewportProps: {
      onFocus: handleFocus,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerEnd,
      onPointerCancel: handlePointerEnd,
      onClickCapture: handleClickCapture,
      onDragStart: handleDragStart,
    },
  };
}

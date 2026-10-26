import { useEffect, useRef } from 'react';
import {
  BASE_VIEW,
  DEG,
  fadeByDepth,
  renderGlobe,
  toTranslate,
  type GlobeFrame,
} from '../lib/projection';

const SWAY_DEGREES = 20;
const SWAY_PERIOD_SECONDS = 28;
const POINTER_LON_DEGREES = 10;
const POINTER_TILT_DEGREES = 6;
const POINTER_EASING = 0.045;
const EASING_FRAME_MS = 1000 / 60;
const IDLE_FRAME_MS = 1000 / 30;
const POINTER_ACTIVE_MS = 1000;

function setOpacity(element: Element | undefined, opacity: number) {
  if (element instanceof SVGElement) {
    element.style.opacity = opacity.toFixed(3);
  }
}

export function useGlobeAnimation() {
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<SVGGElement>(null);
  const arcsRef = useRef<SVGGElement>(null);
  const cometsRef = useRef<SVGGElement>(null);
  const linksRef = useRef<SVGGElement>(null);
  const partnersRef = useRef<SVGGElement>(null);
  const hubRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const pointer = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    const start = performance.now();
    const tracksPointer = window.matchMedia('(pointer: fine)').matches;
    let frameId = 0;
    let running = false;
    let inView = true;
    let lastFrame = start;
    let lastRender = -Infinity;
    let lastPointerMove = -Infinity;

    const applyFrame = (frame: GlobeFrame) => {
      const setPaths = (group: SVGGElement | null, paths: string[]) => {
        if (!group) return;
        paths.forEach((path, index) => group.children[index]?.setAttribute('d', path));
      };
      setPaths(gridRef.current, frame.grid);
      setPaths(arcsRef.current, frame.arcs);
      setPaths(cometsRef.current, frame.arcs);
      setPaths(linksRef.current, frame.links);
      frame.arcOpacity.forEach((opacity, index) => {
        setOpacity(arcsRef.current?.children[index], opacity);
        setOpacity(cometsRef.current?.children[index], opacity);
      });
      frame.linkOpacity.forEach((opacity, index) => {
        setOpacity(linksRef.current?.children[index], opacity);
      });
      frame.partners.forEach((point, index) => {
        const dot = partnersRef.current?.children[index];
        dot?.setAttribute('transform', toTranslate(point));
        setOpacity(dot, fadeByDepth(point.depth));
      });
      hubRef.current?.setAttribute('transform', toTranslate(frame.hub));
    };

    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick);
      const pointerActive = now - lastPointerMove < POINTER_ACTIVE_MS;
      if (!pointerActive && now - lastRender < IDLE_FRAME_MS) return;

      const easing = 1 - (1 - POINTER_EASING) ** ((now - lastFrame) / EASING_FRAME_MS);
      lastFrame = now;
      lastRender = now;
      eased.x += (pointer.x - eased.x) * easing;
      eased.y += (pointer.y - eased.y) * easing;
      const seconds = (now - start) / 1000;
      const sway = Math.sin((seconds / SWAY_PERIOD_SECONDS) * Math.PI * 2) * SWAY_DEGREES;
      applyFrame(
        renderGlobe({
          centerLon: BASE_VIEW.centerLon + sway - eased.x * POINTER_LON_DEGREES,
          tilt: BASE_VIEW.tilt + eased.y * POINTER_TILT_DEGREES * DEG,
        }),
      );
    };

    const play = () => {
      if (running || !inView || document.hidden) return;
      running = true;
      lastFrame = performance.now();
      frameId = requestAnimationFrame(tick);
    };

    const pause = () => {
      running = false;
      cancelAnimationFrame(frameId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
      lastPointerMove = event.timeStamp;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pause();
      } else {
        play();
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
      root.toggleAttribute('data-offscreen', !inView);
      if (inView) {
        play();
      } else {
        pause();
      }
    });

    observer.observe(root);
    if (tracksPointer) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    play();

    return () => {
      pause();
      observer.disconnect();
      root.removeAttribute('data-offscreen');
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return { rootRef, gridRef, arcsRef, cometsRef, linksRef, partnersRef, hubRef };
}

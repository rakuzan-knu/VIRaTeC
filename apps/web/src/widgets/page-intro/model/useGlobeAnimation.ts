import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { clusterPoints, isPointReachable, viewOfGroup } from '../lib/clusters';
import { PARTNERS } from '../lib/partners';
import {
  BASE_VIEW,
  DEG,
  INITIAL_FRAME,
  RADIUS,
  VIEW_SIZE,
  fadeByDepth,
  focusZoom,
  renderGlobe,
  toCamera,
  toTranslate,
  type GlobeFrame,
  type View,
} from '../lib/projection';
import { nightCaps } from '../lib/sun';

interface GlobeAnimationOptions {
  selectedIndex: number | null;
  isPlaying: boolean;
  onSelect: (index: number) => void;
  onHover: (indices: number[] | null) => void;
  onInteract: () => void;
}

interface GlobeDrag {
  pointerId: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  time: number;
  moved: boolean;
}

interface GlobeMotion {
  view: View;
  target: View | null;
  velocity: { lon: number; tilt: number };
  frame: GlobeFrame;
  idleUntil: number;
  hovered: number | null;
  selected: number | null;
  clusters: number[][];
  pinch: { distance: number; zoom: number } | null;
  drag: GlobeDrag | null;
}

const ROTATION_DEGREES_PER_SECOND = 3;
const FLIGHT_EASING = 3.4;
const INERTIA_FRICTION = 3.2;
const MIN_VELOCITY_DEGREES = 0.4;
const MAX_VELOCITY_DEGREES = 140;
const MAX_PIXEL_RATIO = 1.5;
const MAX_TILT = 70 * DEG;
const MAX_ZOOM = 12;
const BORDERS_ZOOM = 1.2;
const NIGHT_REFRESH_MS = 60_000;
const ZOOM_FACTOR = 1.6;
const KEY_STEP_DEGREES = 12;
const IDLE_FRAME_MS = 1000 / 30;
const IDLE_DELAY_MS = 2500;
const DRAG_THRESHOLD_PX = 5;
const PICK_RADIUS_PX = 16;
const STALE_VELOCITY_MS = 80;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const clampVelocity = (degrees: number) =>
  clamp(degrees, -MAX_VELOCITY_DEGREES, MAX_VELOCITY_DEGREES);

const nearestTurn = (from: number, to: number) => {
  const difference = (to - from) % 360;
  return from + ((difference + 540) % 360) - 180;
};

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const speedOf = ({ lon, tilt }: GlobeMotion['velocity']) => Math.hypot(lon, tilt / DEG);

const toPercent = (coordinate: number) => `${(coordinate / VIEW_SIZE + 0.5) * 100}%`;

function setOpacity(element: Element | null | undefined, opacity: number) {
  if (element instanceof SVGElement) {
    element.style.opacity = opacity.toFixed(3);
  }
}

export function useGlobeAnimation({
  selectedIndex,
  isPlaying,
  onSelect,
  onHover,
  onInteract,
}: GlobeAnimationOptions) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clipRef = useRef<SVGCircleElement>(null);
  const gridRef = useRef<SVGGElement>(null);
  const arcsRef = useRef<SVGGElement>(null);
  const cometsRef = useRef<SVGGElement>(null);
  const linksRef = useRef<SVGGElement>(null);
  const partnersRef = useRef<SVGGElement>(null);
  const hubRef = useRef<SVGGElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const isRotatingRef = useRef(false);
  const motionRef = useRef<GlobeMotion>({
    view: { ...BASE_VIEW },
    target: null,
    velocity: { lon: 0, tilt: 0 },
    frame: INITIAL_FRAME,
    idleUntil: 0,
    hovered: null,
    selected: null,
    clusters: [],
    pinch: null,
    drag: null,
  });

  useEffect(() => {
    isRotatingRef.current = isPlaying && selectedIndex === null;
  }, [isPlaying, selectedIndex]);

  useEffect(() => {
    const motion = motionRef.current;
    motion.selected = selectedIndex;
    const partner = selectedIndex === null ? null : PARTNERS[selectedIndex];
    if (!partner) {
      if (motion.view.zoom > 1) motion.target = { ...motion.view, zoom: 1, tilt: BASE_VIEW.tilt };
      return;
    }
    motion.velocity = { lon: 0, tilt: 0 };
    motion.target = {
      centerLon: nearestTurn(motion.view.centerLon, partner.lon),
      tilt: partner.lat * DEG,
      zoom: focusZoom(partner),
    };
  }, [selectedIndex]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!root || !canvas || !context) return;

    const motion = motionRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const styles = getComputedStyle(root);
    const colors = {
      fill: styles.getPropertyValue('--color-viratec-globe-land'),
      coast: styles.getPropertyValue('--color-viratec-globe-coast'),
      night: styles.getPropertyValue('--color-viratec-night'),
    };
    let drawGlobe: typeof import('../lib/land').drawGlobe | null = null;
    let traceBorders: typeof import('../lib/borders').traceBorders | null = null;
    let areBordersRequested = false;
    let night = nightCaps(Date.now());
    let nightTime = performance.now();
    let lastScale = '';
    let disposed = false;
    let frameId = 0;
    let running = false;
    let inView = true;
    let needsRender = true;
    let lastFrame = performance.now();
    let lastRender = -Infinity;

    const applyFrame = (frame: GlobeFrame) => {
      const setPaths = (group: SVGGElement | null, paths: string[]) => {
        if (!group) return;
        paths.forEach((path, index) => group.children[index]?.setAttribute('d', path));
      };
      const { zoom } = motion.view;
      const isInside = (x: number, y: number) => zoom < 1.01 || Math.hypot(x, y) < RADIUS;
      clipRef.current?.setAttribute(
        'r',
        String(Math.max(RADIUS, VIEW_SIZE / 2 - (zoom - 1) * RADIUS)),
      );
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
      const scale = root.clientWidth / VIEW_SIZE;
      motion.clusters = clusterPoints(frame.partners, zoom, scale, motion.selected);
      const clusterSize = new Map(
        motion.clusters.flatMap((cluster) =>
          cluster.length > 0 ? [[cluster[0] ?? 0, cluster.length] as const] : [],
        ),
      );
      const scaleKey = scale.toFixed(3);
      if (scaleKey !== lastScale) {
        lastScale = scaleKey;
        partnersRef.current?.style.setProperty('--globe-unit', String(1 / scale));
      }
      frame.partners.forEach((point, index) => {
        const dot = partnersRef.current?.children[index];
        dot?.setAttribute('transform', toTranslate(point));
        const count = clusterSize.get(index) ?? 0;
        setOpacity(dot, count > 0 && isInside(point.x, point.y) ? fadeByDepth(point.depth) : 0);
        dot?.toggleAttribute('data-cluster', count > 1);
        const label = dot?.querySelector('text');
        if (label && count > 1) label.textContent = String(count);
      });
      hubRef.current?.setAttribute('transform', toTranslate(frame.hub));
      setOpacity(
        hubRef.current,
        isInside(frame.hub.x, frame.hub.y) ? fadeByDepth(frame.hub.depth) : 0,
      );
    };

    const paintLand = () => {
      if (!drawGlobe) return;
      const ratio = Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO);
      const size = Math.round(root.clientWidth * ratio);
      if (canvas.width !== size) {
        canvas.width = size;
        canvas.height = size;
      }
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, size, size);
      context.translate(size / 2, size / 2);
      drawGlobe(context, toCamera(motion.view), size / VIEW_SIZE, colors, { night, traceBorders });
    };

    const advance = (now: number, delta: number): boolean => {
      const { view, target, velocity, drag } = motion;
      if (motion.pinch) return true;
      if (drag) return drag.moved;
      if (target) {
        const easing = reducedMotion.matches ? 1 : 1 - Math.exp(-FLIGHT_EASING * delta);
        view.centerLon += (target.centerLon - view.centerLon) * easing;
        view.tilt += (target.tilt - view.tilt) * easing;
        view.zoom *= (target.zoom / view.zoom) ** easing;
        const isSettled =
          Math.abs(target.centerLon - view.centerLon) < 0.01 &&
          Math.abs(target.tilt - view.tilt) < 0.0002 &&
          Math.abs(target.zoom - view.zoom) < 0.005;
        if (isSettled) {
          motion.view = target;
          motion.target = null;
          motion.idleUntil = now + IDLE_DELAY_MS;
        }
        return true;
      }
      if (reducedMotion.matches) return false;
      if (speedOf(velocity) > MIN_VELOCITY_DEGREES) {
        const friction = Math.exp(-INERTIA_FRICTION * delta);
        view.centerLon += velocity.lon * delta;
        view.tilt = clamp(view.tilt + velocity.tilt * delta, -MAX_TILT, MAX_TILT);
        velocity.lon *= friction;
        velocity.tilt *= friction;
        return true;
      }
      const canRotate =
        isRotatingRef.current &&
        motion.hovered === null &&
        now > motion.idleUntil &&
        view.zoom < 1.05;
      if (!canRotate) return false;
      view.centerLon -= ROTATION_DEGREES_PER_SECOND * delta;
      return true;
    };

    const loadBorders = () => {
      import('../lib/borders').then(
        (borders) => {
          if (disposed) return;
          traceBorders = borders.traceBorders;
          needsRender = true;
        },
        () => undefined,
      );
    };

    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick);
      const isActive =
        motion.drag !== null ||
        motion.pinch !== null ||
        motion.target !== null ||
        speedOf(motion.velocity) > MIN_VELOCITY_DEGREES;
      if (!isActive && now - lastRender < IDLE_FRAME_MS) return;
      const delta = Math.min(0.1, (now - lastFrame) / 1000);
      lastFrame = now;
      lastRender = now;
      if (now - nightTime > NIGHT_REFRESH_MS) {
        night = nightCaps(Date.now());
        nightTime = now;
        needsRender = true;
      }
      if (!advance(now, delta) && !needsRender) return;
      needsRender = false;
      if (motion.view.zoom > BORDERS_ZOOM && !areBordersRequested) {
        areBordersRequested = true;
        loadBorders();
      }
      motion.frame = renderGlobe(motion.view);
      applyFrame(motion.frame);
      paintLand();
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

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pause();
      } else {
        play();
      }
    };

    const intersection = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
      root.toggleAttribute('data-offscreen', !inView);
      if (inView) {
        play();
      } else {
        pause();
      }
    });
    const resize = new ResizeObserver(() => {
      needsRender = true;
    });

    import('../lib/land').then(
      (land) => {
        if (disposed) return;
        drawGlobe = land.drawGlobe;
        needsRender = true;
      },
      () => undefined,
    );
    intersection.observe(root);
    resize.observe(root);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    play();

    return () => {
      disposed = true;
      pause();
      intersection.disconnect();
      resize.disconnect();
      root.removeAttribute('data-offscreen');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const pick = (event: PointerEvent<HTMLElement>): number[] | null => {
    const root = rootRef.current;
    if (!root) return null;
    const { frame, view, clusters } = motionRef.current;
    const bounds = root.getBoundingClientRect();
    const scale = bounds.width / VIEW_SIZE;
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    let nearest: number[] | null = null;
    let nearestDistance = PICK_RADIUS_PX;
    for (const cluster of clusters) {
      const point = frame.partners[cluster[0] ?? 0];
      if (!point || !isPointReachable(point, view.zoom)) continue;
      const distance = Math.hypot(point.x * scale - x, point.y * scale - y);
      if (distance >= nearestDistance) continue;
      nearest = cluster;
      nearestDistance = distance;
    }
    return nearest;
  };

  const hover = (indices: number[] | null) => {
    const motion = motionRef.current;
    const leader = indices?.[0] ?? null;
    if (motion.hovered === leader) return;
    motion.hovered = leader;
    const point = leader === null ? null : motion.frame.partners[leader];
    if (point && labelRef.current) {
      labelRef.current.style.left = toPercent(point.x);
      labelRef.current.style.top = toPercent(point.y);
    }
    onHover(indices);
  };

  const steer = (change: Partial<View>) => {
    const motion = motionRef.current;
    hover(null);
    motion.velocity = { lon: 0, tilt: 0 };
    motion.target = { ...(motion.target ?? motion.view), ...change };
  };

  const zoomBy = (direction: 1 | -1) => {
    const { target, view } = motionRef.current;
    steer({ zoom: clamp((target ?? view).zoom * ZOOM_FACTOR ** direction, 1, MAX_ZOOM) });
  };

  const flyTo = (indices: number[]) => {
    const { view } = motionRef.current;
    const scale = (rootRef.current?.clientWidth ?? VIEW_SIZE) / VIEW_SIZE;
    const group = viewOfGroup(indices, scale, MAX_ZOOM);
    if (group) steer({ ...group, centerLon: nearestTurn(view.centerLon, group.centerLon) });
  };

  const pinchDistance = () => {
    const [first, second] = [...pointersRef.current.values()];
    return first && second ? Math.hypot(first.x - second.x, first.y - second.y) : null;
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    const motion = motionRef.current;
    if (event.button !== 0) return;
    onInteract();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const distance = pinchDistance();
    if (distance !== null) {
      motion.pinch ??= { distance, zoom: motion.view.zoom };
      motion.drag = null;
      motion.target = null;
      return;
    }
    motion.velocity = { lon: 0, tilt: 0 };
    motion.drag = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      time: event.timeStamp,
      moved: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const motion = motionRef.current;
    const { drag } = motion;
    if (pointersRef.current.has(event.pointerId)) {
      pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }
    const distance = pinchDistance();
    if (motion.pinch && distance !== null) {
      const zoom = motion.pinch.zoom * (distance / motion.pinch.distance);
      motion.view.zoom = clamp(zoom, 1, MAX_ZOOM);
      return;
    }
    if (!drag) {
      if (event.pointerType === 'mouse') hover(motion.target ? null : pick(event));
      return;
    }
    if (drag.pointerId !== event.pointerId) return;
    if (!drag.moved) {
      const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
      if (distance < DRAG_THRESHOLD_PX) return;
      drag.moved = true;
      motion.target = null;
      hover(null);
    }
    const { view } = motion;
    const width = rootRef.current?.clientWidth ?? VIEW_SIZE;
    const radiansPerPixel = VIEW_SIZE / (width * RADIUS * view.zoom);
    const lonStep = (-(event.clientX - drag.x) * radiansPerPixel) / DEG;
    const tiltStep = (event.clientY - drag.y) * radiansPerPixel;
    const seconds = Math.max(0.008, (event.timeStamp - drag.time) / 1000);
    view.centerLon += lonStep;
    view.tilt = clamp(view.tilt + tiltStep, -MAX_TILT, MAX_TILT);
    motion.velocity = {
      lon: clampVelocity((motion.velocity.lon + lonStep / seconds) / 2),
      tilt: clampVelocity((motion.velocity.tilt + tiltStep / seconds) / 2 / DEG) * DEG,
    };
    drag.x = event.clientX;
    drag.y = event.clientY;
    drag.time = event.timeStamp;
  };

  const endDrag = (event: PointerEvent<HTMLElement>, canSelect: boolean) => {
    const motion = motionRef.current;
    const { drag } = motion;
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) motion.pinch = null;
    if (!drag || drag.pointerId !== event.pointerId) return;
    motion.drag = null;
    motion.idleUntil = performance.now() + IDLE_DELAY_MS;
    if (event.timeStamp - drag.time > STALE_VELOCITY_MS || prefersReducedMotion()) {
      motion.velocity = { lon: 0, tilt: 0 };
    }
    if (drag.moved || !canSelect) return;
    const indices = pick(event);
    const [leader] = indices ?? [];
    if (!indices || leader === undefined) return;
    hover(null);
    if (indices.length > 1) flyTo(indices);
    else onSelect(leader);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const view = motionRef.current.target ?? motionRef.current.view;
    const step = KEY_STEP_DEGREES / view.zoom;
    const actions: Record<string, () => void> = {
      ArrowLeft: () => steer({ centerLon: view.centerLon - step }),
      ArrowRight: () => steer({ centerLon: view.centerLon + step }),
      ArrowUp: () => steer({ tilt: clamp(view.tilt + step * DEG, -MAX_TILT, MAX_TILT) }),
      ArrowDown: () => steer({ tilt: clamp(view.tilt - step * DEG, -MAX_TILT, MAX_TILT) }),
      '+': () => zoomBy(1),
      '=': () => zoomBy(1),
      '-': () => zoomBy(-1),
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    onInteract();
    action();
  };

  return {
    refs: {
      rootRef,
      canvasRef,
      clipRef,
      gridRef,
      arcsRef,
      cometsRef,
      linksRef,
      partnersRef,
      hubRef,
      labelRef,
    },
    zoomBy,
    flyTo,
    surfaceProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: (event: PointerEvent<HTMLElement>) => endDrag(event, true),
      onPointerCancel: (event: PointerEvent<HTMLElement>) => endDrag(event, false),
      onPointerLeave: () => hover(null),
      onKeyDown: handleKeyDown,
    },
  };
}

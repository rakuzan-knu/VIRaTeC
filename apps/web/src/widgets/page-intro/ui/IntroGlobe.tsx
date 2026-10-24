import { useEffect, useId, useRef } from 'react';

interface Vector {
  x: number;
  y: number;
  z: number;
}

interface ProjectedPoint {
  x: number;
  y: number;
  depth: number;
  visible: boolean;
}

interface City {
  lat: number;
  lon: number;
}

interface Partner extends City {
  name: string;
  country: string;
  hasArc?: boolean;
}

interface Link {
  from: City;
  to: Partner;
}

interface View {
  centerLon: number;
  tilt: number;
}

interface GlobeFrame {
  grid: string[];
  arcs: string[];
  arcOpacity: number[];
  links: string[];
  linkOpacity: number[];
  hub: ProjectedPoint;
  partners: ProjectedPoint[];
}

const RADIUS = 100;
const DEG = Math.PI / 180;
const BASE_VIEW: View = { centerLon: 2, tilt: 24 * DEG };
const SWAY_DEGREES = 20;
const SWAY_PERIOD_SECONDS = 28;
const POINTER_LON_DEGREES = 10;
const POINTER_TILT_DEGREES = 6;
const POINTER_EASING = 0.045;
const EASING_FRAME_MS = 1000 / 60;
const IDLE_FRAME_MS = 1000 / 30;
const POINTER_ACTIVE_MS = 1000;

const HUB: City = { lat: 50.45, lon: 30.52 };

const PARTNERS: Partner[] = [
  { name: 'University of Oxford', country: 'UK', lat: 51.75, lon: -1.26 },
  { name: 'Lancaster University', country: 'UK', lat: 54.01, lon: -2.79 },
  { name: 'Coventry University', country: 'UK', lat: 52.41, lon: -1.51, hasArc: true },
  { name: 'Manchester Metropolitan University', country: 'UK', lat: 53.47, lon: -2.24 },
  { name: 'Johns Hopkins University', country: 'US', lat: 39.33, lon: -76.62, hasArc: true },
  { name: 'Indiana University', country: 'US', lat: 39.17, lon: -86.52 },
  { name: 'Florida International University', country: 'US', lat: 25.76, lon: -80.37 },
  { name: 'Florida State University', country: 'US', lat: 30.44, lon: -84.3 },
  { name: 'University of Central Arkansas', country: 'US', lat: 35.08, lon: -92.46 },
  { name: 'Georgia State University', country: 'US', lat: 33.75, lon: -84.39 },
  { name: 'Campbellsville University', country: 'US', lat: 37.34, lon: -85.34 },
  { name: 'Universidad Católica de Colombia', country: 'CO', lat: 4.64, lon: -74.07, hasArc: true },
  { name: 'Universidad Santo Tomás', country: 'CL', lat: -33.45, lon: -70.66, hasArc: true },
  { name: 'École Nationale Polytechnique', country: 'DZ', lat: 36.72, lon: 3.18, hasArc: true },
  {
    name: 'American University in the Emirates',
    country: 'AE',
    lat: 25.1,
    lon: 55.17,
    hasArc: true,
  },
  {
    name: 'Karunya Institute of Technology and Sciences',
    country: 'IN',
    lat: 10.94,
    lon: 76.74,
    hasArc: true,
  },
  { name: 'Lutsk National Technical University', country: 'UA', lat: 50.75, lon: 25.34 },
  { name: 'Pryazovskyi State Technical University', country: 'UA', lat: 48.46, lon: 35.04 },
];

const ARC_TARGETS = PARTNERS.filter((partner) => partner.hasArc);

const LINKS: Link[] = PARTNERS.filter((partner) => !partner.hasArc).map((partner) => ({
  from: ARC_TARGETS.find((gateway) => gateway.country === partner.country) ?? HUB,
  to: partner,
}));

const DEPTH_FADE_START = -0.02;
const DEPTH_FADE_RANGE = 0.14;

function range(from: number, to: number, step: number): number[] {
  const values: number[] = [];
  for (let value = from; value <= to + 1e-9; value += step) {
    values.push(value);
  }
  return values;
}

const MERIDIAN_LONS = range(-180, 160, 20);
const MERIDIAN_LATS = range(-90, 90, 3);
const PARALLEL_LATS = range(-60, 75, 15);
const PARALLEL_LONS = range(-180, 180, 3);
const ARC_STEPS = range(0, 1, 1 / 64);

interface Camera {
  cosLon: number;
  sinLon: number;
  cosTilt: number;
  sinTilt: number;
}

interface LiftedVector {
  vector: Vector;
  lift: number;
}

function toVector({ lat, lon }: City): Vector {
  const phi = lat * DEG;
  const lambda = lon * DEG;
  return {
    x: Math.cos(phi) * Math.sin(lambda),
    y: Math.sin(phi),
    z: Math.cos(phi) * Math.cos(lambda),
  };
}

function toCamera(view: View): Camera {
  const lon = view.centerLon * DEG;
  return {
    cosLon: Math.cos(lon),
    sinLon: Math.sin(lon),
    cosTilt: Math.cos(view.tilt),
    sinTilt: Math.sin(view.tilt),
  };
}

function project(vector: Vector, camera: Camera, lift = 1): ProjectedPoint {
  const rotatedX = vector.x * camera.cosLon - vector.z * camera.sinLon;
  const rotatedZ = vector.z * camera.cosLon + vector.x * camera.sinLon;
  const y = vector.y * camera.cosTilt - rotatedZ * camera.sinTilt;
  const z = vector.y * camera.sinTilt + rotatedZ * camera.cosTilt;
  const x = rotatedX * RADIUS * lift;
  const screenY = -y * RADIUS * lift;
  return {
    x,
    y: screenY,
    depth: z,
    visible: z >= 0 || x * x + screenY * screenY > RADIUS * RADIUS,
  };
}

function fadeByDepth(depth: number): number {
  return Math.min(1, Math.max(0, (depth - DEPTH_FADE_START) / DEPTH_FADE_RANGE));
}

function toPath(points: ProjectedPoint[]): string {
  let path = '';
  let drawing = false;
  for (const point of points) {
    if (!point.visible) {
      drawing = false;
      continue;
    }
    path += `${drawing ? 'L' : 'M'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
    drawing = true;
  }
  return path || 'M0 0';
}

function arcBetween(from: City, to: City): LiftedVector[] {
  const a = toVector(from);
  const b = toVector(to);
  const omega = Math.acos(Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));
  const height = 0.22 * Math.min(1, omega / 1.1);
  return ARC_STEPS.map((s) => {
    const wa = Math.sin((1 - s) * omega) / Math.sin(omega);
    const wb = Math.sin(s * omega) / Math.sin(omega);
    return {
      vector: { x: wa * a.x + wb * b.x, y: wa * a.y + wb * b.y, z: wa * a.z + wb * b.z },
      lift: 1 + height * Math.sin(Math.PI * s),
    };
  });
}

const GRID_LINES = [
  ...MERIDIAN_LONS.map((lon) => MERIDIAN_LATS.map((lat) => toVector({ lat, lon }))),
  ...PARALLEL_LATS.map((lat) => PARALLEL_LONS.map((lon) => toVector({ lat, lon }))),
];
const HUB_VECTOR = toVector(HUB);
const PARTNER_VECTORS = PARTNERS.map(toVector);
const ARC_TARGET_VECTORS = ARC_TARGETS.map(toVector);
const LINK_VECTORS = LINKS.map((link) => ({ from: toVector(link.from), to: toVector(link.to) }));
const ARC_LINES = ARC_TARGETS.map((city) => arcBetween(HUB, city));
const LINK_LINES = LINKS.map((link) => arcBetween(link.from, link.to));

function renderGlobe(view: View): GlobeFrame {
  const camera = toCamera(view);
  const depthOf = (vector: Vector) => project(vector, camera).depth;
  const traceLine = (line: LiftedVector[]) =>
    toPath(line.map(({ vector, lift }) => project(vector, camera, lift)));
  return {
    grid: GRID_LINES.map((line) => toPath(line.map((vector) => project(vector, camera)))),
    arcs: ARC_LINES.map(traceLine),
    arcOpacity: ARC_TARGET_VECTORS.map((vector) => fadeByDepth(depthOf(vector))),
    links: LINK_LINES.map(traceLine),
    linkOpacity: LINK_VECTORS.map(({ from, to }) =>
      Math.min(fadeByDepth(depthOf(from)), fadeByDepth(depthOf(to))),
    ),
    hub: project(HUB_VECTOR, camera),
    partners: PARTNER_VECTORS.map((vector) => project(vector, camera)),
  };
}

function setOpacity(element: Element | undefined, opacity: number) {
  if (element instanceof SVGElement) {
    element.style.opacity = opacity.toFixed(3);
  }
}

function toTranslate(point: ProjectedPoint): string {
  return `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`;
}

const INITIAL_FRAME = renderGlobe(BASE_VIEW);

export function IntroGlobe() {
  const id = useId();
  const sphereId = `${id}-sphere`;
  const haloId = `${id}-halo`;
  const rimId = `${id}-rim`;

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

  return (
    <div ref={rootRef} aria-hidden="true" className="intro-globe">
      <svg viewBox="-135 -135 270 270" className="block size-full overflow-visible">
        <defs>
          <radialGradient id={sphereId} cx="36%" cy="28%" r="80%">
            <stop offset="0%" stopColor="#0f3f7d" stopOpacity="0.85" />
            <stop offset="55%" stopColor="#06204a" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#03122e" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={haloId} r="50%">
            <stop offset="70%" className="intro-globe-glow" stopOpacity="0" />
            <stop offset="74.5%" className="intro-globe-glow" stopOpacity="0.32" />
            <stop offset="82%" className="intro-globe-glow" stopOpacity="0.08" />
            <stop offset="100%" className="intro-globe-glow" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={rimId} x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" className="intro-globe-glow" stopOpacity="0.9" />
            <stop offset="45%" className="intro-globe-glow" stopOpacity="0.25" />
            <stop offset="100%" className="intro-globe-glow" stopOpacity="0" />
          </linearGradient>
        </defs>

        <circle r="135" fill={`url(#${haloId})`} />
        <circle r={RADIUS} fill={`url(#${sphereId})`} />

        <g ref={gridRef} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.35">
          {INITIAL_FRAME.grid.map((path, index) => (
            <path key={index} d={path} />
          ))}
        </g>

        <circle r={RADIUS} fill="none" stroke={`url(#${rimId})`} strokeWidth="0.7" />

        <g
          ref={arcsRef}
          fill="none"
          stroke="var(--color-viratec-lime)"
          strokeWidth="0.6"
          strokeLinecap="round"
        >
          {INITIAL_FRAME.arcs.map((path, index) => (
            <path
              key={index}
              d={path}
              pathLength={1}
              className="intro-globe-arc"
              style={{
                animationDelay: `${700 + index * 140}ms`,
                opacity: INITIAL_FRAME.arcOpacity[index],
              }}
            />
          ))}
        </g>

        <g
          ref={cometsRef}
          fill="none"
          stroke="#e9ffd0"
          strokeWidth="1.3"
          strokeLinecap="round"
          className="intro-globe-comets"
        >
          {INITIAL_FRAME.arcs.map((path, index) => (
            <path
              key={index}
              d={path}
              pathLength={1}
              className="intro-globe-comet"
              style={{
                animationDelay: `${2200 + index * 700}ms`,
                opacity: INITIAL_FRAME.arcOpacity[index],
              }}
            />
          ))}
        </g>

        <g
          ref={linksRef}
          fill="none"
          stroke="var(--color-viratec-cyan)"
          strokeOpacity="0.55"
          strokeWidth="0.35"
          strokeLinecap="round"
        >
          {INITIAL_FRAME.links.map((path, index) => (
            <path
              key={LINKS[index]?.to.name ?? index}
              d={path}
              style={{ opacity: INITIAL_FRAME.linkOpacity[index] }}
            />
          ))}
        </g>

        <g ref={partnersRef} fill="var(--color-viratec-cyan)">
          {INITIAL_FRAME.partners.map((point, index) => (
            <circle
              key={PARTNERS[index]?.name ?? index}
              r="1.15"
              transform={toTranslate(point)}
              style={{ opacity: fadeByDepth(point.depth) }}
            />
          ))}
        </g>

        <g ref={hubRef} transform={toTranslate(INITIAL_FRAME.hub)}>
          <circle
            r="4.5"
            fill="none"
            stroke="var(--color-viratec-lime)"
            strokeWidth="0.6"
            className="intro-globe-pulse"
          />
          <circle r="1.9" fill="var(--color-viratec-lime)" />
        </g>
      </svg>
    </div>
  );
}

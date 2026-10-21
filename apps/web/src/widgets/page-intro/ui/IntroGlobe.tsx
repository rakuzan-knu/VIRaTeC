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

function toVector({ lat, lon }: City, view: View): Vector {
  const phi = lat * DEG;
  const lambda = (lon - view.centerLon) * DEG;
  return {
    x: Math.cos(phi) * Math.sin(lambda),
    y: Math.sin(phi),
    z: Math.cos(phi) * Math.cos(lambda),
  };
}

function project(vector: Vector, view: View, lift = 1): ProjectedPoint {
  const y = vector.y * Math.cos(view.tilt) - vector.z * Math.sin(view.tilt);
  const z = vector.y * Math.sin(view.tilt) + vector.z * Math.cos(view.tilt);
  const x = vector.x * RADIUS * lift;
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

function arcBetween(from: City, to: City, view: View): string {
  const a = toVector(from, view);
  const b = toVector(to, view);
  const omega = Math.acos(Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));
  const height = 0.22 * Math.min(1, omega / 1.1);
  const points = ARC_STEPS.map((s) => {
    const wa = Math.sin((1 - s) * omega) / Math.sin(omega);
    const wb = Math.sin(s * omega) / Math.sin(omega);
    const vector = { x: wa * a.x + wb * b.x, y: wa * a.y + wb * b.y, z: wa * a.z + wb * b.z };
    return project(vector, view, 1 + height * Math.sin(Math.PI * s));
  });
  return toPath(points);
}

function renderGlobe(view: View): GlobeFrame {
  const meridians = MERIDIAN_LONS.map((lon) =>
    toPath(MERIDIAN_LATS.map((lat) => project(toVector({ lat, lon }, view), view))),
  );
  const parallels = PARALLEL_LATS.map((lat) =>
    toPath(PARALLEL_LONS.map((lon) => project(toVector({ lat, lon }, view), view))),
  );
  const partners = PARTNERS.map((city) => project(toVector(city, view), view));
  const depthOf = (city: City) => project(toVector(city, view), view).depth;
  return {
    grid: [...meridians, ...parallels],
    arcs: ARC_TARGETS.map((city) => arcBetween(HUB, city, view)),
    arcOpacity: ARC_TARGETS.map((city) => fadeByDepth(depthOf(city))),
    links: LINKS.map((link) => arcBetween(link.from, link.to, view)),
    linkOpacity: LINKS.map((link) =>
      Math.min(fadeByDepth(depthOf(link.from)), fadeByDepth(depthOf(link.to))),
    ),
    hub: project(toVector(HUB, view), view),
    partners,
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
    let frameId = 0;
    let running = false;
    let inView = true;

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
      eased.x += (pointer.x - eased.x) * POINTER_EASING;
      eased.y += (pointer.y - eased.y) * POINTER_EASING;
      const seconds = (now - start) / 1000;
      const sway = Math.sin((seconds / SWAY_PERIOD_SECONDS) * Math.PI * 2) * SWAY_DEGREES;
      applyFrame(
        renderGlobe({
          centerLon: BASE_VIEW.centerLon + sway - eased.x * POINTER_LON_DEGREES,
          tilt: BASE_VIEW.tilt + eased.y * POINTER_TILT_DEGREES * DEG,
        }),
      );
      frameId = requestAnimationFrame(tick);
    };

    const play = () => {
      if (running || !inView || document.hidden) return;
      running = true;
      frameId = requestAnimationFrame(tick);
    };

    const pause = () => {
      running = false;
      cancelAnimationFrame(frameId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
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
      if (inView) {
        play();
      } else {
        pause();
      }
    });

    observer.observe(root);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    play();

    return () => {
      pause();
      observer.disconnect();
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

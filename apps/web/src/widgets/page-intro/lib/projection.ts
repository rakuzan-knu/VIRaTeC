import { ARC_TARGETS, HUB, LINKS, PARTNERS, type City } from './partners';

interface Vector {
  x: number;
  y: number;
  z: number;
}

export interface ProjectedPoint {
  x: number;
  y: number;
  depth: number;
  visible: boolean;
}

export interface View {
  centerLon: number;
  tilt: number;
}

export interface GlobeFrame {
  grid: string[];
  arcs: string[];
  arcOpacity: number[];
  links: string[];
  linkOpacity: number[];
  hub: ProjectedPoint;
  partners: ProjectedPoint[];
}

export const RADIUS = 100;
export const DEG = Math.PI / 180;
export const BASE_VIEW: View = { centerLon: 2, tilt: 24 * DEG };

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

export function fadeByDepth(depth: number): number {
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

export function renderGlobe(view: View): GlobeFrame {
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

export function toTranslate(point: ProjectedPoint): string {
  return `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`;
}

export const INITIAL_FRAME = renderGlobe(BASE_VIEW);

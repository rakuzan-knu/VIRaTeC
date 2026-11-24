import type { traceBorders } from './borders';
import { LAND_RINGS } from './landData';
import { decodeOutline, rotate } from './outline';
import { RADIUS, type Camera, type Vector } from './projection';

interface LimbCrossing {
  x: number;
  y: number;
  angle: number;
}

interface Chain {
  points: number[];
  entry: LimbCrossing | null;
  exit: LimbCrossing | null;
}

export interface GlobeColors {
  fill: string;
  coast: string;
  night: string;
}

export interface GlobeLayers {
  night: Vector[][];
  traceBorders: typeof traceBorders | null;
}

const NIGHT_BAND_ALPHA = 0.045;
const BORDER_ALPHA = 0.55;
const BORDER_ZOOM_START = 1.4;
const OVERVIEW_STEP = 0.012;
const DETAIL_ZOOM = 1.5;
const SHADE_SIZE = 128;
const FULL_TURN = Math.PI * 2;

let shade: CanvasRenderingContext2D | null = null;

const LAND = LAND_RINGS.map((encoded) => decodeOutline(encoded).reverse());

function simplify(ring: Vector[]): Vector[] {
  const kept: Vector[] = [];
  let last: Vector | null = null;
  for (const point of ring) {
    const distance = last
      ? Math.hypot(point.x - last.x, point.y - last.y, point.z - last.z)
      : Infinity;
    if (distance < OVERVIEW_STEP) continue;
    kept.push(point);
    last = point;
  }
  return kept;
}

const OVERVIEW_LAND = LAND.map(simplify).filter((ring) => ring.length > 3);

function crossLimb(from: Vector, to: Vector): LimbCrossing {
  const ratio = from.z / (from.z - to.z);
  const angle = Math.atan2(from.y + (to.y - from.y) * ratio, from.x + (to.x - from.x) * ratio);
  return { x: Math.cos(angle), y: Math.sin(angle), angle };
}

function clipRing(ring: Vector[], camera: Camera): Chain[] {
  const points = ring.map((vector) => rotate(vector, camera));
  const firstHidden = points.findIndex((point) => point.z < 0);
  if (firstHidden === -1) {
    return [{ points: points.flatMap(({ x, y }) => [x, y]), entry: null, exit: null }];
  }
  const chains: Chain[] = [];
  let current: Chain | null = null;
  for (let step = 0; step < points.length; step += 1) {
    const from = points[(firstHidden + step) % points.length];
    const to = points[(firstHidden + step + 1) % points.length];
    if (!from || !to) continue;
    if (from.z < 0 && to.z >= 0) {
      const entry = crossLimb(from, to);
      current = { points: [entry.x, entry.y, to.x, to.y], entry, exit: null };
      chains.push(current);
    } else if (from.z >= 0 && to.z < 0 && current) {
      current.exit = crossLimb(from, to);
      current.points.push(current.exit.x, current.exit.y);
    } else if (to.z >= 0 && current) {
      current.points.push(to.x, to.y);
    }
  }
  return chains;
}

function traceChain(
  context: CanvasRenderingContext2D,
  { points }: Chain,
  radius: number,
  startsPath: boolean,
) {
  for (let index = 0; index + 1 < points.length; index += 2) {
    const x = (points[index] ?? 0) * radius;
    const y = -(points[index + 1] ?? 0) * radius;
    if (index === 0 && startsPath) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }
}

function counterClockwiseGap(from: LimbCrossing, to: LimbCrossing): number {
  return (to.angle - from.angle + FULL_TURN) % FULL_TURN;
}

function traceLand(context: CanvasRenderingContext2D, chains: Chain[], radius: number) {
  const pending = new Set(chains.filter((chain) => chain.entry && chain.exit));
  for (const chain of chains) {
    if (chain.entry) continue;
    traceChain(context, chain, radius, true);
    context.closePath();
  }
  for (const start of pending) {
    let chain = start;
    let startsPath = true;
    for (;;) {
      pending.delete(chain);
      traceChain(context, chain, radius, startsPath);
      startsPath = false;
      const exit = chain.exit;
      if (!exit) break;
      let next = start;
      let smallestGap = start.entry ? counterClockwiseGap(exit, start.entry) : FULL_TURN;
      for (const candidate of pending) {
        if (!candidate.entry) continue;
        const gap = counterClockwiseGap(exit, candidate.entry);
        if (gap < smallestGap) {
          smallestGap = gap;
          next = candidate;
        }
      }
      context.arc(0, 0, radius, -exit.angle, -exit.angle - smallestGap, true);
      if (next === start) break;
      chain = next;
    }
    context.closePath();
  }
}

function paintNight(
  context: CanvasRenderingContext2D,
  camera: Camera,
  sphereRadius: number,
  color: string,
  caps: Vector[][],
) {
  shade ??= document.createElement('canvas').getContext('2d');
  if (!shade) return;
  const center = SHADE_SIZE / 2;
  shade.canvas.width = SHADE_SIZE;
  shade.canvas.height = SHADE_SIZE;
  shade.translate(center, center);
  shade.fillStyle = color;
  shade.globalAlpha = NIGHT_BAND_ALPHA;
  for (const ring of caps) {
    shade.beginPath();
    traceLand(shade, clipRing(ring, camera), center * camera.zoom);
    shade.fill();
  }
  context.drawImage(shade.canvas, -sphereRadius, -sphereRadius, sphereRadius * 2, sphereRadius * 2);
}

export function drawGlobe(
  context: CanvasRenderingContext2D,
  camera: Camera,
  scale: number,
  colors: GlobeColors,
  layers: GlobeLayers,
) {
  const radius = RADIUS * camera.zoom * scale;
  const land = camera.zoom < DETAIL_ZOOM ? OVERVIEW_LAND : LAND;
  const chains = land.flatMap((ring) => clipRing(ring, camera));
  context.save();
  context.beginPath();
  context.arc(0, 0, RADIUS * scale, 0, FULL_TURN);
  context.clip();
  context.beginPath();
  traceLand(context, chains, radius);
  context.fillStyle = colors.fill;
  context.fill('evenodd');
  if (layers.traceBorders) {
    context.globalAlpha = BORDER_ALPHA * Math.min(1, Math.max(0, camera.zoom - BORDER_ZOOM_START));
    context.strokeStyle = colors.coast;
    context.lineWidth = Math.max(0.5, 0.16 * scale);
    context.beginPath();
    layers.traceBorders(context, camera, radius);
    context.stroke();
    context.globalAlpha = 1;
  }
  context.beginPath();
  for (const chain of chains) {
    traceChain(context, chain, radius, true);
    if (!chain.entry) context.closePath();
  }
  context.strokeStyle = colors.coast;
  context.lineWidth = Math.max(0.7, 0.28 * scale);
  context.lineJoin = 'bevel';
  context.stroke();
  paintNight(context, camera, RADIUS * scale, colors.night, layers.night);
  context.restore();
}

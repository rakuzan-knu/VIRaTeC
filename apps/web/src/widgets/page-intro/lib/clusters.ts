import { PARTNERS } from './partners';
import { RADIUS, toVector, type ProjectedPoint, type View } from './projection';

const CLUSTER_DISTANCE_PX = 18;
const MIN_VISIBLE_DEPTH = 0.02;

export function isPointReachable(point: ProjectedPoint, zoom: number): boolean {
  return point.depth >= MIN_VISIBLE_DEPTH && (zoom < 1.01 || Math.hypot(point.x, point.y) < RADIUS);
}

export function clusterPoints(
  points: ProjectedPoint[],
  zoom: number,
  scale: number,
  selected: number | null,
): number[][] {
  const pending = new Set(
    points.flatMap((point, index) =>
      index !== selected && isPointReachable(point, zoom) ? [index] : [],
    ),
  );
  const clusters: number[][] = selected === null ? [] : [[selected]];
  for (const leader of pending) {
    const origin = points[leader];
    if (!origin) continue;
    const members = [...pending].filter((index) => {
      const point = points[index];
      return (
        point !== undefined &&
        Math.hypot(point.x - origin.x, point.y - origin.y) * scale < CLUSTER_DISTANCE_PX
      );
    });
    members.forEach((index) => pending.delete(index));
    clusters.push(members);
  }
  return clusters;
}

function smallestGap(indices: number[]): number {
  const vectors = indices.flatMap((index) => {
    const partner = PARTNERS[index];
    return partner ? [toVector(partner)] : [];
  });
  let gap = Infinity;
  vectors.forEach((a, index) => {
    vectors.slice(index + 1).forEach((b) => {
      gap = Math.min(gap, Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z));
    });
  });
  return gap;
}

export function viewOfGroup(indices: number[], scale: number, maxZoom: number): View | null {
  const vectors = indices.flatMap((index) => {
    const partner = PARTNERS[index];
    return partner ? [toVector(partner)] : [];
  });
  if (vectors.length === 0) return null;
  const sum = vectors.reduce(
    (total, { x, y, z }) => ({ x: total.x + x, y: total.y + y, z: total.z + z }),
    { x: 0, y: 0, z: 0 },
  );
  const spread = Math.max(
    ...vectors.map(({ x, y, z }) =>
      Math.hypot(
        x - sum.x / vectors.length,
        y - sum.y / vectors.length,
        z - sum.z / vectors.length,
      ),
    ),
    0.01,
  );
  const separatingZoom = (CLUSTER_DISTANCE_PX * 1.2) / (RADIUS * scale * smallestGap(indices));
  const fittingZoom = 0.8 / spread;
  return {
    centerLon: (Math.atan2(sum.x, sum.z) * 180) / Math.PI,
    tilt: Math.atan2(sum.y, Math.hypot(sum.x, sum.z)),
    zoom: Math.max(1.8, Math.min(maxZoom, separatingZoom, fittingZoom)),
  };
}

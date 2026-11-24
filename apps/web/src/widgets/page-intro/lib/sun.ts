import { DEG, toVector, type Vector } from './projection';

const DAY_MS = 86_400_000;
const J2000_MS = Date.UTC(2000, 0, 1, 12);
const SHADE_RADII = [72, 74, 76, 78, 80, 82, 84, 86, 88, 89.9];
const RING_STEPS = 96;

export function subsolarPoint(time: number) {
  const days = (time - J2000_MS) / DAY_MS;
  const anomaly = (357.529 + 0.98560028 * days) * DEG;
  const meanLongitude = 280.459 + 0.98564736 * days;
  const longitude =
    (meanLongitude + 1.915 * Math.sin(anomaly) + 0.02 * Math.sin(2 * anomaly)) * DEG;
  const obliquity = (23.439 - 0.00000036 * days) * DEG;
  const rightAscension = Math.atan2(Math.cos(obliquity) * Math.sin(longitude), Math.cos(longitude));
  const siderealDegrees = (18.697374558 + 24.06570982441908 * days) * 15;
  const lon = (((rightAscension / DEG - siderealDegrees) % 360) + 540) % 360;
  return {
    lat: Math.asin(Math.sin(obliquity) * Math.sin(longitude)) / DEG,
    lon: lon - 180,
  };
}

function cap(center: Vector, radiusDegrees: number): Vector[] {
  const length = Math.hypot(center.x, center.z) || 1;
  const u = { x: center.z / length, y: 0, z: -center.x / length };
  const v = {
    x: center.y * u.z,
    y: center.z * u.x - center.x * u.z,
    z: -center.y * u.x,
  };
  const along = Math.cos(radiusDegrees * DEG);
  const across = Math.sin(radiusDegrees * DEG);
  return Array.from({ length: RING_STEPS }, (_, step) => {
    const angle = (step / RING_STEPS) * Math.PI * 2;
    const cos = Math.cos(angle) * across;
    const sin = Math.sin(angle) * across;
    return {
      x: center.x * along + u.x * cos + v.x * sin,
      y: center.y * along + u.y * cos + v.y * sin,
      z: center.z * along + u.z * cos + v.z * sin,
    };
  });
}

export function nightCaps(time: number): Vector[][] {
  const { lat, lon } = subsolarPoint(time);
  const midnight = toVector({ lat: -lat, lon: lon + 180 });
  return SHADE_RADII.map((radius) => cap(midnight, radius));
}

import { toVector, type Camera, type Vector } from './projection';

const UNITS_PER_DEGREE = 20;

export function decodeOutline(encoded: string): Vector[] {
  const deltas = encoded.split(' ').map(Number);
  const outline: Vector[] = [];
  let lon = 0;
  let lat = 0;
  for (let index = 0; index + 1 < deltas.length; index += 2) {
    lon += deltas[index] ?? 0;
    lat += deltas[index + 1] ?? 0;
    outline.push(toVector({ lat: lat / UNITS_PER_DEGREE, lon: lon / UNITS_PER_DEGREE }));
  }
  return outline;
}

export function rotate(vector: Vector, camera: Camera): Vector {
  const x = vector.x * camera.cosLon - vector.z * camera.sinLon;
  const depth = vector.z * camera.cosLon + vector.x * camera.sinLon;
  return {
    x,
    y: vector.y * camera.cosTilt - depth * camera.sinTilt,
    z: vector.y * camera.sinTilt + depth * camera.cosTilt,
  };
}

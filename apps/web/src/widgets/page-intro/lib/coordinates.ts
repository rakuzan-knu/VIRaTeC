import type { City } from './partners';

export function formatCoordinates({ lat, lon }: City): string {
  const latitude = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
  const longitude = `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'E' : 'W'}`;
  return `${latitude}, ${longitude}`;
}

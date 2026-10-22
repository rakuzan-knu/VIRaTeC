export type DeviceKind = 'desktop' | 'mobile' | 'tablet' | 'unknown';

export interface DeviceInfo {
  browser: string | null;
  os: string | null;
  kind: DeviceKind;
}

const BROWSERS: [RegExp, string][] = [
  [/Edg(?:e|A|iOS)?\//, 'Edge'],
  [/OPR\/|Opera/, 'Opera'],
  [/SamsungBrowser\//, 'Samsung Internet'],
  [/YaBrowser\//, 'Yandex Browser'],
  [/Firefox\/|FxiOS\//, 'Firefox'],
  [/Chrome\/|CriOS\//, 'Chrome'],
  [/Safari\//, 'Safari'],
];

const SYSTEMS: [RegExp, string][] = [
  [/Windows NT/, 'Windows'],
  [/iPhone|iPad|iPod/, 'iOS'],
  [/Android/, 'Android'],
  [/CrOS/, 'ChromeOS'],
  [/Mac OS X|Macintosh/, 'macOS'],
  [/Linux/, 'Linux'],
];

const match = (value: string, rules: [RegExp, string][]) =>
  rules.find(([pattern]) => pattern.test(value))?.[1] ?? null;

export function parseUserAgent(userAgent: string | null): DeviceInfo {
  if (!userAgent) return { browser: null, os: null, kind: 'unknown' };
  const kind: DeviceKind = /iPad|Tablet/.test(userAgent)
    ? 'tablet'
    : /Mobi|iPhone|Android/.test(userAgent)
      ? 'mobile'
      : /Windows|Macintosh|Linux|CrOS/.test(userAgent)
        ? 'desktop'
        : 'unknown';
  return { browser: match(userAgent, BROWSERS), os: match(userAgent, SYSTEMS), kind };
}

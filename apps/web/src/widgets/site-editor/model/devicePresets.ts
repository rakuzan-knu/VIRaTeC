export type DeviceKind = 'phone' | 'tablet' | 'laptop';

export type DeviceCutout = 'island' | 'notch' | 'punch' | 'none';

export interface DevicePreset {
  id: string;
  name: string;
  kind: DeviceKind;
  width: number;
  height: number;
  cutout: DeviceCutout;
}

export const CUSTOM_PRESET_ID = 'custom';

export const DEVICE_PRESETS: readonly DevicePreset[] = [
  { id: 'iphone-se', name: 'iPhone SE', kind: 'phone', width: 375, height: 667, cutout: 'none' },
  {
    id: 'iphone-13',
    name: 'iPhone 13 / 14',
    kind: 'phone',
    width: 390,
    height: 844,
    cutout: 'notch',
  },
  {
    id: 'iphone-16',
    name: 'iPhone 15 / 16',
    kind: 'phone',
    width: 393,
    height: 852,
    cutout: 'island',
  },
  {
    id: 'iphone-16-pro',
    name: 'iPhone 16 Pro',
    kind: 'phone',
    width: 402,
    height: 874,
    cutout: 'island',
  },
  {
    id: 'iphone-16-pro-max',
    name: 'iPhone 16 Pro Max',
    kind: 'phone',
    width: 440,
    height: 956,
    cutout: 'island',
  },
  { id: 'pixel-9', name: 'Pixel 8 / 9', kind: 'phone', width: 412, height: 915, cutout: 'punch' },
  { id: 'galaxy-s24', name: 'Galaxy S24', kind: 'phone', width: 360, height: 780, cutout: 'punch' },
  {
    id: 'galaxy-s24-ultra',
    name: 'Galaxy S24 Ultra',
    kind: 'phone',
    width: 384,
    height: 824,
    cutout: 'punch',
  },
  {
    id: 'galaxy-fold-closed',
    name: 'Galaxy Z Fold',
    kind: 'phone',
    width: 344,
    height: 882,
    cutout: 'punch',
  },
  {
    id: 'galaxy-fold-open',
    name: 'Galaxy Z Fold (open)',
    kind: 'tablet',
    width: 673,
    height: 841,
    cutout: 'punch',
  },
  { id: 'ipad-mini', name: 'iPad mini', kind: 'tablet', width: 744, height: 1133, cutout: 'none' },
  { id: 'ipad', name: 'iPad', kind: 'tablet', width: 768, height: 1024, cutout: 'none' },
  { id: 'ipad-air', name: 'iPad Air', kind: 'tablet', width: 820, height: 1180, cutout: 'none' },
  {
    id: 'ipad-pro-11',
    name: 'iPad Pro 11″',
    kind: 'tablet',
    width: 834,
    height: 1210,
    cutout: 'none',
  },
  {
    id: 'ipad-pro-13',
    name: 'iPad Pro 13″',
    kind: 'tablet',
    width: 1032,
    height: 1376,
    cutout: 'none',
  },
  {
    id: 'galaxy-tab-s9',
    name: 'Galaxy Tab S9',
    kind: 'tablet',
    width: 800,
    height: 1280,
    cutout: 'none',
  },
  {
    id: 'laptop-1280',
    name: 'Laptop 1280',
    kind: 'laptop',
    width: 1280,
    height: 800,
    cutout: 'none',
  },
  {
    id: 'laptop-1440',
    name: 'Laptop 1440',
    kind: 'laptop',
    width: 1440,
    height: 900,
    cutout: 'none',
  },
  {
    id: 'desktop-1920',
    name: 'Desktop 1920',
    kind: 'laptop',
    width: 1920,
    height: 1080,
    cutout: 'none',
  },
];

export const DEFAULT_PRESET: Record<'phone' | 'tablet', string> = {
  phone: 'iphone-16',
  tablet: 'ipad',
};

export const findPreset = (id: string) => DEVICE_PRESETS.find((preset) => preset.id === id);

export const MIN_SCREEN = 280;
export const MAX_SCREEN = 2560;

export const clampScreen = (value: number) =>
  Math.round(Math.min(MAX_SCREEN, Math.max(MIN_SCREEN, value)));

export const BREAKPOINTS = [
  { name: 'sm', width: 640 },
  { name: 'md', width: 768 },
  { name: 'lg', width: 1024 },
  { name: 'xl', width: 1280 },
  { name: '2xl', width: 1536 },
] as const;

export const activeBreakpoint = (width: number) =>
  [...BREAKPOINTS].reverse().find((point) => width >= point.width)?.name ?? 'base';

export const ZOOM_LEVELS = ['fit', 0.5, 0.75, 1] as const;

export type PreviewZoom = (typeof ZOOM_LEVELS)[number];

import { create } from 'zustand';
import { SITE_EDITOR_VIEWPORT_STORAGE_KEY } from '@/shared/config/storageKeys';
import { isLocale, type Locale } from '@/shared/i18n';
import {
  CUSTOM_PRESET_ID,
  DEFAULT_PRESET,
  ZOOM_LEVELS,
  clampScreen,
  findPreset,
  type DevicePreset,
  type PreviewZoom,
} from './devicePresets';

export interface ViewportSettings {
  presetId: string;
  width: number;
  height: number;
  isRotated: boolean;
  zoom: PreviewZoom;
  hasBezel: boolean;
  compareId: string | null;
  frameLocale: Locale | null;
}

interface ViewportState extends ViewportSettings {
  choosePreset: (id: string) => void;
  setCustomSize: (width: number, height: number) => void;
  chooseKind: (kind: 'phone' | 'tablet') => void;
  rotate: () => void;
  setZoom: (zoom: PreviewZoom) => void;
  toggleBezel: () => void;
  setCompare: (id: string | null) => void;
  setFrameLocale: (locale: Locale | null) => void;
}

const fallbackPreset = findPreset(DEFAULT_PRESET.phone);

const DEFAULTS: ViewportSettings = {
  presetId: DEFAULT_PRESET.phone,
  width: fallbackPreset?.width ?? 393,
  height: fallbackPreset?.height ?? 852,
  isRotated: false,
  zoom: 'fit',
  hasBezel: true,
  compareId: null,
  frameLocale: null,
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isZoom = (value: unknown): value is PreviewZoom =>
  ZOOM_LEVELS.some((level) => level === value);

const readSettings = (): ViewportSettings => {
  if (import.meta.env.SSR) return DEFAULTS;
  try {
    const raw: unknown = JSON.parse(
      localStorage.getItem(SITE_EDITOR_VIEWPORT_STORAGE_KEY) ?? 'null',
    );
    if (!isObject(raw)) return DEFAULTS;
    const presetId =
      typeof raw.presetId === 'string' &&
      (raw.presetId === CUSTOM_PRESET_ID || findPreset(raw.presetId))
        ? raw.presetId
        : DEFAULTS.presetId;
    const compareId =
      typeof raw.compareId === 'string' && findPreset(raw.compareId) ? raw.compareId : null;
    return {
      presetId,
      width: typeof raw.width === 'number' ? clampScreen(raw.width) : DEFAULTS.width,
      height: typeof raw.height === 'number' ? clampScreen(raw.height) : DEFAULTS.height,
      isRotated: raw.isRotated === true,
      zoom: isZoom(raw.zoom) ? raw.zoom : DEFAULTS.zoom,
      hasBezel: raw.hasBezel !== false,
      compareId,
      frameLocale: isLocale(raw.frameLocale) ? raw.frameLocale : null,
    };
  } catch {
    return DEFAULTS;
  }
};

const writeSettings = (settings: ViewportSettings) => {
  try {
    localStorage.setItem(SITE_EDITOR_VIEWPORT_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    return;
  }
};

const pickSettings = (state: ViewportState): ViewportSettings => ({
  presetId: state.presetId,
  width: state.width,
  height: state.height,
  isRotated: state.isRotated,
  zoom: state.zoom,
  hasBezel: state.hasBezel,
  compareId: state.compareId,
  frameLocale: state.frameLocale,
});

export const useViewportStore = create<ViewportState>((set) => ({
  ...readSettings(),
  choosePreset: (id) => {
    const preset = findPreset(id);
    if (preset) set({ presetId: id, width: preset.width, height: preset.height });
  },
  setCustomSize: (width, height) =>
    set({
      presetId: CUSTOM_PRESET_ID,
      width: clampScreen(width),
      height: clampScreen(height),
      isRotated: false,
    }),
  chooseKind: (kind) =>
    set((state) => {
      const current = findPreset(state.presetId);
      const matches = current
        ? kindOfWidth(current.width) === kind
        : kindOfWidth(state.width) === kind;
      const preset = matches ? null : findPreset(DEFAULT_PRESET[kind]);
      return preset ? { presetId: preset.id, width: preset.width, height: preset.height } : {};
    }),
  rotate: () => set((state) => ({ isRotated: !state.isRotated })),
  setZoom: (zoom) => set({ zoom }),
  toggleBezel: () => set((state) => ({ hasBezel: !state.hasBezel })),
  setCompare: (compareId) => set({ compareId }),
  setFrameLocale: (frameLocale) => set({ frameLocale }),
}));

useViewportStore.subscribe((state) => writeSettings(pickSettings(state)));

export interface ScreenSpec {
  key: string;
  name: string;
  width: number;
  height: number;
  preset: DevicePreset | null;
}

export const screenOf = (
  presetId: string,
  width: number,
  height: number,
  isRotated: boolean,
  customName: string,
): ScreenSpec => {
  const preset = findPreset(presetId) ?? null;
  const [w, h] = isRotated ? [height, width] : [width, height];
  return { key: presetId, name: preset?.name ?? customName, width: w, height: h, preset };
};

export const kindOfWidth = (width: number): 'phone' | 'tablet' =>
  width < 600 ? 'phone' : 'tablet';

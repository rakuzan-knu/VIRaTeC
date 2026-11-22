import { Maximize2, RotateCw, Smartphone, ZoomIn } from 'lucide-react';
import { LOCALES, isLocale } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { Select } from '@/shared/ui/Select';
import {
  CUSTOM_PRESET_ID,
  DEVICE_PRESETS,
  ZOOM_LEVELS,
  type PreviewZoom,
} from '../model/devicePresets';
import type { SiteEditorMessages } from '../model/messages';
import { useSiteEditorStore } from '../model/store';
import { kindOfWidth, useViewportStore } from '../model/viewport';
import { BreakpointRuler } from './BreakpointRuler';
import { DeviceSizeFields } from './DeviceSizeFields';
import { SegmentedChoice } from './SegmentedChoice';

interface DeviceSettingsProps {
  width: number;
  t: SiteEditorMessages;
}

const NONE = '';

const zoomValue = (zoom: PreviewZoom) => String(zoom);

const zoomFrom = (value: string): PreviewZoom =>
  ZOOM_LEVELS.find((level) => String(level) === value) ?? 'fit';

const TOGGLE_CLASS =
  'inline-flex h-9 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus motion-reduce:transition-none pointer-coarse:h-11';

export function DeviceSettings({ width, t }: DeviceSettingsProps) {
  const viewport = useViewportStore();
  const kindLabel = { phone: t.device.phones, tablet: t.device.tablets, laptop: t.device.laptops };
  const presetOptions = DEVICE_PRESETS.map((preset) => ({
    value: preset.id,
    label: `${kindLabel[preset.kind]} · ${preset.name} · ${preset.width}×${preset.height}`,
  }));

  const choosePreset = (id: string) => {
    viewport.choosePreset(id);
    const preset = DEVICE_PRESETS.find((item) => item.id === id);
    if (preset) useSiteEditorStore.getState().setDevice(kindOfWidth(preset.width));
  };

  return (
    <div className="flex flex-col gap-3">
      <Select
        label={t.device.presets}
        value={viewport.presetId}
        options={[
          ...presetOptions,
          ...(viewport.presetId === CUSTOM_PRESET_ID
            ? [{ value: CUSTOM_PRESET_ID, label: t.device.custom }]
            : []),
        ]}
        onChange={(event) => choosePreset(event.target.value)}
      />
      <DeviceSizeFields
        key={`${viewport.width}x${viewport.height}`}
        width={viewport.width}
        height={viewport.height}
        t={t}
        onApply={viewport.setCustomSize}
      />
      <div className="flex gap-1.5 rounded-xl bg-white/6 p-1">
        <button
          type="button"
          aria-pressed={viewport.isRotated}
          onClick={viewport.rotate}
          className={cn(
            TOGGLE_CLASS,
            viewport.isRotated
              ? 'bg-white/15 text-text-primary'
              : 'text-text-muted hover:bg-white/8 hover:text-text-primary',
          )}
        >
          <RotateCw aria-hidden="true" className="size-4" />
          {t.device.rotate}
        </button>
        <button
          type="button"
          aria-pressed={viewport.hasBezel}
          onClick={viewport.toggleBezel}
          className={cn(
            TOGGLE_CLASS,
            viewport.hasBezel
              ? 'bg-white/15 text-text-primary'
              : 'text-text-muted hover:bg-white/8 hover:text-text-primary',
          )}
        >
          <Smartphone aria-hidden="true" className="size-4" />
          {t.device.bezel}
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="px-1 text-[13px] font-medium text-text-muted">{t.device.zoom}</span>
        <SegmentedChoice<string>
          label={t.device.zoom}
          value={zoomValue(viewport.zoom)}
          options={ZOOM_LEVELS.map((level) => ({
            value: zoomValue(level),
            label: level === 'fit' ? t.device.fit : `${level * 100}%`,
            icon: level === 'fit' ? Maximize2 : ZoomIn,
          }))}
          onChange={(value) => viewport.setZoom(zoomFrom(value))}
        />
      </div>
      <Select
        label={t.device.compare}
        value={viewport.compareId ?? NONE}
        options={[{ value: NONE, label: t.device.compareNone }, ...presetOptions]}
        onChange={(event) => viewport.setCompare(event.target.value || null)}
      />
      <Select
        label={t.device.locale}
        value={viewport.frameLocale ?? NONE}
        options={[
          { value: NONE, label: t.device.localeSame },
          ...LOCALES.map((locale) => ({ value: locale, label: t.locales[locale] })),
        ]}
        onChange={(event) => {
          const { value } = event.target;
          viewport.setFrameLocale(isLocale(value) ? value : null);
        }}
      />
      <BreakpointRuler width={width} t={t} />
    </div>
  );
}

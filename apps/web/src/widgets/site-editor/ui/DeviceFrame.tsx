import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn, useBodyScrollLock } from '@/shared/lib';
import { findPreset } from '../model/devicePresets';
import type { SiteEditorMessages } from '../model/messages';
import { useSiteEditorStore } from '../model/store';
import {
  EDITOR_ROOT_ATTRIBUTE,
  selectionOfTarget,
  type FrameTarget,
} from '../model/useCanvasTargets';
import { useDeviceFit } from '../model/useDeviceFit';
import { screenOf, useViewportStore } from '../model/viewport';
import { DeviceDock } from './DeviceDock';
import { DEVICE_BEZEL, DeviceScreen } from './DeviceScreen';

const GAP = 32;

interface DeviceFrameProps {
  isPanelOpen: boolean;
  t: SiteEditorMessages;
}

const openTarget = (target: FrameTarget) => {
  const { select, openStructure, setMode } = useSiteEditorStore.getState();
  setMode('edit');
  if (target.kind === 'section') openStructure({ sectionId: target.sectionId });
  else select(selectionOfTarget(target));
};

export function DeviceFrame({ isPanelOpen, t }: DeviceFrameProps) {
  const { pathname, search, hash } = useLocation();
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const [source] = useState(() => `${pathname}${search}${hash}`);
  const viewport = useViewportStore();
  const mode = useSiteEditorStore((state) => state.mode);
  const hasSelection = useSiteEditorStore(
    (state) => state.history.length > 0 || state.structure !== null,
  );
  useBodyScrollLock(true);

  const primary = screenOf(
    viewport.presetId,
    viewport.width,
    viewport.height,
    viewport.isRotated,
    t.device.custom,
  );
  const comparePreset = viewport.compareId ? findPreset(viewport.compareId) : undefined;
  const screens = comparePreset
    ? [
        primary,
        screenOf(
          comparePreset.id,
          comparePreset.width,
          comparePreset.height,
          viewport.isRotated,
          '',
        ),
      ]
    : [primary];
  const bezel = viewport.hasBezel ? DEVICE_BEZEL : 0;
  const fit = useDeviceFit(stage, screens, bezel + 8, GAP);
  const scale = viewport.zoom === 'fit' ? fit : viewport.zoom;
  const config = { isEditing: mode === 'edit', locale: viewport.frameLocale, hasSelection };

  return (
    <div
      {...{ [EDITOR_ROOT_ATTRIBUTE]: '' }}
      className={cn(
        'pointer-events-auto fixed inset-0 z-[2147483001] flex flex-col items-center gap-3 bg-bg-page px-4 pt-[124px] pb-3 xl:pt-4 xl:pr-[496px] xl:pb-4',
        isPanelOpen && 'lg:pr-[472px]',
      )}
    >
      <div
        ref={setStage}
        className={cn(
          'flex min-h-0 w-full flex-1',
          viewport.zoom === 'fit' ? 'overflow-hidden' : 'overflow-auto overscroll-contain',
        )}
      >
        {scale !== null && (
          <div style={{ gap: GAP }} className="m-auto flex items-start p-4">
            {screens.map((screen, index) => (
              <DeviceScreen
                key={`${index}:${screen.key}`}
                screen={screen}
                source={source}
                scale={scale}
                hasBezel={viewport.hasBezel}
                config={config}
                t={t}
                onTarget={openTarget}
                onResize={index === 0 && !comparePreset ? viewport.setCustomSize : undefined}
              />
            ))}
          </div>
        )}
      </div>
      <DeviceDock width={primary.width} t={t} />
    </div>
  );
}

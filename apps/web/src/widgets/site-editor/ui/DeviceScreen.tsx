import { useState, type PointerEvent as ReactPointerEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/shared/lib';
import type { SiteEditorMessages } from '../model/messages';
import type { FrameTarget } from '../model/useCanvasTargets';
import { EDITOR_FRAME_NAME, useFrameHost, type FrameConfig } from '../model/useFrameSync';
import type { ScreenSpec } from '../model/viewport';
import { DeviceCutout } from './DeviceCutout';

export const DEVICE_BEZEL = 12;

type ResizeAxis = 'x' | 'y' | 'xy';

interface DeviceScreenProps {
  screen: ScreenSpec;
  source: string;
  scale: number;
  hasBezel: boolean;
  config: FrameConfig;
  t: SiteEditorMessages;
  onTarget: (target: FrameTarget) => void;
  onResize?: (width: number, height: number) => void;
}

const HANDLE_CLASS =
  'absolute z-10 flex touch-none items-center justify-center rounded-full bg-white/20 hover:bg-viratec-cyan focus-visible:bg-viratec-cyan';

export function DeviceScreen({
  screen,
  source,
  scale,
  hasBezel,
  config,
  t,
  onTarget,
  onResize,
}: DeviceScreenProps) {
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);
  const [isLoaded, setLoaded] = useState(false);
  useFrameHost(frame, config, onTarget);
  const kind = screen.preset?.kind ?? (screen.width < 600 ? 'phone' : 'tablet');
  const bezel = hasBezel ? DEVICE_BEZEL : 0;

  const startResize = (axis: ResizeAxis) => (event: ReactPointerEvent<HTMLSpanElement>) => {
    if (!onResize) return;
    event.preventDefault();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    const start = {
      x: event.clientX,
      y: event.clientY,
      width: screen.width,
      height: screen.height,
    };
    const move = (next: PointerEvent) => {
      const dx = axis === 'y' ? 0 : ((next.clientX - start.x) * 2) / scale;
      const dy = axis === 'x' ? 0 : ((next.clientY - start.y) * 2) / scale;
      onResize(start.width + dx, start.height + dy);
    };
    const stop = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', stop);
      handle.removeEventListener('pointercancel', stop);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', stop);
    handle.addEventListener('pointercancel', stop);
  };

  return (
    <figure className="m-0 flex shrink-0 flex-col items-center gap-2">
      <div
        style={{ padding: bezel }}
        className={cn(
          'editor-pop-in relative shrink-0',
          hasBezel
            ? 'border border-white/15 bg-viratec-night shadow-overlay'
            : 'outline outline-1 outline-white/15',
          hasBezel &&
            (kind === 'phone'
              ? 'rounded-[44px]'
              : kind === 'tablet'
                ? 'rounded-[32px]'
                : 'rounded-[16px]'),
        )}
      >
        <div
          style={{ width: screen.width * scale, height: screen.height * scale }}
          className={cn(
            'relative overflow-hidden bg-bg-page',
            hasBezel &&
              (kind === 'phone'
                ? 'rounded-[32px]'
                : kind === 'tablet'
                  ? 'rounded-[20px]'
                  : 'rounded-[6px]'),
          )}
        >
          <iframe
            ref={setFrame}
            name={EDITOR_FRAME_NAME}
            src={source}
            title={t.device.frame(screen.name)}
            onLoad={() => setLoaded(true)}
            style={{ width: screen.width, height: screen.height, transform: `scale(${scale})` }}
            className={cn(
              'absolute top-0 left-0 max-w-none origin-top-left border-0 transition-opacity duration-200 motion-reduce:transition-none',
              isLoaded ? 'opacity-100' : 'opacity-0',
            )}
          />
          {hasBezel && screen.preset && (
            <DeviceCutout cutout={screen.preset.cutout} scale={scale} />
          )}
          {!isLoaded && (
            <span
              role="status"
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[14px] text-text-muted"
            >
              <LoaderCircle
                aria-hidden="true"
                className="size-6 text-viratec-cyan motion-safe:animate-spin"
              />
              {t.loading}
            </span>
          )}
        </div>
        {onResize && (
          <>
            <span
              aria-hidden="true"
              title={t.device.resize}
              onPointerDown={startResize('x')}
              className={cn(
                HANDLE_CLASS,
                'top-1/2 -right-4 h-12 w-1.5 -translate-y-1/2 cursor-ew-resize',
              )}
            />
            <span
              aria-hidden="true"
              title={t.device.resize}
              onPointerDown={startResize('y')}
              className={cn(
                HANDLE_CLASS,
                '-bottom-4 left-1/2 h-1.5 w-12 -translate-x-1/2 cursor-ns-resize',
              )}
            />
            <span
              aria-hidden="true"
              title={t.device.resize}
              onPointerDown={startResize('xy')}
              className={cn(HANDLE_CLASS, '-right-4 -bottom-4 size-3 cursor-nwse-resize')}
            />
          </>
        )}
      </div>
      <figcaption className="text-[12px] leading-4 text-text-muted tabular-nums">
        {screen.name} · {Math.round(screen.width)}×{Math.round(screen.height)}
        {scale < 1 && ` · ${Math.round(scale * 100)}%`}
      </figcaption>
    </figure>
  );
}

import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn, useBodyScrollLock } from '@/shared/lib';
import type { SiteEditorMessages } from '../model/messages';
import type { PreviewDevice } from '../model/store';
import { EDITOR_ROOT_ATTRIBUTE } from '../model/useCanvasTargets';
import { useDeviceFit } from '../model/useDeviceFit';
import { EDITOR_FRAME_NAME, useFrameHost } from '../model/useFrameSync';
import { DeviceDock } from './DeviceDock';

const DEVICE_SPEC = {
  tablet: {
    width: 768,
    height: 1024,
    bezel: 16,
    outerRadius: 'rounded-[36px]',
    radius: 'rounded-[20px]',
  },
  phone: {
    width: 375,
    height: 812,
    bezel: 12,
    outerRadius: 'rounded-[44px]',
    radius: 'rounded-[32px]',
  },
} as const;

interface DeviceFrameProps {
  device: Exclude<PreviewDevice, 'desktop'>;
  isPanelOpen: boolean;
  t: SiteEditorMessages;
}

export function DeviceFrame({ device, isPanelOpen, t }: DeviceFrameProps) {
  const { pathname, search, hash } = useLocation();
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const [isLoaded, setLoaded] = useState(false);
  const [source] = useState(() => `${pathname}${search}${hash}`);
  const spec = DEVICE_SPEC[device];
  const scale = useDeviceFit(stage, spec, spec.bezel);
  useFrameHost(frame);
  useBodyScrollLock(true);

  return (
    <div
      {...{ [EDITOR_ROOT_ATTRIBUTE]: '' }}
      className={cn(
        'pointer-events-auto fixed inset-0 z-[2147483001] flex flex-col items-center gap-3 bg-bg-page px-4 pt-[124px] pb-3 xl:pt-4 xl:pr-[496px] xl:pb-4',
        isPanelOpen && 'lg:pr-[472px]',
      )}
    >
      <div ref={setStage} className="flex min-h-0 w-full flex-1 items-center justify-center">
        {scale !== null && (
          <div
            style={{ padding: spec.bezel }}
            className={cn(
              'editor-pop-in relative shrink-0 border border-white/15 bg-viratec-night shadow-overlay',
              spec.outerRadius,
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'absolute start-1/2 top-[5px] -translate-x-1/2 rounded-full bg-white/20 rtl:translate-x-1/2',
                device === 'phone' ? 'h-[3px] w-12' : 'size-1.5',
              )}
            />
            <span
              aria-hidden="true"
              className={cn(
                'absolute -end-[3px] w-[3px] rounded-e-sm bg-white/20',
                device === 'phone' ? 'top-24 h-14' : 'top-10 h-10',
              )}
            />
            {device === 'phone' && (
              <span
                aria-hidden="true"
                className="absolute -start-[3px] top-20 h-8 w-[3px] rounded-s-sm bg-white/20"
              />
            )}
            <div
              style={{ width: spec.width * scale, height: spec.height * scale }}
              className={cn('relative overflow-hidden bg-bg-page', spec.radius)}
            >
              <iframe
                ref={setFrame}
                name={EDITOR_FRAME_NAME}
                src={source}
                title={t.device.frame(t.device[device])}
                onLoad={() => setLoaded(true)}
                style={{ width: spec.width, height: spec.height, transform: `scale(${scale})` }}
                className={cn(
                  'absolute top-0 left-0 max-w-none origin-top-left border-0 transition-opacity duration-200 motion-reduce:transition-none',
                  isLoaded ? 'opacity-100' : 'opacity-0',
                )}
              />
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
          </div>
        )}
      </div>
      <DeviceDock device={device} t={t} />
    </div>
  );
}

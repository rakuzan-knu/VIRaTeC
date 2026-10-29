import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/shared/lib';
import type { SiteEditorMessages } from '../model/messages';
import type { PreviewDevice } from '../model/store';
import { EDITOR_ROOT_ATTRIBUTE } from '../model/useCanvasTargets';
import { EDITOR_FRAME_NAME, useFrameHost } from '../model/useFrameSync';

const FRAME_WIDTH: Record<Exclude<PreviewDevice, 'desktop'>, string> = {
  tablet: 'w-[768px]',
  phone: 'w-[375px]',
};

interface DeviceFrameProps {
  device: Exclude<PreviewDevice, 'desktop'>;
  isPanelOpen: boolean;
  t: SiteEditorMessages;
}

export function DeviceFrame({ device, isPanelOpen, t }: DeviceFrameProps) {
  const { pathname, search, hash } = useLocation();
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);
  const [source] = useState(() => `${pathname}${search}${hash}`);
  useFrameHost(frame);

  return (
    <div
      {...{ [EDITOR_ROOT_ATTRIBUTE]: '' }}
      className={cn(
        'pointer-events-auto fixed inset-0 z-[2147483001] flex justify-center overflow-x-auto bg-bg-page px-4 pt-[124px] pb-4 xl:pt-[148px]',
        isPanelOpen && 'lg:pr-[472px]',
      )}
    >
      <iframe
        ref={setFrame}
        name={EDITOR_FRAME_NAME}
        src={source}
        title={t.device.frame(t.device[device])}
        className={cn(
          'h-full max-w-none shrink-0 rounded-[28px] border-8 border-white/10 bg-bg-page',
          FRAME_WIDTH[device],
        )}
      />
    </div>
  );
}

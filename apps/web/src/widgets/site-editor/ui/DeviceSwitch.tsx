import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { cn } from '@/shared/lib';
import { Tooltip } from '@/shared/ui/Tooltip';
import type { SiteEditorMessages } from '../model/messages';
import { useSiteEditorStore, type PreviewDevice } from '../model/store';
import { EDITOR_TOOLTIP_CLASS } from './IconButton';

const DEVICES = [
  ['desktop', Monitor],
  ['tablet', Tablet],
  ['phone', Smartphone],
] as const satisfies readonly (readonly [PreviewDevice, unknown])[];

export function DeviceSwitch({ t }: { t: SiteEditorMessages }) {
  const device = useSiteEditorStore((state) => state.device);
  const setDevice = useSiteEditorStore((state) => state.setDevice);

  return (
    <div
      role="radiogroup"
      aria-label={t.device.label}
      className="hidden rounded-xl bg-white/5 p-0.5 md:flex"
    >
      {DEVICES.map(([value, Icon]) => (
        <Tooltip
          key={value}
          text={t.device[value]}
          placement="bottom"
          floatingClassName={EDITOR_TOOLTIP_CLASS}
        >
          <button
            type="button"
            role="radio"
            aria-checked={device === value}
            aria-label={t.device[value]}
            onClick={() => setDevice(value)}
            className={cn(
              'inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus motion-reduce:transition-none',
              device === value
                ? 'bg-viratec-cyan text-viratec-ink'
                : 'text-text-muted hover:text-text-primary',
            )}
          >
            <Icon aria-hidden="true" className="size-4" />
          </button>
        </Tooltip>
      ))}
    </div>
  );
}

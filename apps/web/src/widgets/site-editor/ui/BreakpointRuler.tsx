import { cn } from '@/shared/lib';
import { BREAKPOINTS, activeBreakpoint } from '../model/devicePresets';
import type { SiteEditorMessages } from '../model/messages';

interface BreakpointRulerProps {
  width: number;
  t: SiteEditorMessages;
}

export function BreakpointRuler({ width, t }: BreakpointRulerProps) {
  const active = activeBreakpoint(width);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="px-1 text-[13px] font-medium text-text-muted">{t.device.breakpoint}</span>
      <ol className="m-0 flex list-none flex-wrap gap-1 p-0">
        {[{ name: 'base', width: 0 }, ...BREAKPOINTS].map((point) => {
          const isActive = point.name === active;
          const isReached = width >= point.width;
          return (
            <li
              key={point.name}
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'rounded-md border px-2 py-1 text-[12px] leading-4 tabular-nums',
                isActive
                  ? 'border-viratec-cyan bg-viratec-cyan/12 text-text-primary'
                  : isReached
                    ? 'border-white/12 text-text-muted'
                    : 'border-white/6 text-text-muted/60',
              )}
            >
              {point.name}
              {point.width > 0 && ` ≥${point.width}`}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

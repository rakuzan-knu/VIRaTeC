import type { ComponentType } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/shared/lib';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' }>;
}

interface SegmentedChoiceProps<T extends string> {
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  inMenu?: boolean;
  onChange: (value: T) => void;
}

const FOCUS_CLASS =
  'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-border-focus';

export function SegmentedChoice<T extends string>({
  label,
  options,
  value,
  inMenu = false,
  onChange,
}: SegmentedChoiceProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'grid gap-1.5',
        inMenu
          ? options.length === 3
            ? 'grid-cols-3'
            : 'grid-cols-2'
          : 'auto-cols-fr grid-flow-col rounded-xl bg-white/6 p-1',
      )}
    >
      {options.map(({ value: optionValue, label: optionLabel, icon: Icon }) => {
        const isSelected = optionValue === value;
        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
            {...(inMenu
              ? {
                  role: 'menuitemradio',
                  'aria-checked': isSelected,
                  'data-menu-item': '',
                  tabIndex: -1,
                }
              : { 'aria-pressed': isSelected })}
            className={cn(
              'relative flex cursor-pointer items-center justify-center text-center font-medium transition-colors motion-reduce:transition-none',
              FOCUS_CLASS,
              inMenu
                ? cn(
                    'min-h-[68px] flex-col gap-1.5 rounded-xl border px-1.5 py-2.5 text-[13px] leading-4',
                    isSelected
                      ? 'border-viratec-cyan bg-viratec-cyan/12 text-text-primary'
                      : 'border-white/10 bg-white/4 text-text-muted hover:border-white/20 hover:bg-white/8 hover:text-text-primary',
                  )
                : cn(
                    'h-9 gap-2 rounded-lg px-3 text-[13px] pointer-coarse:h-11',
                    isSelected
                      ? 'bg-white/15 text-text-primary'
                      : 'text-text-muted hover:bg-white/8 hover:text-text-primary',
                  ),
            )}
          >
            <Icon
              aria-hidden="true"
              className={cn('size-4 shrink-0', inMenu && isSelected && 'text-viratec-cyan')}
            />
            {optionLabel}
            {inMenu && isSelected && (
              <Check
                aria-hidden="true"
                className="absolute end-1.5 top-1.5 size-3.5 text-viratec-cyan"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

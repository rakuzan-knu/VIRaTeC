import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib';

interface ChipProps extends Omit<ComponentProps<'button'>, 'type'> {
  isActive: boolean;
}

export function Chip({ isActive, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      className={cn(
        'shrink-0 cursor-pointer rounded-full border px-[18px] py-2.5 text-[15px] leading-normal font-medium whitespace-nowrap transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime',
        isActive
          ? 'border-white bg-white text-viratec-ink'
          : 'border-white/22 bg-white/6 text-white hover:bg-white/12',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface ChipOption<TValue extends string> {
  value: TValue;
  label: string;
}

interface ChipGroupProps<TValue extends string> {
  label: string;
  options: readonly ChipOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  className?: string;
}

export function ChipGroup<TValue extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: ChipGroupProps<TValue>) {
  return (
    <div role="group" aria-label={label} className={cn('flex flex-wrap gap-2.5', className)}>
      {options.map((option) => (
        <Chip
          key={option.value}
          isActive={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  );
}

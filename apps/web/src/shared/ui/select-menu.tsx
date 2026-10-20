import { useCallback, useId, useRef, useState } from 'react';
import { cn, useDismiss } from '@/shared/lib';
import selectChevron from '@/shared/assets/icons/select-chevron.svg';

export interface SelectOption<TValue extends string> {
  value: TValue;
  label: string;
}

interface SelectMenuProps<TValue extends string> {
  label: string;
  options: readonly SelectOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  formatValue?: (option: SelectOption<TValue>) => string;
  className?: string;
}

export function SelectMenu<TValue extends string>({
  label,
  options,
  value,
  onChange,
  formatValue,
  className,
}: SelectMenuProps<TValue>) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const close = useCallback(() => setIsOpen(false), []);

  useDismiss(rootRef, isOpen, close);

  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-[14px] border border-white/14 bg-white/6 px-4 py-3 text-[15px] leading-normal whitespace-nowrap text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
      >
        {formatValue ? formatValue(selected) : selected.label}
        <img
          src={selectChevron}
          alt=""
          className={cn('transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>
      {isOpen && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute top-full right-0 z-30 mt-2 flex min-w-full flex-col gap-1 rounded-[14px] border border-white/14 bg-viratec-dropdown p-1.5 shadow-[0px_24px_60px_0px_rgba(0,5,26,0.55)]"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    close();
                  }}
                  className={cn(
                    'w-full cursor-pointer rounded-[10px] px-3 py-2.5 text-left text-[15px] whitespace-nowrap transition-colors hover:bg-white/7',
                    isSelected ? 'text-white' : 'text-viratec-muted',
                  )}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

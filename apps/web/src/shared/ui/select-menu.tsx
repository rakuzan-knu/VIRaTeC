import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
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
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const listId = useId();
  const close = useCallback(() => setIsOpen(false), []);

  useDismiss(rootRef, isOpen, close);

  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  );
  const selected = options[selectedIndex];

  useEffect(() => {
    if (isOpen) optionRefs.current[activeIndex]?.focus();
  }, [isOpen, activeIndex]);

  const open = (index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const closeAndFocusTrigger = () => {
    close();
    triggerRef.current?.focus();
  };

  const choose = (index: number) => {
    onChange(options[index].value);
    closeAndFocusTrigger();
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      open(selectedIndex);
    }
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const lastIndex = options.length - 1;
    const keyToIndex: Record<string, number> = {
      ArrowDown: Math.min(activeIndex + 1, lastIndex),
      ArrowUp: Math.max(activeIndex - 1, 0),
      Home: 0,
      End: lastIndex,
    };

    if (event.key in keyToIndex) {
      event.preventDefault();
      setActiveIndex(keyToIndex[event.key]);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(activeIndex);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeAndFocusTrigger();
    } else if (event.key === 'Tab') {
      close();
    }
  };

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => (isOpen ? close() : open(selectedIndex))}
        onKeyDown={handleTriggerKeyDown}
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
          onKeyDown={handleListKeyDown}
          className="absolute top-full right-0 z-30 mt-2 flex min-w-full flex-col gap-1 rounded-[14px] border border-white/14 bg-viratec-dropdown p-1.5 shadow-[0px_24px_60px_0px_rgba(0,5,26,0.55)]"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                role="option"
                aria-selected={isSelected}
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => choose(index)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  'w-full cursor-pointer rounded-[10px] px-3 py-2.5 text-left text-[15px] whitespace-nowrap transition-colors hover:bg-white/7 focus-visible:bg-white/7 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-viratec-lime',
                  isSelected ? 'text-white' : 'text-viratec-muted',
                )}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

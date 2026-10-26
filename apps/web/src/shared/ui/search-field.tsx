import { useRef, type ComponentProps, type KeyboardEvent } from 'react';
import { HOTKEYS, cn, useHotkey } from '@/shared/lib';
import searchIcon from '@/shared/assets/icons/search.svg';

interface SearchFieldProps extends Omit<ComponentProps<'input'>, 'type' | 'ref'> {
  containerClassName?: string;
}

export function SearchField({
  containerClassName,
  className,
  onKeyDown,
  ...props
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusSearch = () => {
    const input = inputRef.current;
    if (!input || input.getClientRects().length === 0) return false;
    input.focus();
    input.select();
  };

  useHotkey(HOTKEYS.search, focusSearch);
  useHotkey(HOTKEYS.searchMod, focusSearch);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.key === 'Escape' && !event.currentTarget.value) event.currentTarget.blur();
  };

  return (
    <label
      className={cn(
        'group flex items-center gap-2.5 rounded-[14px] border border-white/14 bg-white/6 px-4 py-3 focus-within:border-viratec-lime',
        containerClassName,
      )}
    >
      <img src={searchIcon} alt="" />
      <input
        ref={inputRef}
        type="search"
        aria-keyshortcuts={`${HOTKEYS.search.aria} ${HOTKEYS.searchMod.aria}`}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full min-w-0 bg-transparent text-[15px] leading-normal text-white outline-hidden placeholder:text-viratec-subtle',
          className,
        )}
        {...props}
      />
      <kbd
        aria-hidden="true"
        className="hidden shrink-0 rounded-md border border-white/14 px-1.5 font-sans text-xs leading-5 text-viratec-subtle pointer-fine:inline-block pointer-fine:group-focus-within:hidden"
      >
        {HOTKEYS.searchMod.label}
      </kbd>
    </label>
  );
}

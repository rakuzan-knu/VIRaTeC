import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib';
import searchIcon from '@/shared/assets/icons/search.svg';

interface SearchFieldProps extends Omit<ComponentProps<'input'>, 'type'> {
  containerClassName?: string;
}

export function SearchField({ containerClassName, className, ...props }: SearchFieldProps) {
  return (
    <label
      className={cn(
        'flex items-center gap-2.5 rounded-[14px] border border-white/14 bg-white/6 px-4 py-3 focus-within:border-viratec-lime',
        containerClassName,
      )}
    >
      <img src={searchIcon} alt="" />
      <input
        type="search"
        className={cn(
          'w-full min-w-0 bg-transparent text-[15px] leading-normal text-white outline-hidden placeholder:text-viratec-subtle',
          className,
        )}
        {...props}
      />
    </label>
  );
}

import { ComponentProps, forwardRef } from 'react';
import { cn } from '@/shared/lib';

export const Checkbox = forwardRef<HTMLInputElement, ComponentProps<'input'>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          'h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-500 cursor-pointer accent-slate-900',
          className,
        )}
        {...props}
      />
    );
  },
);
Checkbox.displayName = 'Checkbox';

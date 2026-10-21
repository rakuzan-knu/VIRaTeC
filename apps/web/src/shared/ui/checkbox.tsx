import { ComponentProps, forwardRef } from 'react';
import { cn } from '@/shared/lib';

export const Checkbox = forwardRef<HTMLInputElement, ComponentProps<'input'>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          'size-5 rounded border-auth-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auth-progress cursor-pointer accent-auth-navy',
          className,
        )}
        {...props}
      />
    );
  },
);
Checkbox.displayName = 'Checkbox';

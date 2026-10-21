import { ComponentProps, forwardRef } from 'react';
import { cn } from '@/shared/lib';

export interface InputProps extends ComponentProps<'input'> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={error || undefined}
        className={cn(
          'w-full h-11 px-3.5 py-2 text-sm bg-white border border-auth-border rounded-lg outline-none transition-all placeholder:text-auth-muted text-auth-heading',
          'focus:border-auth-progress focus:ring-1 focus:ring-auth-progress',
          error && 'border-auth-error focus:border-auth-error focus:ring-auth-error',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

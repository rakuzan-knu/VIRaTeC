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
        className={cn(
          'w-full h-11 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none transition-all placeholder:text-slate-400 text-slate-900',
          'focus:border-blue-600 focus:ring-1 focus:ring-blue-600',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

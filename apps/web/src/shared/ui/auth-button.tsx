import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/lib';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'primary', isLoading, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'w-full h-11 px-4 text-sm font-medium rounded-lg transition-[background-color,color,opacity] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed',
          variant === 'primary' && 'bg-auth-navy hover:bg-auth-navy-hover text-white shadow-sm',
          variant === 'outline' &&
            'bg-white hover:bg-auth-surface border border-auth-border text-auth-label',
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          children
        )}
      </button>
    );
  },
);
Button.displayName = 'Button';

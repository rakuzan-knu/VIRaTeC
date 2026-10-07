import { LoaderCircle } from 'lucide-react';
import { cn } from '../../lib';
import type { ButtonProps, ButtonSize, ButtonVariant } from './Button.types';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-lime text-text-on-lime hover:brightness-95 active:brightness-90',
  secondary:
    'border-control border-border-strong bg-bg-input text-text-primary hover:border-text-primary active:bg-bg-card',
};

const sizeClasses: Record<ButtonSize, string> = {
  lg: 'gap-3.5 rounded-control-lg px-button-lg-x py-4 text-control-lg',
  md: 'gap-2.5 rounded-control px-5 py-3 text-control-md',
};

const arrowClasses: Record<ButtonSize, string> = { lg: 'text-xl', md: 'text-lg' };

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  showArrow = false,
  type = 'button',
  className,
  disabled,
  loading = false,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'relative inline-flex max-w-full cursor-pointer items-center justify-center text-center font-medium transition-colors duration-150 motion-reduce:transition-none motion-reduce:duration-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      <span className={cn('min-w-0 wrap-anywhere', loading && 'opacity-0')}>{label}</span>
      {showArrow && (
        <span
          aria-hidden="true"
          className={cn(
            'shrink-0 font-normal',
            arrowClasses[size],
            'leading-none',
            loading && 'opacity-0',
          )}
        >
          →
        </span>
      )}
      {loading && (
        <LoaderCircle
          aria-hidden="true"
          className="absolute size-5 animate-spin motion-reduce:animate-none"
        />
      )}
    </button>
  );
}

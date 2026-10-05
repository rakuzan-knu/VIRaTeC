import type { ButtonProps, ButtonSize, ButtonVariant } from './Button.types';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-lime text-text-on-lime hover:brightness-95 active:brightness-90',
  secondary:
    'border-[1.5px] border-border-strong bg-bg-input text-text-primary hover:border-text-primary active:bg-bg-card',
};

const sizeClasses: Record<ButtonSize, string> = {
  lg: 'gap-3 rounded-control-lg px-6 py-3.5 text-lg',
  md: 'gap-2.5 rounded-control px-5 py-2.5 text-base',
};

const arrowClasses: Record<ButtonSize, string> = {
  lg: 'text-xl',
  md: 'text-lg',
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  showArrow = false,
  type = 'button',
  className = '',
  ...rest
}: ButtonProps) {
  const baseClasses =
    'inline-flex cursor-pointer items-center justify-center font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:pointer-events-none disabled:opacity-50';

  const combinedClasses =
    `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

  return (
    <button type={type} className={combinedClasses} {...rest}>
      <span>{label}</span>
      {showArrow && (
        <span aria-hidden="true" className={`font-normal leading-none ${arrowClasses[size]}`}>
          →
        </span>
      )}
    </button>
  );
}

import type { ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/shared/lib';

type LinkButtonVariant = 'primary' | 'secondary';
type LinkButtonSize = 'md' | 'lg';

interface LinkButtonStyleOptions {
  variant?: LinkButtonVariant;
  size?: LinkButtonSize;
  className?: string;
}

export function linkButtonClassName({
  variant = 'primary',
  size = 'lg',
  className,
}: LinkButtonStyleOptions) {
  return cn(
    'inline-flex items-center justify-center whitespace-nowrap font-medium leading-normal transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime',
    size === 'lg' &&
      'gap-2.5 rounded-2xl py-4 text-[17px] lg:gap-3.5 lg:rounded-[18px] lg:px-[26px] lg:text-lg',
    size === 'md' && 'gap-2.5 rounded-[14px] px-5 py-3 text-base',
    variant === 'primary' && 'bg-viratec-lime text-viratec-ink hover:bg-viratec-lime-hover',
    variant === 'secondary' &&
      'border-[1.5px] border-white/35 bg-white/6 text-white hover:bg-white/12',
    className,
  );
}

interface ArrowProps {
  size?: LinkButtonSize;
  className?: string;
}

export function ButtonArrow({ size = 'lg', className }: ArrowProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('font-normal', size === 'lg' ? 'text-lg lg:text-xl' : 'text-lg', className)}
    >
      →
    </span>
  );
}

export interface LinkButtonProps extends LinkProps {
  variant?: LinkButtonVariant;
  size?: LinkButtonSize;
  arrowClassName?: string;
  showArrow?: boolean;
  children: ReactNode;
}

export function LinkButton({
  variant,
  size = 'lg',
  className,
  arrowClassName,
  showArrow = true,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={linkButtonClassName({ variant, size, className })} {...props}>
      {children}
      {showArrow && <ButtonArrow size={size} className={arrowClassName} />}
    </Link>
  );
}

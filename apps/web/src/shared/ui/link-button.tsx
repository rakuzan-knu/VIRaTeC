import type { ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/shared/lib';

type LinkButtonVariant = 'primary' | 'secondary' | 'ink';
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
    'group/button inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium leading-normal tracking-[-0.01em]',
    'transition-[background-color,border-color,color,transform] duration-200 ease-apple active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime',
    size === 'lg' && 'gap-2.5 px-7 py-4 text-[17px] lg:gap-3 lg:px-[30px] lg:text-lg',
    size === 'md' && 'gap-2 px-5 py-3 text-base',
    variant === 'primary' && 'bg-viratec-lime text-viratec-ink hover:bg-viratec-lime-hover',
    variant === 'secondary' &&
      'border-[1.5px] border-white/22 bg-white/4 text-white hover:border-white/40 hover:bg-white/10',
    variant === 'ink' &&
      'bg-viratec-ink text-white hover:bg-viratec-deep focus-visible:outline-viratec-ink',
    className,
  );
}

interface ArrowProps {
  size?: LinkButtonSize;
  className?: string;
}

export function ButtonArrow({ size = 'lg', className }: ArrowProps) {
  return (
    <ArrowRight
      aria-hidden="true"
      strokeWidth={2}
      className={cn(
        'shrink-0 transition-transform duration-200 ease-apple group-hover/button:translate-x-0.5 motion-reduce:transition-none',
        size === 'lg' ? 'size-[18px] lg:size-5' : 'size-[18px]',
        className,
      )}
    />
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
  showArrow = variant !== 'secondary',
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

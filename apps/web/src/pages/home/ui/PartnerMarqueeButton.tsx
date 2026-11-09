import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';

interface PartnerMarqueeButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}

export function PartnerMarqueeButton({
  label,
  onClick,
  className,
  children,
}: PartnerMarqueeButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/22 bg-white/4 text-white transition-colors hover:border-white/40 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime',
        className,
      )}
    >
      {children}
    </button>
  );
}

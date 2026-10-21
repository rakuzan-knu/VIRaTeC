import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';
import { NOT_AVAILABLE_YET } from '@/shared/config/navigation';

interface OptionalLinkProps {
  href: string | null;
  label: string;
  className?: string;
  unavailableClassName?: string;
  children: ReactNode;
}

export function OptionalLink({
  href,
  label,
  className,
  unavailableClassName,
  children,
}: OptionalLinkProps) {
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={`${label} (opens in new tab)`}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <span
      role="img"
      aria-label={`${label}: ${NOT_AVAILABLE_YET}`}
      title={NOT_AVAILABLE_YET}
      className={cn(className, 'cursor-not-allowed opacity-45', unavailableClassName)}
    >
      {children}
    </span>
  );
}

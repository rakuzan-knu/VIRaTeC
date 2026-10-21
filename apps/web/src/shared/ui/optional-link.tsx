import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';
import { useCommonMessages } from '@/shared/i18n';

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
  const common = useCommonMessages();

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={common.opensInNewTab(label)}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <span
      role="img"
      aria-label={common.unavailable(label)}
      title={common.notAvailableYet}
      className={cn(className, 'cursor-not-allowed opacity-45', unavailableClassName)}
    >
      {children}
    </span>
  );
}

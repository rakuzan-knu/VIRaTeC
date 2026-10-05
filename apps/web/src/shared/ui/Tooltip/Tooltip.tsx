import { useId } from 'react';
import type { TooltipProps } from './Tooltip.types';

export function Tooltip({
  text,
  placement = 'top',
  children,
  className = '',
  ...rest
}: TooltipProps) {
  const id = useId();
  const isTop = placement === 'top';

  const positionClasses = isTop ? 'bottom-full mb-1 flex-col' : 'top-full mt-1 flex-col-reverse';
  const arrowRotateClass = isTop ? 'rotate-180' : '';

  const wrapperClasses = `group relative inline-flex ${className}`.trim();
  const tooltipClasses = `pointer-events-none absolute left-1/2 z-10 flex -translate-x-1/2 items-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 ${positionClasses}`;

  return (
    <span className={wrapperClasses} aria-describedby={id} {...rest}>
      {children}
      <span id={id} role="tooltip" className={tooltipClasses}>
        <span className="rounded-tooltip bg-bg-tooltip px-3 py-2 text-sm font-medium whitespace-nowrap text-text-on-light">
          {text}
        </span>
        <svg
          aria-hidden="true"
          className={`h-1.5 w-3.5 text-bg-tooltip ${arrowRotateClass}`.trim()}
          viewBox="0 0 14 6"
        >
          <path d="M0 6L7 0l7 6z" fill="currentColor" />
        </svg>
      </span>
    </span>
  );
}

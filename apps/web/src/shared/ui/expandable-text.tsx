import { useId, useState } from 'react';
import { cn } from '@/shared/lib';

interface ExpandableTextProps {
  children: string;
  className?: string;
}

export function ExpandableText({ children, className }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const textId = useId();

  return (
    <>
      <p id={textId} className={cn(!isExpanded && 'line-clamp-3 lg:line-clamp-none', className)}>
        {children}
      </p>
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={textId}
        onClick={() => setIsExpanded((value) => !value)}
        className="cursor-pointer text-sm leading-5 font-medium text-viratec-cyan lg:hidden"
      >
        {isExpanded ? 'Show less ↑' : 'Read more ↓'}
      </button>
    </>
  );
}

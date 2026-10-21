import { ArrowRight } from 'lucide-react';
import { cn } from '@/shared/lib';

interface CardLinkLabelProps {
  label: string;
  className?: string;
}

const TRAILING_ARROW = /\s*→\s*$/;

export function CardLinkLabel({ label, className }: CardLinkLabelProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      {label.replace(TRAILING_ARROW, '')}
      <ArrowRight
        aria-hidden="true"
        className="size-4 shrink-0 transition-transform duration-200 ease-apple group-hover/card:translate-x-0.5 motion-reduce:transition-none"
      />
    </span>
  );
}

import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';
import { Eyebrow } from './eyebrow';

interface SectionHeaderProps {
  id?: string;
  eyebrow?: string;
  title: string;
  accent?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({
  id,
  eyebrow,
  title,
  accent,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10',
        className,
      )}
    >
      <div className="flex flex-col gap-3.5 lg:gap-5">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2
          id={id}
          className="text-[30px] leading-9 tracking-[-0.9px] text-white lg:text-5xl lg:leading-[54px] lg:tracking-[-1.44px]"
        >
          {title}
          {accent && (
            <>
              <br />
              <span className="text-viratec-cyan">{accent}</span>
            </>
          )}
        </h2>
      </div>
      {description && (
        <p className="text-base leading-6 text-viratec-muted lg:w-[460px] lg:shrink-0 lg:text-lg lg:leading-7">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

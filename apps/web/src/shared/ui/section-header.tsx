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
        'flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-16',
        className,
      )}
    >
      <div className="flex max-w-[820px] flex-col gap-3 lg:gap-4">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2
          id={id}
          className="font-display text-[34px] leading-[38px] font-medium tracking-[-0.03em] text-white lg:text-[56px] lg:leading-[60px]"
        >
          {title}
          {accent && (
            <>
              {' '}
              <span className="text-white/50">{accent}</span>
            </>
          )}
        </h2>
      </div>
      {description && (
        <p className="max-w-[60ch] text-base leading-[26px] text-viratec-muted lg:w-[440px] lg:shrink-0 lg:text-lg lg:leading-[29px]">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

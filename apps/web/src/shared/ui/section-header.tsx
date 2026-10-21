import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';
import { Eyebrow } from './eyebrow';
import { SplitWords, countWords } from './split-words';

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
    <div className={cn('@container', className)}>
      <div className="grid gap-4 @4xl:grid-cols-[minmax(0,220px)_minmax(0,1fr)] @4xl:gap-x-14">
        {eyebrow && (
          <div className="@4xl:pt-[18px]">
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
        )}
        <div className="flex max-w-[920px] min-w-0 flex-col gap-5 @4xl:col-start-2 lg:gap-6">
          <h2
            id={id}
            className="font-display text-[36px] leading-[40px] font-medium tracking-[-0.035em] text-white lg:text-[64px] lg:leading-[66px]"
          >
            <SplitWords text={title} />
            {accent && (
              <>
                {' '}
                <span className="text-white/50">
                  <SplitWords text={accent} offset={countWords(title)} />
                </span>
              </>
            )}
          </h2>
          {description && (
            <p className="max-w-[60ch] text-base leading-[26px] text-viratec-muted lg:text-lg lg:leading-[29px]">
              {description}
            </p>
          )}
          {action && <div className="flex">{action}</div>}
        </div>
      </div>
    </div>
  );
}

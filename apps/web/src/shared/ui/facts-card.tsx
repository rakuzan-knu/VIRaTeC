import { Fragment, type ReactNode } from 'react';
import { cn } from '@/shared/lib';

export interface Fact {
  label: string;
  value: string;
}

interface FactsCardProps {
  title: string;
  facts: Fact[];
  actions?: ReactNode;
  className?: string;
}

export function FactsCard({ title, facts, actions, className }: FactsCardProps) {
  return (
    <aside
      className={cn(
        'flex flex-col gap-6 rounded-[28px] border border-white/10 bg-white/[0.035] p-6 lg:w-[380px] lg:shrink-0 lg:p-8',
        className,
      )}
    >
      <h2 className="font-display text-[22px] leading-7 font-medium tracking-[-0.02em] text-white">
        {title}
      </h2>
      <dl className="flex flex-col gap-5">
        {facts.map((fact, index) => (
          <Fragment key={fact.label}>
            {index > 0 && <span aria-hidden="true" className="h-px w-full bg-white/8" />}
            <div className="flex flex-col gap-1">
              <dt className="text-[13px] leading-[18px] text-viratec-subtle">{fact.label}</dt>
              <dd className="text-base leading-6 text-viratec-soft">{fact.value}</dd>
            </div>
          </Fragment>
        ))}
      </dl>
      {actions}
    </aside>
  );
}

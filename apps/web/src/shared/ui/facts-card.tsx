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
        'flex flex-col gap-5 rounded-[22px] border border-white/12 bg-white/5 p-6 lg:w-[380px] lg:shrink-0 lg:p-7',
        className,
      )}
    >
      <h2 className="text-[22px] leading-7 font-medium text-white">{title}</h2>
      <dl className="flex flex-col gap-5">
        {facts.map((fact, index) => (
          <Fragment key={fact.label}>
            {index > 0 && <span aria-hidden="true" className="h-px w-full bg-white/10" />}
            <div className="flex flex-col gap-1">
              <dt className="text-xs leading-4 tracking-[1.44px] text-viratec-subtle uppercase">
                {fact.label}
              </dt>
              <dd className="text-base leading-6 text-viratec-soft">{fact.value}</dd>
            </div>
          </Fragment>
        ))}
      </dl>
      {actions}
    </aside>
  );
}

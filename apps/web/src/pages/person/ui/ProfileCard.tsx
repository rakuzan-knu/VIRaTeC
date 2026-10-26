import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';

const CARD_CLASS = 'rounded-[28px] border border-white/10 bg-viratec-deep/80 p-6 lg:p-8';
export function ProfileCard({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(CARD_CLASS, className)}>
      <h2 className="mb-4 flex items-center gap-2.5 font-display text-lg leading-6 font-medium tracking-[-0.01em] text-white">
        <span className="text-viratec-accent">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

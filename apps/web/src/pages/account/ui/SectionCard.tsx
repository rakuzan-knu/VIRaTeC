import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';
import { CARD_CLASS, SUBHEADING_CLASS } from './styles';

export function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={CARD_CLASS}>
      <h3 className={cn(SUBHEADING_CLASS, 'mb-5')}>{title}</h3>
      {children}
    </section>
  );
}

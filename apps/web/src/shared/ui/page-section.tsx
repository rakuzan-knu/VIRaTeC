import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib';

export type SectionTone = 'base' | 'surface' | 'none';

interface PageSectionProps extends ComponentProps<'section'> {
  tone?: SectionTone;
  containerClassName?: string;
}

const TONE_CLASS: Record<SectionTone, string> = {
  base: 'bg-viratec-bg',
  surface: 'bg-viratec-surface',
  none: '',
};

export function PageSection({
  tone = 'base',
  className,
  containerClassName,
  children,
  ...props
}: PageSectionProps) {
  return (
    <section className={cn(TONE_CLASS[tone], className)} {...props}>
      <div
        className={cn(
          'mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-16 lg:gap-12 lg:px-[85px] lg:py-28',
          containerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}

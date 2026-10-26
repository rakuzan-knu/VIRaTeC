import { createContext, useContext, type ComponentProps } from 'react';
import { cn } from '@/shared/lib';

export type SectionTone = 'base' | 'surface' | 'none';

const SectionToneContext = createContext<SectionTone | null>(null);

export const SectionToneProvider = SectionToneContext.Provider;

interface PageSectionProps extends ComponentProps<'section'> {
  tone?: SectionTone;
  containerClassName?: string;
}

const TONE_CLASS: Record<SectionTone, string> = {
  base: '',
  surface: 'field-divider',
  none: '',
};

export function PageSection({
  tone = 'base',
  className,
  containerClassName,
  children,
  ...props
}: PageSectionProps) {
  const orderedTone = useContext(SectionToneContext);
  return (
    <section className={cn(TONE_CLASS[orderedTone ?? tone], className)} {...props}>
      <div
        className={cn(
          'mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-20 lg:gap-14 lg:px-[85px] lg:py-32',
          containerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}

import { cn } from '@/shared/lib';
import { ButtonArrow, LinkButton, linkButtonClassName } from './link-button';
import type { SectionTone } from './page-section';

export interface CtaAction {
  label: string;
  to?: string;
  href?: string;
}

interface CtaSectionProps {
  title: string;
  description: string;
  action: CtaAction;
  tone?: SectionTone;
  className?: string;
}

const TONE_CLASS: Record<SectionTone, string> = {
  base: 'bg-viratec-bg',
  surface: 'bg-viratec-surface',
  none: '',
};

export function CtaSection({
  title,
  description,
  action,
  tone = 'base',
  className,
}: CtaSectionProps) {
  const buttonClass = 'w-full lg:w-auto lg:shrink-0';
  const buttonVariant = 'ink';

  return (
    <section className={cn(TONE_CLASS[tone], className)}>
      <div className="mx-auto max-w-[1440px] px-5 pt-2 pb-20 lg:px-[85px] lg:pt-6 lg:pb-32">
        <div className="flex flex-col gap-8 rounded-[28px] bg-viratec-paper px-6 py-9 text-viratec-ink lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:rounded-[40px] lg:px-16 lg:py-16">
          <div className="flex max-w-[720px] flex-col gap-3 lg:gap-4">
            <h2 className="font-display text-[30px] leading-[34px] font-medium tracking-[-0.03em] lg:text-[52px] lg:leading-[56px]">
              {title}
            </h2>
            <p className="text-base leading-[26px] text-viratec-graphite lg:text-lg lg:leading-[29px]">
              {description}
            </p>
          </div>
          {action.href ? (
            <a
              href={action.href}
              className={linkButtonClassName({ variant: buttonVariant, className: buttonClass })}
            >
              {action.label}
              <ButtonArrow />
            </a>
          ) : (
            <LinkButton to={action.to ?? '/'} variant={buttonVariant} className={buttonClass}>
              {action.label}
            </LinkButton>
          )}
        </div>
      </div>
    </section>
  );
}

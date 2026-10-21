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
  base: '',
  surface: '',
  none: '',
};

export function CtaSection({
  title,
  description,
  action,
  tone = 'base',
  className,
}: CtaSectionProps) {
  const buttonClass = 'relative w-full lg:w-auto lg:shrink-0';
  const buttonVariant = 'primary';

  return (
    <section className={cn(TONE_CLASS[tone], className)}>
      <div className="mx-auto max-w-[1440px] px-5 pt-2 pb-20 lg:px-[85px] lg:pt-6 lg:pb-32">
        <div className="atlas-card atlas-cta relative flex flex-col gap-8 overflow-hidden rounded-[28px] px-6 py-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:rounded-[40px] lg:px-16 lg:py-20">
          <svg
            aria-hidden="true"
            viewBox="-100 -100 200 200"
            fill="none"
            className="atlas-cta-orbits text-viratec-cyan"
          >
            <circle r="96" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.4" />
            <ellipse rx="96" ry="34" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.4" />
            <ellipse rx="34" ry="96" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.4" />
            <ellipse
              rx="96"
              ry="52"
              transform="rotate(-28)"
              stroke="currentColor"
              strokeOpacity="0.25"
              strokeWidth="0.4"
            />
            <ellipse
              rx="70"
              ry="96"
              transform="rotate(22)"
              stroke="currentColor"
              strokeOpacity="0.2"
              strokeWidth="0.4"
            />
            <circle cx="64" cy="49" r="2.2" fill="var(--color-viratec-lime)" />
            <circle cx="86" cy="-18" r="1.6" fill="currentColor" />
            <circle cx="22" cy="91" r="1.6" fill="currentColor" />
          </svg>
          <div className="relative flex max-w-[720px] flex-col gap-3 lg:gap-5">
            <h2 className="font-display text-[32px] leading-[36px] font-medium tracking-[-0.035em] text-white lg:text-[60px] lg:leading-[62px]">
              {title}
            </h2>
            <p className="text-base leading-[26px] text-viratec-soft lg:text-lg lg:leading-[29px]">
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

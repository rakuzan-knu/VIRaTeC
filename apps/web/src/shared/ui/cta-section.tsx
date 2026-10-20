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

  return (
    <section className={cn(TONE_CLASS[tone], className)}>
      <div className="mx-auto max-w-[1440px] px-5 pt-2 pb-[72px] lg:px-[85px] lg:pt-6 lg:pb-[120px]">
        <div className="flex flex-col gap-6 rounded-[26px] bg-[linear-gradient(129.68deg,#0a2f73_0%,#0b5f9e_43.8%,#2fbf8f_72.99%)] px-[22px] py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:rounded-[30px] lg:bg-[linear-gradient(169.41deg,#0a2f73_0%,#0b5f9e_42.86%,#2fbf8f_71.43%)] lg:px-14 lg:py-12">
          <div className="flex flex-col gap-2.5">
            <h2 className="text-[28px] leading-[34px] tracking-[-0.56px] text-white lg:text-[40px] lg:leading-[46px] lg:tracking-[-0.8px]">
              {title}
            </h2>
            <p className="text-base leading-6 text-viratec-soft lg:text-lg lg:leading-[26px]">
              {description}
            </p>
          </div>
          {action.href ? (
            <a href={action.href} className={linkButtonClassName({ className: buttonClass })}>
              {action.label}
              <ButtonArrow />
            </a>
          ) : (
            <LinkButton to={action.to ?? '/'} className={buttonClass}>
              {action.label}
            </LinkButton>
          )}
        </div>
      </div>
    </section>
  );
}

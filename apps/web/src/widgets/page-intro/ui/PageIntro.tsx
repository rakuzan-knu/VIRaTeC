import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';
import { Eyebrow } from '@/shared/ui/eyebrow';
import { SiteHeader } from '@/widgets/site-header';
import contactGlow from '@/shared/assets/icons/contact-glow.svg';

export type PageIntroTone = 'blue' | 'teal' | 'glow';

interface PageIntroProps {
  breadcrumb?: string[];
  eyebrow?: string;
  title: string;
  accent?: string;
  description: string;
  tone?: PageIntroTone;
  descriptionClassName?: string;
  className?: string;
  children?: ReactNode;
}

const TONE_CLASS: Record<PageIntroTone, string> = {
  blue: 'bg-[linear-gradient(160.92deg,#03122e_0%,#051b40_50%,#0b5aa8_83.33%)] lg:bg-[linear-gradient(151.52deg,#03122e_7.14%,#051b40_50%,#0b5aa8_78.57%)]',
  teal: 'bg-[linear-gradient(160.92deg,#03122e_0%,#051b40_50%,#138a8a_83.33%)] lg:bg-[linear-gradient(148.53deg,#03122e_7.14%,#051b40_50%,#138a8a_78.57%)]',
  glow: 'bg-viratec-bg',
};

export function PageIntro({
  breadcrumb,
  eyebrow,
  title,
  accent,
  description,
  tone = 'blue',
  descriptionClassName,
  className,
  children,
}: PageIntroProps) {
  return (
    <div className={cn('relative overflow-hidden', TONE_CLASS[tone])}>
      {tone === 'glow' && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-[120px] left-[45%] h-[420px] w-[560px] lg:left-[57%] lg:h-[560px] lg:w-[760px]"
        >
          <div className="absolute inset-x-[-10.53%] inset-y-[-14.29%]">
            <img src={contactGlow} alt="" className="block size-full max-w-none" />
          </div>
        </div>
      )}

      <SiteHeader className="relative z-20 mx-auto max-w-[1440px]" />

      <div
        className={cn(
          'relative z-10 mx-auto flex max-w-[1440px] flex-col items-start gap-[18px] px-5 pt-10 pb-11 lg:gap-6 lg:px-[85px] lg:pt-[72px] lg:pb-[88px]',
          className,
        )}
      >
        {breadcrumb && (
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center text-[13px] text-viratec-subtle lg:text-sm">
              {breadcrumb.map((item, index) => (
                <li key={item} className="flex items-center">
                  {index > 0 && (
                    <span aria-hidden="true" className="px-2">
                      /
                    </span>
                  )}
                  <span aria-current={index === breadcrumb.length - 1 ? 'page' : undefined}>
                    {item}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="text-[40px] leading-[44px] tracking-[-1.2px] text-white lg:text-[72px] lg:leading-[78px] lg:tracking-[-2.16px]">
          {title}
          {accent && (
            <>
              <br />
              <span className="text-viratec-cyan">{accent}</span>
            </>
          )}
        </h1>
        <p
          className={cn(
            'text-[17px] leading-[26px] text-viratec-muted lg:max-w-[760px] lg:text-xl lg:leading-8',
            descriptionClassName,
          )}
        >
          {description}
        </p>
        {children}
      </div>
    </div>
  );
}

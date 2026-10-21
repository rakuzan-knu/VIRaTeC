import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib';
import { Eyebrow } from '@/shared/ui/eyebrow';
import { SiteHeader } from '@/widgets/site-header';
import contactGlow from '@/shared/assets/icons/contact-glow.svg';

export type PageIntroTone = 'blue' | 'teal' | 'glow';

export type BreadcrumbItem = string | { label: string; to: string };

interface PageIntroProps {
  breadcrumb?: BreadcrumbItem[];
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
  blue: 'bg-viratec-bg bg-[radial-gradient(120%_90%_at_100%_100%,rgba(11,90,168,0.55)_0%,rgba(5,27,64,0.4)_45%,transparent_75%)]',
  teal: 'bg-viratec-bg bg-[radial-gradient(120%_90%_at_100%_100%,rgba(19,138,138,0.5)_0%,rgba(5,27,64,0.4)_45%,transparent_75%)]',
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

      <SiteHeader />

      <div
        className={cn(
          'relative z-10 mx-auto flex max-w-[1440px] flex-col items-start gap-5 px-5 pt-12 pb-14 lg:gap-7 lg:px-[85px] lg:pt-[120px] lg:pb-[112px]',
          className,
        )}
      >
        {breadcrumb && (
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center text-[13px] text-viratec-subtle lg:text-sm">
              {breadcrumb.map((item, index) => (
                <li key={typeof item === 'string' ? item : item.to} className="flex items-center">
                  {index > 0 && (
                    <span aria-hidden="true" className="px-2">
                      /
                    </span>
                  )}
                  {typeof item === 'string' ? (
                    <span aria-current={index === breadcrumb.length - 1 ? 'page' : undefined}>
                      {item}
                    </span>
                  ) : (
                    <Link
                      to={item.to}
                      className="rounded underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="max-w-[1080px] font-display text-[44px] leading-[46px] font-medium tracking-[-0.035em] text-white lg:text-[88px] lg:leading-[88px]">
          {title}
          {accent && (
            <>
              <br />
              <span className="text-white/50">{accent}</span>
            </>
          )}
        </h1>
        <p
          className={cn(
            'max-w-[62ch] text-[17px] leading-[27px] text-viratec-muted lg:max-w-[720px] lg:text-[21px] lg:leading-[33px]',
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

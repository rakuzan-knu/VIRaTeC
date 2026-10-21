import type { CSSProperties } from 'react';
import { ROUTES } from '@/shared/config/routes';
import { LinkButton } from '@/shared/ui/link-button';
import { SiteHeader } from '@/widgets/site-header';
import glowTop from '../assets/glow-top.svg';
import glowBottom from '../assets/glow-bottom.svg';
import { Eyebrow } from '@/shared/ui/eyebrow';
import { ExpandableText } from '@/shared/ui/expandable-text';
import { HeroBackgroundVideo } from './HeroBackgroundVideo';
import { PartnerNetwork } from './PartnerNetwork';

const HERO_BUTTON_CLASS = 'w-full lg:w-auto lg:min-w-[220px] lg:px-8 lg:py-[18px] lg:text-[19px]';
const HERO_REVEAL_CLASS = 'motion-safe:animate-hero-reveal motion-reduce:animate-hero-fade';

function revealDelay(ms: number): CSSProperties {
  return { animationDelay: `${ms}ms` };
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(140.73deg,#03122e_0%,#051b40_45.83%,#094285_83.33%)] lg:bg-[linear-gradient(110.26deg,#03122e_0%,#051b40_63%,#094285_100%)]">
      <div aria-hidden="true" className="pointer-events-none lg:hidden">
        <div className="absolute top-[-80px] left-[120px] size-[420px] motion-safe:animate-hero-drift">
          <div className="absolute inset-[-14.29%]">
            <img src={glowTop} alt="" className="block size-full max-w-none" />
          </div>
        </div>
        <div
          className="absolute top-[420px] left-[-160px] h-[380px] w-[420px] motion-safe:animate-hero-drift"
          style={{ animationDelay: '-7s', animationDirection: 'alternate-reverse' }}
        >
          <div className="absolute inset-x-[-14.29%] inset-y-[-15.79%]">
            <img src={glowBottom} alt="" className="block size-full max-w-none" />
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 motion-safe:animate-hero-settle motion-reduce:animate-hero-fade">
        <HeroBackgroundVideo />
      </div>

      <SiteHeader />

      <div className="hero-scroll-out relative z-10 mx-auto flex max-w-[1440px] flex-col gap-6 px-5 pt-14 pb-12 lg:min-h-[max(820px,calc(100svh-88px))] lg:gap-8 lg:px-[85px] lg:pt-[104px] lg:pb-16">
        <div className={HERO_REVEAL_CLASS} style={revealDelay(150)}>
          <Eyebrow>Virtual Innovative Research &amp; Technology Community</Eyebrow>
        </div>

        <h1 className="font-display text-[42px] leading-[44px] font-medium tracking-[-0.035em] text-viratec-light lg:text-[96px] lg:leading-[94px] lg:tracking-[-0.045em]">
          <span className={`inline-block ${HERO_REVEAL_CLASS}`} style={revealDelay(300)}>
            Where ambitious minds
          </span>
          <br />
          <span className={`inline-block ${HERO_REVEAL_CLASS}`} style={revealDelay(450)}>
            <span className="hero-shimmer-text animate-hero-shimmer">move research forward.</span>
          </span>
        </h1>

        <ExpandableText
          className={`${HERO_REVEAL_CLASS} [animation-delay:650ms]! max-w-[62ch] text-[17px] leading-[27px] text-viratec-muted lg:max-w-[720px] lg:text-[22px] lg:leading-[34px] lg:tracking-[-0.01em]`}
        >
          A global academic and industry community at Taras Shevchenko National University of Kyiv,
          connecting students, educators and researchers through AI, EdTech and international
          collaboration.
        </ExpandableText>

        <div
          className={`flex flex-col gap-3 lg:flex-row lg:gap-4 ${HERO_REVEAL_CLASS}`}
          style={revealDelay(800)}
        >
          <LinkButton to={ROUTES.RESEARCH_AREAS} className={HERO_BUTTON_CLASS}>
            Our Research
          </LinkButton>
          <LinkButton to={ROUTES.CONTACT} variant="secondary" className={HERO_BUTTON_CLASS}>
            Collaborate
          </LinkButton>
        </div>

        <div className="mt-6 lg:mt-auto">
          <PartnerNetwork />
        </div>
      </div>
    </section>
  );
}

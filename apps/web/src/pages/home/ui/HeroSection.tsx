import { useRef, type CSSProperties } from 'react';
import { ROUTES } from '@/shared/config/routes';
import { usePauseOffscreen } from '@/shared/lib';
import { LinkButton } from '@/shared/ui/link-button';
import { SiteHeader } from '@/widgets/site-header';
import glowTop from '../assets/glow-top.svg';
import glowBottom from '../assets/glow-bottom.svg';
import { Eyebrow } from '@/shared/ui/eyebrow';
import { ExpandableText } from '@/shared/ui/expandable-text';
import { HeroBackgroundVideo } from './HeroBackgroundVideo';
import { PartnerNetwork } from './PartnerNetwork';
import { useHomeContent } from '../model/content';

const HERO_BUTTON_CLASS =
  'w-full lg:w-auto lg:min-w-[220px] lg:px-8 lg:py-[clamp(12px,2svh,18px)] lg:text-[clamp(17px,2.4svh,19px)]';
const HERO_REVEAL_CLASS = 'motion-safe:animate-hero-reveal motion-reduce:animate-hero-fade';
const HERO_TEXT_CLASS = 'motion-safe:animate-hero-rise motion-reduce:animate-hero-fade';

function revealDelay(ms: number): CSSProperties {
  return { animationDelay: `${ms}ms` };
}

export function HeroSection() {
  const { hero } = useHomeContent();
  const glowsRef = useRef<HTMLDivElement>(null);
  usePauseOffscreen(glowsRef);

  return (
    <section className="relative overflow-hidden hero-backdrop lg:hero-backdrop-wide">
      <div
        ref={glowsRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 lg:hidden"
      >
        <div className="absolute top-[-80px] left-[120px] size-[420px] motion-safe:animate-hero-drift">
          <div className="absolute inset-[-14.29%]">
            <img src={glowTop} alt="" className="block size-full max-w-none" />
          </div>
        </div>
        <div className="absolute top-[420px] left-[-160px] h-[380px] w-[420px] motion-safe:animate-hero-drift-reverse">
          <div className="absolute inset-x-[-14.29%] inset-y-[-15.79%]">
            <img src={glowBottom} alt="" className="block size-full max-w-none" />
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 motion-safe:animate-hero-settle motion-reduce:animate-hero-fade">
        <HeroBackgroundVideo />
      </div>

      <SiteHeader />

      <div className="hero-scroll-out relative z-10 mx-auto flex max-w-[1440px] flex-col gap-6 px-5 pt-14 pb-12 lg:min-h-[calc(100svh-64px)] lg:gap-[clamp(12px,2svh,32px)] lg:px-[85px] lg:pt-[clamp(20px,3svh,104px)] lg:pb-[clamp(16px,2.5svh,64px)] xl:min-h-[calc(100svh-88px)]">
        <div className={HERO_REVEAL_CLASS} style={revealDelay(150)}>
          <Eyebrow>{hero.eyebrow}</Eyebrow>
        </div>

        <h1 className="font-display text-[42px] leading-[44px] font-medium tracking-[-0.035em] text-viratec-light lg:text-[clamp(56px,9svh,96px)] lg:leading-[0.98] lg:tracking-[-0.045em]">
          <span className={`inline-block ${HERO_TEXT_CLASS}`} style={revealDelay(300)}>
            {hero.titleLine}
          </span>
          <br />
          <span className={`inline-block ${HERO_TEXT_CLASS}`} style={revealDelay(450)}>
            <span className="hero-shimmer-text lg:animate-hero-shimmer">{hero.titleAccent}</span>
          </span>
        </h1>

        <ExpandableText
          className={`${HERO_TEXT_CLASS} [animation-delay:650ms]! max-w-[62ch] text-[17px] leading-[27px] text-viratec-muted lg:max-w-[760px] lg:text-[clamp(18px,2.7svh,22px)] lg:leading-[1.55] lg:tracking-[-0.01em]`}
        >
          {hero.description}
        </ExpandableText>

        <div
          className={`flex flex-col gap-3 lg:flex-row lg:gap-4 ${HERO_REVEAL_CLASS}`}
          style={revealDelay(800)}
        >
          <LinkButton to={ROUTES.RESEARCH_AREAS} className={HERO_BUTTON_CLASS}>
            {hero.researchAction}
          </LinkButton>
          <LinkButton to={ROUTES.CONTACT} variant="secondary" className={HERO_BUTTON_CLASS}>
            {hero.collaborateAction}
          </LinkButton>
        </div>

        <div className="mt-6 lg:mt-auto">
          <PartnerNetwork />
        </div>
      </div>
    </section>
  );
}

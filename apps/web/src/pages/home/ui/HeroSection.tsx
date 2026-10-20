import { ROUTES } from '@/shared/config/routes';
import { LinkButton } from '@/shared/ui/link-button';
import { SiteHeader } from '@/widgets/site-header';
import glowTop from '../assets/glow-top.svg';
import glowBottom from '../assets/glow-bottom.svg';
import { PARTNERS } from '../model/content';
import { Eyebrow } from '@/shared/ui/eyebrow';
import { ExpandableText } from '@/shared/ui/expandable-text';
import { HeroBackgroundVideo } from './HeroBackgroundVideo';

const HERO_BUTTON_CLASS =
  'w-full lg:h-20 lg:w-[286px] lg:gap-[25px] lg:rounded-[27px] lg:px-1.5 lg:text-[22px] lg:font-normal';
const HERO_ARROW_CLASS = 'lg:text-[29px] lg:leading-[29px]';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(140.73deg,#03122e_0%,#051b40_45.83%,#094285_83.33%)] lg:bg-[linear-gradient(110.26deg,#03122e_0%,#051b40_63%,#094285_100%)]">
      <div aria-hidden="true" className="pointer-events-none lg:hidden">
        <div className="absolute top-[-80px] left-[120px] size-[420px]">
          <div className="absolute inset-[-14.29%]">
            <img src={glowTop} alt="" className="block size-full max-w-none" />
          </div>
        </div>
        <div className="absolute top-[420px] left-[-160px] h-[380px] w-[420px]">
          <div className="absolute inset-x-[-14.29%] inset-y-[-15.79%]">
            <img src={glowBottom} alt="" className="block size-full max-w-none" />
          </div>
        </div>
      </div>
      <HeroBackgroundVideo />

      <SiteHeader className="relative z-20 mx-auto max-w-[1440px]" />

      <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-6 px-5 pt-14 pb-12 lg:min-h-[884px] lg:gap-[31.4px] lg:px-[85px] lg:pt-[113px] lg:pb-[70px]">
        <Eyebrow>Virtual Innovative Research &amp; Technology Community</Eyebrow>

        <h1 className="text-[34px] leading-[38px] tracking-[-1.02px] text-viratec-light lg:text-[80px] lg:leading-[84.8px] lg:tracking-[-4px]">
          Where ambitious minds
          <br />
          <span className="text-viratec-cyan">move research forward.</span>
        </h1>

        <ExpandableText className="text-[17px] leading-[26px] text-viratec-muted lg:max-w-[820px] lg:pt-[5.6px] lg:pb-[11.6px] lg:text-2xl lg:leading-[37.2px] lg:tracking-[-0.3px]">
          A global academic and industry community at Taras Shevchenko National University of Kyiv,
          connecting students, educators and researchers through AI, EdTech and international
          collaboration.
        </ExpandableText>

        <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
          <LinkButton
            to={ROUTES.RESEARCH_AREAS}
            className={`${HERO_BUTTON_CLASS} lg:shadow-[0px_8px_0px_0px_rgba(69,110,77,0.6),0px_0px_34px_0px_rgba(119,235,142,0.47)]`}
            arrowClassName={HERO_ARROW_CLASS}
          >
            Our Research
          </LinkButton>
          <LinkButton
            to={ROUTES.CONTACT}
            variant="secondary"
            className={HERO_BUTTON_CLASS}
            arrowClassName={HERO_ARROW_CLASS}
          >
            Collaborate
          </LinkButton>
        </div>

        <div className="mt-6 flex flex-col items-center gap-8 lg:mt-auto lg:items-start lg:gap-[18px]">
          <p className="text-[11px] font-medium tracking-[1.98px] text-viratec-accent uppercase lg:text-xs lg:tracking-[2.16px]">
            In collaboration with
          </p>
          <ul className="grid w-full grid-cols-2 gap-x-3 gap-y-9 lg:flex lg:items-center lg:justify-between">
            {PARTNERS.map((partner) => (
              <li
                key={partner.name}
                className="flex h-[60px] items-center justify-center gap-2 lg:h-auto lg:gap-3"
              >
                <img
                  src={partner.logo}
                  alt={partner.caption ? '' : partner.name}
                  loading="lazy"
                  className={`object-contain ${partner.logoClassName}`}
                />
                {partner.caption && (
                  <span className="text-xs leading-[15px] font-medium whitespace-nowrap text-white/88 lg:text-[15px] lg:leading-[18px]">
                    {partner.caption[0]}
                    <br />
                    {partner.caption[1]}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

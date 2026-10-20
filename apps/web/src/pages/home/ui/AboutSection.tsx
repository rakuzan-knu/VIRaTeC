import { ROUTES } from '@/shared/config/routes';
import { LinkButton } from '@/shared/ui/link-button';
import { PILLARS, STATS } from '../model/content';
import { Eyebrow } from '@/shared/ui/eyebrow';
import { ExpandableText } from '@/shared/ui/expandable-text';
import { CARD_CLASS, SECTION_CONTAINER_CLASS, SECTION_TITLE_CLASS } from './styles';

export function AboutSection() {
  return (
    <section aria-labelledby="about-title" className="bg-viratec-bg">
      <div className={SECTION_CONTAINER_CLASS}>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-20">
          <div className="flex flex-col items-start gap-8 lg:flex-1 lg:gap-7">
            <Eyebrow>About VIRaTeC</Eyebrow>
            <h2 id="about-title" className={SECTION_TITLE_CLASS}>
              Research that crosses
              <br />
              <span className="text-viratec-cyan">borders and disciplines.</span>
            </h2>
            <ExpandableText className="text-[17px] leading-[26px] text-viratec-muted lg:text-xl lg:leading-8">
              Since 2019 VIRaTeC has been building inclusive virtual environments where students
              from different countries work together on joint projects and research using AI, EdTech
              and COIL.
            </ExpandableText>
            <LinkButton
              to={ROUTES.ABOUT_INITIATIVE}
              variant="secondary"
              className="hidden lg:inline-flex"
            >
              Learn More
            </LinkButton>
          </div>

          <ul className="flex flex-col gap-3 lg:flex-1 lg:gap-4">
            {PILLARS.map((pillar) => (
              <li key={pillar.index} className={`${CARD_CLASS} gap-3 lg:gap-3.5`}>
                <p className="flex items-center gap-3 font-medium lg:gap-4">
                  <span className="text-[13px] tracking-[1.3px] text-viratec-cyan lg:text-sm lg:tracking-[1.4px]">
                    {pillar.index}
                  </span>
                  <span className="text-[19px] text-white lg:text-[22px]">{pillar.title}</span>
                </p>
                <p className="text-[15px] leading-[22px] text-viratec-muted lg:text-base lg:leading-6">
                  {pillar.description}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <LinkButton to={ROUTES.ABOUT_INITIATIVE} variant="secondary" className="w-full lg:hidden">
          Learn More
        </LinkButton>

        <ul className="flex flex-col lg:flex-row lg:gap-6">
          {STATS.map((stat) => (
            <li
              key={stat.value}
              className="flex items-center gap-4 border-t border-white/14 py-[18px] lg:flex-1 lg:flex-col lg:items-start lg:gap-1.5 lg:pt-6 lg:pb-0"
            >
              <p className="w-[72px] shrink-0 text-[40px] leading-[44px] tracking-[-0.8px] text-viratec-accent lg:w-auto lg:text-[56px] lg:leading-[64px] lg:tracking-[-1.12px]">
                {stat.value}
              </p>
              <p className="text-[15px] leading-[22px] text-viratec-muted lg:text-base lg:leading-6">
                {stat.label}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

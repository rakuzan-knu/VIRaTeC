import { ROUTES } from '@/shared/config/routes';
import { LinkButton } from '@/shared/ui/link-button';
import { useHomeContent } from '../model/content';
import { Eyebrow } from '@/shared/ui/eyebrow';
import { ExpandableText } from '@/shared/ui/expandable-text';
import { SECTION_CONTAINER_CLASS, SECTION_TITLE_CLASS } from './styles';
import { SplitWords, countWords } from '@/shared/ui/split-words';
import { CountUp } from '@/shared/ui/count-up';

export function AboutSection() {
  const { about } = useHomeContent();

  return (
    <section aria-labelledby="about-title">
      <div className={SECTION_CONTAINER_CLASS}>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-24">
          <div className="flex flex-col items-start gap-5 lg:sticky lg:top-32 lg:flex-1 lg:gap-7">
            <Eyebrow>{about.eyebrow}</Eyebrow>
            <h2 id="about-title" className={SECTION_TITLE_CLASS}>
              <SplitWords text={about.title} />{' '}
              <span className="text-white/50">
                <SplitWords text={about.titleAccent} offset={countWords(about.title)} />
              </span>
            </h2>
            <ExpandableText className="max-w-[60ch] text-[17px] leading-[27px] text-viratec-muted lg:text-xl lg:leading-8">
              {about.description}
            </ExpandableText>
            <LinkButton
              to={ROUTES.ABOUT_INITIATIVE}
              variant="secondary"
              className="mt-2 hidden lg:inline-flex"
            >
              {about.action}
            </LinkButton>
          </div>

          <ul className="flex flex-col border-b border-white/10 lg:flex-1">
            {about.pillars.map((pillar) => (
              <li
                key={pillar.index}
                className="flex flex-col gap-2.5 border-t border-white/10 py-7 lg:gap-3 lg:py-10"
              >
                <h3 className="font-display text-[24px] leading-[30px] font-medium tracking-[-0.02em] text-white lg:text-[32px] lg:leading-[38px]">
                  {pillar.title}
                </h3>
                <p className="max-w-[48ch] text-[15px] leading-[23px] text-viratec-muted lg:text-[17px] lg:leading-[27px]">
                  {pillar.description}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <LinkButton to={ROUTES.ABOUT_INITIATIVE} variant="secondary" className="w-full lg:hidden">
          {about.action}
        </LinkButton>

        <dl className="grid gap-px overflow-hidden rounded-[24px] border border-white/10 bg-white/10 lg:grid-cols-3 lg:rounded-[28px]">
          {about.stats.map((stat) => (
            <div
              key={stat.value}
              className="flex items-center gap-5 bg-viratec-bg px-6 py-6 lg:flex-col lg:items-start lg:gap-3 lg:px-8 lg:py-9"
            >
              <dt className="order-2 text-[15px] leading-[22px] text-viratec-muted lg:text-base lg:leading-6">
                {stat.label}
              </dt>
              <dd className="order-1 w-[84px] shrink-0 font-display text-[44px] leading-[48px] font-medium tracking-[-0.04em] text-white tabular-nums lg:w-auto lg:text-[72px] lg:leading-[72px]">
                <CountUp value={stat.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';
import { LinkButton } from '@/shared/ui/link-button';
import { useLocalized } from '@/shared/i18n';
import { HOME_CONTENT } from '../model/content';
import { Eyebrow } from '@/shared/ui/eyebrow';
import { ExpandableText } from '@/shared/ui/expandable-text';
import {
  CARD_CLASS,
  CARD_LINK_CLASS,
  SECTION_CONTAINER_CLASS,
  SECTION_TITLE_CLASS,
} from './styles';
import { SplitWords } from '@/shared/ui/split-words';
import { trackSpotlight } from '@/shared/lib';
import { CountUp } from '@/shared/ui/count-up';

export function ResearchSection() {
  const { research } = useLocalized(HOME_CONTENT);

  return (
    <section aria-labelledby="research-title" className="bg-viratec-deep">
      <div className={SECTION_CONTAINER_CLASS}>
        <div className="flex items-end justify-between gap-10">
          <div className="flex flex-col gap-4 lg:gap-5">
            <Eyebrow>{research.eyebrow}</Eyebrow>
            <h2 id="research-title" className={SECTION_TITLE_CLASS}>
              <SplitWords text={research.title} />
            </h2>
          </div>
          <LinkButton to={ROUTES.PROJECTS} className="hidden lg:inline-flex">
            {research.action}
          </LinkButton>
        </div>

        <ul className="grid gap-4 lg:grid-cols-3 lg:gap-5">
          {research.projects.map((project) => (
            <li key={project.title}>
              <Link
                to={project.to}
                onPointerMove={trackSpotlight}
                className={`${CARD_CLASS} ${CARD_LINK_CLASS} h-full gap-4 lg:min-h-[400px] lg:gap-5`}
              >
                <h3 className="font-display text-[26px] leading-[30px] font-medium tracking-[-0.025em] text-white lg:text-[34px] lg:leading-[38px]">
                  {project.title}
                </h3>
                <p className="text-[15px] leading-[23px] text-viratec-muted lg:text-base lg:leading-[26px]">
                  {project.description}
                </p>
                <span className="mt-auto flex items-center justify-between pt-4 text-[15px] font-medium text-viratec-cyan lg:text-base">
                  {research.cardAction}
                  <span
                    aria-hidden="true"
                    className="flex size-10 items-center justify-center rounded-full border border-white/14 text-white transition-colors duration-200 group-hover/card:border-viratec-lime group-hover/card:bg-viratec-lime group-hover/card:text-viratec-ink"
                  >
                    <ArrowRight className="size-[18px]" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-6 rounded-[28px] border border-white/10 bg-viratec-bg px-6 py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:rounded-[36px] lg:px-14 lg:py-14">
          <div className="flex flex-col gap-3.5 lg:max-w-[640px] lg:gap-4">
            <h3 className="font-display text-[28px] leading-[34px] font-medium tracking-[-0.025em] text-white lg:text-[40px] lg:leading-[46px]">
              {research.highlightTitle}
            </h3>
            <ExpandableText className="text-[15px] leading-[23px] text-viratec-muted lg:text-lg lg:leading-7">
              {research.highlightDescription}
            </ExpandableText>
          </div>
          <dl className="flex gap-10 border-t border-white/10 pt-6 whitespace-nowrap lg:shrink-0 lg:gap-14 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
            {research.highlightNumbers.map((item) => (
              <div key={item.value} className="flex flex-col gap-1">
                <dt className="order-2 text-[13px] text-viratec-muted lg:text-[15px]">
                  {item.label}
                </dt>
                <dd className="order-1 font-display text-[40px] leading-[44px] font-medium tracking-[-0.03em] text-viratec-accent tabular-nums lg:text-[56px] lg:leading-[60px]">
                  <CountUp value={item.value} />
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <LinkButton to={ROUTES.PROJECTS} className="w-full lg:hidden">
          {research.action}
        </LinkButton>
      </div>
    </section>
  );
}

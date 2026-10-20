import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/config/routes';
import { LinkButton } from '@/shared/ui/link-button';
import { PROJECTS, RESEARCH_HIGHLIGHT_NUMBERS } from '../model/content';
import { Eyebrow } from '@/shared/ui/eyebrow';
import { ExpandableText } from '@/shared/ui/expandable-text';
import {
  CARD_CLASS,
  CARD_LINK_CLASS,
  SECTION_CONTAINER_CLASS,
  SECTION_TITLE_CLASS,
} from './styles';

export function ResearchSection() {
  return (
    <section aria-labelledby="research-title" className="bg-viratec-surface">
      <div className={SECTION_CONTAINER_CLASS}>
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-8 lg:gap-6">
            <Eyebrow>Research &amp; Projects</Eyebrow>
            <h2 id="research-title" className={SECTION_TITLE_CLASS}>
              What we work on
            </h2>
          </div>
          <LinkButton to={ROUTES.PROJECTS} className="hidden lg:inline-flex">
            View All Projects
          </LinkButton>
        </div>

        <ul className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          {PROJECTS.map((project) => (
            <li key={project.title}>
              <Link
                to={project.to}
                className={`${CARD_CLASS} ${CARD_LINK_CLASS} h-full gap-3.5 lg:min-h-[434px] lg:gap-[18px]`}
              >
                <span
                  aria-hidden="true"
                  className="h-[150px] w-full rounded-xl bg-linear-to-r from-[#0a3d8f] to-[rgba(27,212,223,0.55)] lg:h-[180px] lg:rounded-[14px]"
                />
                <h3 className="text-[21px] leading-[26px] font-medium text-white lg:text-2xl lg:leading-[30px]">
                  {project.title}
                </h3>
                <p className="text-[15px] leading-[22px] text-viratec-muted lg:text-base lg:leading-6">
                  {project.description}
                </p>
                <span className="text-[15px] font-medium text-viratec-cyan lg:mt-auto lg:text-base">
                  Explore →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3.5 rounded-[22px] bg-[linear-gradient(146.23deg,#0b3f8a_0%,#138a8a_71.43%)] px-[22px] py-[26px] lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:rounded-[28px] lg:bg-linear-to-r lg:from-[#0b3f8a] lg:to-[#138a8a] lg:px-12 lg:py-11">
          <div className="flex flex-col gap-3.5 lg:max-w-[680px] lg:gap-4">
            <h3 className="text-[26px] leading-8 tracking-[-0.52px] text-white lg:text-[34px] lg:leading-[42px] lg:tracking-[-0.68px]">
              Students don’t just join research — they lead it.
            </h3>
            <ExpandableText className="text-[15px] leading-[23px] text-viratec-soft lg:text-lg lg:leading-7 lg:text-viratec-muted">
              Master’s students of the Faculty of Information Technologies initiated and delivered
              the first intercontinental author’s research project in Ukrainian higher education.
            </ExpandableText>
          </div>
          <ul className="flex gap-8 pt-1.5 whitespace-nowrap lg:gap-14 lg:pt-0">
            {RESEARCH_HIGHLIGHT_NUMBERS.map((item) => (
              <li key={item.value} className="flex flex-col gap-0.5">
                <p className="text-[34px] leading-10 text-viratec-accent lg:text-[44px] lg:leading-[50px]">
                  {item.value}
                </p>
                <p className="text-[13px] text-viratec-soft lg:text-[15px] lg:text-viratec-muted">
                  {item.label}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <LinkButton to={ROUTES.PROJECTS} className="w-full lg:hidden">
          View All Projects
        </LinkButton>
      </div>
    </section>
  );
}

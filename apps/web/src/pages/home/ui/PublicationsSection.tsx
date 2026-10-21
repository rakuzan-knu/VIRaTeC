import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/shared/lib';
import { ROUTES } from '@/shared/config/routes';
import { LinkButton } from '@/shared/ui/link-button';
import { PUBLICATIONS } from '../model/content';
import { Eyebrow } from '@/shared/ui/eyebrow';
import { SECTION_CONTAINER_CLASS, SECTION_TITLE_CLASS } from './styles';

const PAPER_CARD_CLASS =
  'group/card flex h-full flex-col gap-4 rounded-[24px] border bg-white p-6 transition-colors duration-200 hover:border-viratec-paper-line-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-ink lg:min-h-[300px] lg:gap-5 lg:rounded-[28px] lg:p-8';

export function PublicationsSection() {
  return (
    <section aria-labelledby="publications-title" className="bg-viratec-paper text-viratec-ink">
      <div className={SECTION_CONTAINER_CLASS}>
        <div className="flex items-end justify-between gap-10">
          <div className="flex flex-col gap-4 lg:gap-5">
            <Eyebrow className="text-auth-success">Publications &amp; Media</Eyebrow>
            <h2 id="publications-title" className={cn(SECTION_TITLE_CLASS, 'text-viratec-ink')}>
              Latest from VIRaTeC
            </h2>
          </div>
          <LinkButton to={ROUTES.PUBLICATIONS} variant="ink" className="hidden lg:inline-flex">
            All Publications
          </LinkButton>
        </div>

        <ul className="grid gap-4 lg:grid-cols-3 lg:gap-5">
          {PUBLICATIONS.map((publication) => (
            <li key={publication.title}>
              <Link
                to={publication.to}
                className={cn(
                  PAPER_CARD_CLASS,
                  publication.isUpcoming
                    ? 'border-dashed border-viratec-paper-line-strong'
                    : 'border-viratec-paper-line',
                )}
              >
                <span className="text-[13px] font-medium text-viratec-graphite tabular-nums lg:text-sm">
                  {publication.year}
                </span>
                <h3
                  className={cn(
                    'font-display text-[22px] leading-[28px] font-medium tracking-[-0.02em] lg:text-[26px] lg:leading-[32px]',
                    publication.isUpcoming ? 'text-viratec-ink/55' : 'text-viratec-ink',
                  )}
                >
                  {publication.title}
                </h3>
                <p className="text-sm leading-[21px] text-viratec-graphite lg:text-[15px] lg:leading-[23px]">
                  {publication.source}
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[15px] font-medium text-auth-navy lg:text-base">
                  Read more
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-200 group-hover/card:translate-x-0.5 motion-reduce:transition-none"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <LinkButton to={ROUTES.PUBLICATIONS} variant="ink" className="w-full lg:hidden">
          All Publications
        </LinkButton>
      </div>
    </section>
  );
}

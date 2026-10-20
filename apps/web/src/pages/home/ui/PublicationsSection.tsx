import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib';
import { ROUTES } from '@/shared/config/routes';
import { LinkButton } from '@/shared/ui/link-button';
import { PUBLICATIONS } from '../model/content';
import { Eyebrow } from '@/shared/ui/eyebrow';
import {
  CARD_CLASS,
  CARD_LINK_CLASS,
  SECTION_CONTAINER_CLASS,
  SECTION_TITLE_CLASS,
} from './styles';

export function PublicationsSection() {
  return (
    <section aria-labelledby="publications-title" className="bg-viratec-bg">
      <div className={SECTION_CONTAINER_CLASS}>
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-8 lg:gap-6">
            <Eyebrow>Publications &amp; Media</Eyebrow>
            <h2 id="publications-title" className={SECTION_TITLE_CLASS}>
              Latest from VIRaTeC
            </h2>
          </div>
          <LinkButton
            to={ROUTES.PUBLICATIONS}
            variant="secondary"
            className="hidden lg:inline-flex"
          >
            All Publications
          </LinkButton>
        </div>

        <ul className="grid gap-3.5 lg:grid-cols-3 lg:gap-6">
          {PUBLICATIONS.map((publication) => (
            <li key={publication.title}>
              <Link
                to={publication.to}
                className={cn(
                  CARD_CLASS,
                  CARD_LINK_CLASS,
                  'h-full gap-3.5 lg:min-h-[288px] lg:gap-5',
                  publication.isUpcoming && 'border-dashed bg-white/2',
                )}
              >
                <span className="text-[13px] text-viratec-subtle lg:text-sm">
                  {publication.year}
                </span>
                <h3
                  className={cn(
                    'text-[19px] leading-[26px] font-medium lg:text-[22px] lg:leading-[30px]',
                    publication.isUpcoming ? 'text-white/55' : 'text-white',
                  )}
                >
                  {publication.title}
                </h3>
                <p className="text-sm text-viratec-subtle lg:text-[15px]">{publication.source}</p>
                <span className="text-[15px] font-medium text-viratec-cyan lg:mt-auto lg:text-base">
                  Read more →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <LinkButton to={ROUTES.PUBLICATIONS} variant="secondary" className="w-full lg:hidden">
          All Publications
        </LinkButton>
      </div>
    </section>
  );
}

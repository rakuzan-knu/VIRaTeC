import { Link } from 'react-router-dom';
import { buildPublicationPath } from '@/shared/config/routes';
import { MediaPlaceholder } from '@/shared/ui/media-placeholder';
import type { Publication } from '../model/types';

interface PublicationCardProps {
  publication: Publication;
}

const CARD_LINK_CLASS =
  'transition-colors hover:border-white/25 hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime';

export function PublicationCard({ publication }: PublicationCardProps) {
  return (
    <Link
      to={buildPublicationPath(publication.slug)}
      className={`flex h-full flex-col gap-3.5 rounded-[18px] border border-white/12 bg-white/5 p-5 lg:min-h-[254px] lg:rounded-[22px] lg:p-7 ${CARD_LINK_CLASS}`}
    >
      <span className="text-[13px] text-viratec-subtle">{publication.year}</span>
      <h3 className="text-[19px] leading-[26px] font-medium text-white lg:text-[21px] lg:leading-7">
        {publication.title}
      </h3>
      <p className="text-sm text-viratec-subtle">{publication.source}</p>
      <span className="mt-auto pt-1 text-[15px] font-medium text-viratec-cyan">
        {publication.linkLabel}
      </span>
    </Link>
  );
}

export function FeaturedPublicationCard({ publication }: PublicationCardProps) {
  return (
    <Link
      to={buildPublicationPath(publication.slug)}
      className={`flex flex-col gap-6 rounded-[22px] border border-white/12 bg-white/5 p-5 lg:flex-row lg:items-center lg:gap-10 lg:rounded-[26px] lg:py-6 lg:pr-10 lg:pl-6 ${CARD_LINK_CLASS}`}
    >
      <MediaPlaceholder className="h-[190px] rounded-[14px] lg:h-80 lg:w-[560px] lg:rounded-[18px]" />
      <div className="flex flex-col gap-3.5">
        <span className="text-[13px] text-viratec-subtle lg:text-sm">{publication.year}</span>
        <h2 className="text-2xl leading-[30px] font-medium tracking-[-0.24px] text-white lg:text-[34px] lg:leading-[42px] lg:tracking-[-0.34px]">
          {publication.title}
        </h2>
        <p className="text-[15px] leading-[23px] text-viratec-muted lg:text-[17px] lg:leading-[27px]">
          {publication.excerpt}
        </p>
        <p className="text-sm text-viratec-subtle">{publication.source}</p>
        <span className="text-base font-medium text-viratec-cyan">{publication.linkLabel}</span>
      </div>
    </Link>
  );
}

interface RelatedPublicationCardProps {
  publication: Publication;
}

export function RelatedPublicationCard({ publication }: RelatedPublicationCardProps) {
  return (
    <Link
      to={buildPublicationPath(publication.slug)}
      className={`flex h-full flex-col gap-3.5 rounded-[22px] border border-white/12 bg-white/5 p-5 lg:min-h-[409px] lg:p-7 ${CARD_LINK_CLASS}`}
    >
      <MediaPlaceholder className="h-[150px] rounded-xl lg:h-[170px] lg:rounded-[14px]" />
      <h3 className="text-xl leading-[26px] font-medium text-white lg:text-[22px] lg:leading-7">
        {publication.title}
      </h3>
      <p className="text-[15px] leading-[22px] text-viratec-muted lg:text-base lg:leading-6">
        {publication.excerpt}
      </p>
      <span className="mt-auto pt-1 text-[15px] font-medium text-viratec-cyan">Read more →</span>
    </Link>
  );
}

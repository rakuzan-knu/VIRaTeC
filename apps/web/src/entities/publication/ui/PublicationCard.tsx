import { Link } from 'react-router-dom';
import { buildPublicationPath } from '@/shared/config/routes';
import { CardLinkLabel } from '@/shared/ui/card-link-label';
import { MediaPlaceholder } from '@/shared/ui/media-placeholder';
import { usePublicationLabels } from '../model/data';
import type { Publication } from '../model/types';

interface PublicationCardProps {
  publication: Publication;
}

const CARD_LINK_CLASS =
  'group/card transition-colors duration-200 hover:border-white/22 hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime';

export function PublicationCard({ publication }: PublicationCardProps) {
  return (
    <Link
      to={buildPublicationPath(publication.slug)}
      className={`flex h-full flex-col gap-4 rounded-[24px] border border-white/10 bg-white/[0.035] p-6 lg:min-h-[254px] lg:rounded-[28px] lg:p-8 ${CARD_LINK_CLASS}`}
    >
      <span className="text-[13px] text-viratec-subtle">{publication.year}</span>
      <h3 className="font-display text-xl leading-[26px] font-medium tracking-[-0.02em] text-white lg:text-[22px] lg:leading-7">
        {publication.title}
      </h3>
      <p className="text-sm text-viratec-subtle">{publication.source}</p>
      <CardLinkLabel
        label={publication.linkLabel}
        className="mt-auto pt-1 text-[15px] font-medium text-viratec-cyan"
      />
    </Link>
  );
}

export function FeaturedPublicationCard({ publication }: PublicationCardProps) {
  const labels = usePublicationLabels();

  return (
    <Link
      to={buildPublicationPath(publication.slug)}
      className={`flex flex-col gap-6 rounded-[28px] border border-white/10 bg-white/[0.035] p-5 lg:flex-row lg:items-center lg:gap-12 lg:rounded-[36px] lg:py-6 lg:pr-12 lg:pl-6 ${CARD_LINK_CLASS}`}
    >
      <MediaPlaceholder
        src={publication.image}
        label={labels.type[publication.type]}
        sizes="(min-width: 1024px) 560px, 100vw"
        className="h-[190px] rounded-[14px] lg:h-80 lg:w-[560px] lg:rounded-[18px]"
      />
      <div className="flex flex-col gap-3.5">
        <span className="text-[13px] text-viratec-subtle lg:text-sm">{publication.year}</span>
        <h2 className="font-display text-2xl leading-[30px] font-medium tracking-[-0.025em] text-white lg:text-[38px] lg:leading-[44px]">
          {publication.title}
        </h2>
        <p className="text-[15px] leading-[23px] text-viratec-muted lg:text-[17px] lg:leading-[27px]">
          {publication.excerpt}
        </p>
        <p className="text-sm text-viratec-subtle">{publication.source}</p>
        <CardLinkLabel
          label={publication.linkLabel}
          className="text-base font-medium text-viratec-cyan"
        />
      </div>
    </Link>
  );
}

interface RelatedPublicationCardProps {
  publication: Publication;
}

export function RelatedPublicationCard({ publication }: RelatedPublicationCardProps) {
  const labels = usePublicationLabels();

  return (
    <Link
      to={buildPublicationPath(publication.slug)}
      className={`flex h-full flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.035] p-6 lg:min-h-[409px] lg:p-8 ${CARD_LINK_CLASS}`}
    >
      <MediaPlaceholder
        src={publication.image}
        label={labels.type[publication.type]}
        className="h-[160px] rounded-2xl lg:h-[190px] lg:rounded-[18px]"
      />
      <h3 className="font-display text-xl leading-[26px] font-medium tracking-[-0.02em] text-white lg:text-[22px] lg:leading-7">
        {publication.title}
      </h3>
      <p className="text-[15px] leading-[22px] text-viratec-muted lg:text-base lg:leading-6">
        {publication.excerpt}
      </p>
      <CardLinkLabel
        label={labels.readMore}
        className="mt-auto pt-1 text-[15px] font-medium text-viratec-cyan"
      />
    </Link>
  );
}

export function PublicationCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full animate-pulse flex-col gap-4 rounded-[24px] border border-white/8 bg-white/4 p-6 lg:min-h-[254px] lg:rounded-[28px] lg:p-8"
    >
      <span className="h-4 w-12 rounded bg-white/8" />
      <span className="h-6 w-3/4 rounded bg-white/8" />
      <span className="h-4 w-1/2 rounded bg-white/6" />
    </div>
  );
}

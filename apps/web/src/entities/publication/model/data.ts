import { PublicationType as PublicationDtoType, type PublicationDto } from '@viratec/contracts';
import { defineMessages, useLocalized, type Locale } from '@/shared/i18n';
import { contentAssetIdFromUrl, contentCoverSrc } from '@/shared/lib';
import type { Publication, PublicationType } from './types';

interface PublicationLabels {
  type: Record<PublicationType, string>;
  readPaper: string;
  readMore: string;
}

const PUBLICATION_LABELS = defineMessages<PublicationLabels>({
  en: {
    type: { paper: 'Paper', news: 'News', event: 'Event', media: 'Media' },
    readPaper: 'Read paper →',
    readMore: 'Read more →',
  },
  uk: {
    type: { paper: 'Стаття', news: 'Новина', event: 'Подія', media: 'Медіа' },
    readPaper: 'Читати статтю →',
    readMore: 'Читати далі →',
  },
});

export const usePublicationLabels = () => useLocalized(PUBLICATION_LABELS);

const PUBLICATION_TYPES: Record<PublicationDtoType, PublicationType> = {
  [PublicationDtoType.PAPER]: 'paper',
  [PublicationDtoType.NEWS]: 'news',
  [PublicationDtoType.EVENT]: 'event',
  [PublicationDtoType.MEDIA]: 'media',
};

const COVER_MODULES = import.meta.glob<string>('../assets/*.webp', {
  eager: true,
  import: 'default',
});

const COVERS = Object.fromEntries(
  Object.entries(COVER_MODULES).map(([path, src]) => [
    path.slice(path.lastIndexOf('/') + 1, -'.webp'.length),
    src,
  ]),
);

export const getPublicationCover = (coverKey: string | null | undefined) => {
  if (!coverKey) return undefined;
  if (!contentAssetIdFromUrl(coverKey)) return COVERS[coverKey];
  return contentCoverSrc(coverKey);
};

export const toPublication = (dto: PublicationDto, locale: Locale): Publication => {
  const labels = PUBLICATION_LABELS[locale];
  const { detail, ...text } = dto.content[locale];
  const type = PUBLICATION_TYPES[dto.type];
  const showPaperLink = type === 'paper' && !dto.readMoreLink;

  return {
    slug: dto.slug,
    type,
    year: dto.year,
    isFeatured: dto.isFeatured,
    ...text,
    linkLabel: showPaperLink ? labels.readPaper : labels.readMore,
    image: getPublicationCover(dto.coverKey),
    imageFocus: dto.coverFocus ?? undefined,
    sourceUrl: dto.sourceUrl ?? undefined,
    detail: detail && {
      ...detail,
      pdfUrl: dto.pdfUrl ?? undefined,
      sourceUrl: dto.detailSource ?? undefined,
    },
  };
};

export const findPublication = (publications: Publication[], slug: string | undefined) =>
  publications.find((publication) => publication.slug === slug);

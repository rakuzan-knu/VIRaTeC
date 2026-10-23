import { useParams } from 'react-router-dom';
import { SavedItemKind } from '@viratec/contracts';
import { SaveButton } from '@/features/save-item';
import { ROUTES } from '@/shared/config/routes';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { FactsCard } from '@/shared/ui/facts-card';
import { MediaPlaceholder } from '@/shared/ui/media-placeholder';
import { ButtonArrow, LinkButton, linkButtonClassName } from '@/shared/ui/link-button';
import {
  RelatedPublicationCard,
  findPublication,
  usePublicationLabels,
  usePublications,
  type Publication,
  type PublicationBlock,
} from '@/entities/publication';
import { PageIntro, type BreadcrumbItem } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { useSeo } from '@/shared/lib';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { ListFeedback } from '@/shared/ui/list-feedback';

const PUBLICATION_DETAIL_MESSAGES = defineMessages({
  en: {
    publicationsAndMedia: 'Publications & Media',
    publications: 'Publications',
    published: 'Published',
    authors: 'Authors',
    aboutPublication: 'About this publication',
    downloadPdf: 'Download PDF',
    openSource: 'Open source',
    loadingTitle: 'Loading publication…',
    loadingDescription: 'Fetching the publication.',
    loadError: 'We couldn’t load this publication.',
    notFoundTitle: 'Publication not found',
    notFoundDescription: 'The publication may have been moved or is no longer available.',
    allPublications: 'All publications',
    relatedEyebrow: 'Related',
    relatedTitle: 'More publications',
  },
  uk: {
    publicationsAndMedia: 'Публікації та медіа',
    publications: 'Публікації',
    published: 'Опубліковано',
    authors: 'Автори',
    aboutPublication: 'Про публікацію',
    downloadPdf: 'Завантажити PDF',
    openSource: 'Відкрити джерело',
    loadingTitle: 'Завантаження публікації…',
    loadingDescription: 'Отримуємо публікацію.',
    loadError: 'Не вдалося завантажити цю публікацію.',
    notFoundTitle: 'Публікацію не знайдено',
    notFoundDescription: 'Можливо, публікацію перемістили або вона більше не доступна.',
    allPublications: 'Усі публікації',
    relatedEyebrow: 'Схожі матеріали',
    relatedTitle: 'Більше публікацій',
  },
});

function ArticleBlock({ block }: { block: PublicationBlock }) {
  if (block.kind === 'heading') {
    return (
      <h2 className="pt-1 font-display text-2xl leading-[30px] font-medium tracking-[-0.02em] text-white lg:text-[32px] lg:leading-[38px]">
        {block.text}
      </h2>
    );
  }
  if (block.kind === 'quote') {
    return (
      <blockquote className="flex flex-col gap-2 border-l-[3px] border-viratec-accent pl-6">
        <p className="font-display text-xl leading-8 tracking-[-0.015em] text-white lg:text-[26px] lg:leading-9">
          {block.text}
        </p>
        <footer className="text-sm leading-5 text-viratec-subtle">{block.author}</footer>
      </blockquote>
    );
  }
  return (
    <p className="text-base leading-[26px] text-viratec-muted lg:text-[17px] lg:leading-7">
      {block.text}
    </p>
  );
}

function PublicationBody({ publication }: { publication: Publication }) {
  const { detail } = publication;
  const t = useLocalized(PUBLICATION_DETAIL_MESSAGES);
  const common = useCommonMessages();
  const labels = usePublicationLabels();
  const typeLabel = labels.type[publication.type];
  const meta = detail
    ? [detail.formatLabel, detail.publishedOn, detail.readTime]
    : [typeLabel, String(publication.year)];

  const facts = detail
    ? [
        { label: common.type, value: detail.kindLabel },
        { label: t.published, value: detail.publishedOn },
        { label: t.authors, value: detail.authors },
        { label: common.source, value: detail.sourceLabel },
      ]
    : [
        { label: common.type, value: typeLabel },
        { label: common.year, value: String(publication.year) },
        { label: common.source, value: publication.source },
      ];

  return (
    <PageSection containerClassName="lg:flex-row lg:items-start lg:gap-16">
      <article className="flex flex-1 flex-col gap-5">
        <p className="flex flex-wrap items-center gap-3 text-sm leading-5 text-viratec-subtle">
          {meta.map((item, index) => (
            <span key={item} className="flex items-center gap-3">
              {index > 0 && <span aria-hidden="true">·</span>}
              <span className={index === 0 ? 'text-viratec-accent' : undefined}>{item}</span>
            </span>
          ))}
        </p>
        <MediaPlaceholder
          src={publication.image}
          label={typeLabel}
          className="h-[220px] rounded-[24px] lg:h-[420px] lg:rounded-[32px]"
        />
        {detail ? (
          detail.blocks.map((block) => (
            <ArticleBlock key={`${block.kind}-${block.text}`} block={block} />
          ))
        ) : (
          <ArticleBlock block={{ kind: 'paragraph', text: publication.excerpt }} />
        )}
      </article>
      <FactsCard
        title={t.aboutPublication}
        facts={facts}
        actions={
          detail && (detail.pdfUrl || detail.sourceUrl) ? (
            <div className="flex flex-col gap-3">
              {detail.pdfUrl && (
                <a
                  href={detail.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={linkButtonClassName({ className: 'w-full' })}
                >
                  {t.downloadPdf}
                  <ButtonArrow />
                </a>
              )}
              {detail.sourceUrl && (
                <a
                  href={detail.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={linkButtonClassName({ variant: 'secondary', className: 'w-full' })}
                >
                  {t.openSource}
                  <ButtonArrow />
                </a>
              )}
            </div>
          ) : publication.sourceUrl ? (
            <a
              href={publication.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className={linkButtonClassName({ variant: 'secondary', className: 'w-full' })}
            >
              {t.openSource}
              <ButtonArrow />
            </a>
          ) : undefined
        }
      />
    </PageSection>
  );
}

export function PublicationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { publications, isPending, isError, retry } = usePublications();
  const publication = findPublication(publications, slug);
  const t = useLocalized(PUBLICATION_DETAIL_MESSAGES);
  const common = useCommonMessages();
  const labels = usePublicationLabels();
  useSeo(publication?.title ?? (isPending ? t.loadingTitle : t.notFoundTitle), {
    description: publication && (publication.detail?.lead ?? publication.excerpt),
    image: publication?.image,
    type: 'article',
    noindex: !publication && !isPending,
  });

  const breadcrumbRoot: BreadcrumbItem[] = [
    t.publicationsAndMedia,
    { label: t.publications, to: ROUTES.PUBLICATIONS },
  ];

  if (!publication) {
    return (
      <PageLayout
        intro={
          <PageIntro
            breadcrumb={breadcrumbRoot}
            title={isPending ? t.loadingTitle : isError ? t.loadError : t.notFoundTitle}
            description={isPending ? t.loadingDescription : t.notFoundDescription}
            className="lg:pb-16"
          >
            {!isPending && !isError && (
              <LinkButton
                to={ROUTES.PUBLICATIONS}
                variant="secondary"
                className="mt-2 w-full sm:w-auto"
              >
                {t.allPublications}
              </LinkButton>
            )}
          </PageIntro>
        }
      >
        {isError && (
          <PageSection>
            <ListFeedback message={t.loadError} actionLabel={common.tryAgain} onAction={retry} />
          </PageSection>
        )}
      </PageLayout>
    );
  }

  const related = publications.filter((item) => item.slug !== publication.slug).slice(0, 3);

  return (
    <PageLayout
      intro={
        <PageIntro
          breadcrumb={[...breadcrumbRoot, labels.type[publication.type]]}
          title={publication.detail?.heroTitle ?? publication.title}
          accent={publication.detail?.heroAccent}
          description={publication.detail?.lead ?? publication.source}
          descriptionClassName="lg:max-w-[680px]"
          className="lg:pb-16"
        >
          <SaveButton item={{ kind: SavedItemKind.PUBLICATION, refId: publication.slug }} />
        </PageIntro>
      }
    >
      <PublicationBody publication={publication} />
      <PageSection tone="surface" aria-labelledby="related-title">
        <SectionHeader id="related-title" eyebrow={t.relatedEyebrow} title={t.relatedTitle} />
        <ul className="grid gap-6 lg:grid-cols-3">
          {related.map((item) => (
            <li key={item.slug}>
              <RelatedPublicationCard publication={item} />
            </li>
          ))}
        </ul>
      </PageSection>
    </PageLayout>
  );
}

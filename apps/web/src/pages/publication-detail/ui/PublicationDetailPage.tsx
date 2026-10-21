import { useParams } from 'react-router-dom';
import { ROUTES } from '@/shared/config/routes';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { FactsCard } from '@/shared/ui/facts-card';
import { MediaPlaceholder } from '@/shared/ui/media-placeholder';
import { ButtonArrow, LinkButton, linkButtonClassName } from '@/shared/ui/link-button';
import {
  PUBLICATIONS,
  PUBLICATION_TYPE_LABEL,
  RelatedPublicationCard,
  findPublication,
  type Publication,
  type PublicationBlock,
} from '@/entities/publication';
import { PageIntro, type BreadcrumbItem } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { useDocumentTitle } from '@/shared/lib';

const BREADCRUMB_ROOT: BreadcrumbItem[] = [
  'Publications & Media',
  { label: 'Publications', to: ROUTES.PUBLICATIONS },
];

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
  const typeLabel = PUBLICATION_TYPE_LABEL[publication.type];
  const meta = detail
    ? [detail.formatLabel, detail.publishedOn, detail.readTime]
    : [typeLabel, String(publication.year)];

  const facts = detail
    ? [
        { label: 'Type', value: detail.kindLabel },
        { label: 'Published', value: detail.publishedOn },
        { label: 'Authors', value: detail.authors },
        { label: 'Source', value: detail.sourceLabel },
      ]
    : [
        { label: 'Type', value: typeLabel },
        { label: 'Year', value: String(publication.year) },
        { label: 'Source', value: publication.source },
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
        <MediaPlaceholder className="h-[220px] rounded-[24px] lg:h-[420px] lg:rounded-[32px]" />
        {detail ? (
          detail.blocks.map((block) => (
            <ArticleBlock key={`${block.kind}-${block.text}`} block={block} />
          ))
        ) : (
          <ArticleBlock block={{ kind: 'paragraph', text: publication.excerpt }} />
        )}
      </article>
      <FactsCard
        title="About this publication"
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
                  Download PDF
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
                  Open source
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
              Open source
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
  const publication = findPublication(slug);
  useDocumentTitle(publication?.title ?? 'Publication not found');

  if (!publication) {
    return (
      <PageLayout
        intro={
          <PageIntro
            breadcrumb={BREADCRUMB_ROOT}
            title="Publication not found"
            description="The publication may have been moved or is no longer available."
            className="lg:pb-16"
          >
            <LinkButton
              to={ROUTES.PUBLICATIONS}
              variant="secondary"
              className="mt-2 w-full sm:w-auto"
            >
              All publications
            </LinkButton>
          </PageIntro>
        }
      >
        {null}
      </PageLayout>
    );
  }

  const related = PUBLICATIONS.filter((item) => item.slug !== publication.slug).slice(0, 3);

  return (
    <PageLayout
      intro={
        <PageIntro
          breadcrumb={[...BREADCRUMB_ROOT, PUBLICATION_TYPE_LABEL[publication.type]]}
          title={publication.detail?.heroTitle ?? publication.title}
          accent={publication.detail?.heroAccent}
          description={publication.detail?.lead ?? publication.source}
          descriptionClassName="lg:max-w-[680px]"
          className="lg:pb-16"
        />
      }
    >
      <PublicationBody publication={publication} />
      <PageSection tone="surface" aria-labelledby="related-title">
        <SectionHeader id="related-title" eyebrow="Related" title="More publications" />
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

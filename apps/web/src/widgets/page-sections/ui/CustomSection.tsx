import type { CustomSectionItem } from '@/shared/config/pageLayout';
import { ROUTES } from '@/shared/config/routes';
import { useLocale, type Locale } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { CtaSection } from '@/shared/ui/cta-section';
import { HighlightBanner } from '@/shared/ui/highlight-banner';
import { InfoCard } from '@/shared/ui/info-card';
import { PageSection } from '@/shared/ui/page-section';
import { ResponsiveImage } from '@/shared/ui/responsive-image';
import { SectionHeader } from '@/shared/ui/section-header';

const PARAGRAPH_SEPARATOR = /\n\s*\n/;
const MEDIA_IMAGE_SIZES = '(min-width: 1024px) 620px, 100vw';

type Text = Record<Locale, string>;

const pick = (text: Text, locale: Locale) => text[locale].trim() || text.en.trim();

function Paragraphs({ text }: { text: string }) {
  return text
    .split(PARAGRAPH_SEPARATOR)
    .filter((paragraph) => paragraph.trim())
    .map((paragraph, index) => <p key={index}>{paragraph.trim()}</p>);
}

export function CustomSection({ section }: { section: CustomSectionItem }) {
  const locale = useLocale();
  const read = (text: Text) => pick(text, locale);
  const headingId = `section-${section.id}-title`;

  if (section.type === 'cta') {
    const label = read(section.actionLabel);
    return (
      <CtaSection
        title={read(section.title)}
        description={read(section.description)}
        action={
          section.link in ROUTES
            ? { label, to: ROUTES[section.link as keyof typeof ROUTES] }
            : { label, href: section.link }
        }
      />
    );
  }

  if (section.type === 'stats') {
    return (
      <PageSection>
        <HighlightBanner
          title={read(section.title)}
          description={read(section.description)}
          stats={section.items.map((item) => ({ value: item.value, label: read(item.label) }))}
        />
      </PageSection>
    );
  }

  if (section.type === 'cards') {
    return (
      <PageSection aria-labelledby={headingId}>
        <SectionHeader
          id={headingId}
          eyebrow={read(section.eyebrow) || undefined}
          title={read(section.title)}
          description={read(section.description) || undefined}
        />
        {section.items.length > 0 && (
          <ul className="grid gap-6 lg:grid-cols-3">
            {section.items.map((item, index) => (
              <li key={index}>
                <InfoCard
                  image={item.image?.url}
                  title={read(item.title)}
                  description={read(item.description)}
                  linkLabel={item.link ? read(item.linkLabel) || undefined : undefined}
                  to={item.link ? ROUTES[item.link] : undefined}
                />
              </li>
            ))}
          </ul>
        )}
      </PageSection>
    );
  }

  if (section.type === 'media') {
    return (
      <PageSection aria-labelledby={headingId}>
        <div
          className={cn(
            'grid items-center gap-8 lg:grid-cols-2 lg:gap-16',
            section.imageSide === 'right' && 'lg:[&>*:first-child]:order-2',
          )}
        >
          {section.image ? (
            <span className="reveal-frame block overflow-hidden rounded-[28px] lg:rounded-[36px]">
              <ResponsiveImage
                src={section.image.url}
                sizes={MEDIA_IMAGE_SIZES}
                alt={read(section.image.alt)}
                loading="lazy"
                decoding="async"
                className="reveal-media aspect-[4/3] w-full object-cover"
              />
            </span>
          ) : (
            <span aria-hidden="true" className="hidden lg:block" />
          )}
          <div className="flex min-w-0 flex-col gap-6">
            <SectionHeader
              id={headingId}
              eyebrow={read(section.eyebrow) || undefined}
              title={read(section.title)}
            />
            <div className="flex flex-col gap-5 text-base leading-[27px] text-viratec-soft lg:text-lg lg:leading-[30px]">
              <Paragraphs text={read(section.body)} />
            </div>
          </div>
        </div>
      </PageSection>
    );
  }

  return (
    <PageSection aria-labelledby={headingId}>
      <SectionHeader
        id={headingId}
        eyebrow={read(section.eyebrow) || undefined}
        title={read(section.title)}
      />
      <div className="flex max-w-[72ch] flex-col gap-5 text-base leading-[27px] text-viratec-soft lg:ml-[276px] lg:text-lg lg:leading-[30px]">
        <Paragraphs text={read(section.body)} />
      </div>
    </PageSection>
  );
}

import { ROUTES } from '@/shared/config/routes';
import { useCommonMessages } from '@/shared/i18n';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { InfoCard } from '@/shared/ui/info-card';
import { HighlightBanner } from '@/shared/ui/highlight-banner';
import { CtaSection } from '@/shared/ui/cta-section';
import { PageIntro } from '@/widgets/page-intro';
import { SiteHeader } from '@/widgets/site-header';
import { PageLayout } from '@/widgets/page-layout';
import { SiteFooter } from '@/widgets/site-footer';
import { useSeo } from '@/shared/lib';
import { useResearchAreasContent } from '../model/content';

export function ResearchAreasPage() {
  const content = useResearchAreasContent();
  const common = useCommonMessages();
  useSeo(content.documentTitle);

  return (
    <PageLayout
      footer={<SiteFooter />}
      intro={
        <PageIntro
          header={<SiteHeader />}
          breadcrumb={content.breadcrumb}
          title={content.title}
          accent={content.accent}
          description={content.description}
        />
      }
    >
      <PageSection aria-labelledby="areas-title">
        <SectionHeader
          id="areas-title"
          eyebrow={content.areasEyebrow}
          title={content.areasTitle}
          description={content.areasDescription}
        />
        <ul className="grid gap-6 lg:grid-cols-3">
          {content.areas.map((area) => (
            <li key={area.title}>
              <InfoCard
                image={area.image}
                title={area.title}
                description={area.description}
                linkLabel={common.seeProjects}
                to={ROUTES.PROJECTS}
                className="lg:min-h-[405px]"
              />
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection tone="surface">
        <HighlightBanner
          title={content.bannerTitle}
          description={content.bannerDescription}
          stats={content.stats}
        />
      </PageSection>

      <PageSection aria-labelledby="future-title">
        <SectionHeader
          id="future-title"
          eyebrow={content.futureEyebrow}
          title={content.futureTitle}
          description={content.futureDescription}
        />
        <ul className="grid gap-6 lg:grid-cols-3">
          {content.futureDirections.map((direction) => (
            <li key={direction.title}>
              <InfoCard
                variant="muted"
                title={direction.title}
                description={direction.description}
                linkLabel={content.discussProject}
                to={ROUTES.CONTACT}
                className="lg:min-h-[197px]"
              />
            </li>
          ))}
        </ul>
      </PageSection>

      <CtaSection
        tone="surface"
        title={content.ctaTitle}
        description={content.ctaDescription}
        action={{ label: common.seeOpportunities, to: ROUTES.OPPORTUNITIES }}
      />
    </PageLayout>
  );
}

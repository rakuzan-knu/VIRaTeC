import { ROUTES } from '@/shared/config/routes';
import { useCommonMessages } from '@/shared/i18n';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { InfoCard } from '@/shared/ui/info-card';
import { StepsList } from '@/shared/ui/steps-list';
import { CtaSection } from '@/shared/ui/cta-section';
import { PageIntro } from '@/widgets/page-intro';
import { SiteHeader } from '@/widgets/site-header';
import { PageLayout } from '@/widgets/page-layout';
import { SiteFooter } from '@/widgets/site-footer';
import { useSeo } from '@/shared/lib';
import { useExperientialLearningContent } from '../model/content';

export function ExperientialLearningPage() {
  const content = useExperientialLearningContent();
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
      <PageSection aria-labelledby="formats-title">
        <SectionHeader
          id="formats-title"
          eyebrow={content.formatsEyebrow}
          title={content.formatsTitle}
        />
        <ul className="grid gap-6 lg:grid-cols-3">
          {content.formats.map((format) => (
            <li key={format.title}>
              <InfoCard
                title={format.title}
                description={format.description}
                linkLabel={format.linkLabel}
                to={format.to}
                className="lg:min-h-[221px]"
              />
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection tone="surface" aria-labelledby="approach-title">
        <SectionHeader
          id="approach-title"
          eyebrow={content.approachEyebrow}
          title={content.approachTitle}
          accent={content.approachAccent}
        />
        <StepsList steps={content.principles} />
      </PageSection>

      <PageSection aria-labelledby="outcomes-title">
        <SectionHeader
          id="outcomes-title"
          eyebrow={content.outcomesEyebrow}
          title={content.outcomesTitle}
        />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.outcomes.map((outcome) => (
            <li key={outcome.title}>
              <InfoCard
                title={outcome.title}
                description={outcome.description}
                className="lg:min-h-[232px]"
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

import { useNetworkPartners } from '@/entities/partner';
import { ROUTES } from '@/shared/config/routes';
import { useCommonMessages } from '@/shared/i18n';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { InfoCard } from '@/shared/ui/info-card';
import { StepsList } from '@/shared/ui/steps-list';
import { HighlightBanner } from '@/shared/ui/highlight-banner';
import { CtaSection } from '@/shared/ui/cta-section';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { PageSections } from '@/widgets/page-sections';
import { useGlobalCollaborationContent } from '../model/content';
import { useSeo } from '@/shared/lib';

export function GlobalCollaborationPage() {
  const content = useGlobalCollaborationContent();
  const partners = useNetworkPartners();
  const common = useCommonMessages();
  useSeo(content.documentTitle);

  return (
    <PageLayout
      intro={
        <PageIntro
          breadcrumb={content.breadcrumb}
          title={content.title}
          accent={content.accent}
          description={content.description}
        />
      }
    >
      <PageSections
        page="GLOBAL_COLLABORATION"
        sections={{
          partners: (
            <PageSection aria-labelledby="partners-title">
              <SectionHeader
                id="partners-title"
                eyebrow={content.partnersEyebrow}
                title={content.partnersTitle}
              />
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                {partners.map((partner) => (
                  <li key={partner.name}>
                    <InfoCard
                      index={partner.code}
                      title={partner.name}
                      description={partner.location}
                      logo={partner.logo}
                      className="lg:min-h-[184px]"
                    />
                  </li>
                ))}
                <li>
                  <InfoCard
                    index="+"
                    title={content.inviteTitle}
                    description={content.inviteDescription}
                    to={ROUTES.CONTACT}
                    variant="invite"
                    className="lg:min-h-[184px]"
                  />
                </li>
              </ul>
            </PageSection>
          ),
          highlight: (
            <PageSection tone="surface">
              <HighlightBanner
                title={content.bannerTitle}
                description={content.bannerDescription}
                stats={content.stats}
              />
            </PageSection>
          ),
          formats: (
            <PageSection aria-labelledby="formats-title">
              <SectionHeader
                id="formats-title"
                eyebrow={content.formatsEyebrow}
                title={content.formatsTitle}
                description={content.formatsDescription}
              />
              <ul className="grid gap-6 lg:grid-cols-3">
                {content.formats.map((format) => (
                  <li key={format.title}>
                    <InfoCard
                      image={format.image}
                      title={format.title}
                      description={format.description}
                      linkLabel={common.learnMore}
                      to={format.to}
                      className="lg:min-h-[381px]"
                    />
                  </li>
                ))}
              </ul>
            </PageSection>
          ),
          partnership: (
            <PageSection tone="surface" aria-labelledby="partnership-title">
              <SectionHeader
                id="partnership-title"
                eyebrow={content.partnershipEyebrow}
                title={content.partnershipTitle}
                accent={content.partnershipAccent}
              />
              <StepsList steps={content.partnershipSteps} />
            </PageSection>
          ),
          cta: (
            <CtaSection
              title={content.ctaTitle}
              description={content.ctaDescription}
              action={{ label: content.ctaAction, to: ROUTES.CONTACT }}
            />
          ),
        }}
      />
    </PageLayout>
  );
}

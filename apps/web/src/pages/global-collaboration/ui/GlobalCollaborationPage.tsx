import { ROUTES } from '@/shared/config/routes';
import coilTeamsPhoto from '@/shared/assets/photos/coil-online-teams.webp';
import talksPhoto from '@/shared/assets/photos/conference-audience-knu.webp';
import rolePlayPhoto from '@/shared/assets/photos/jhu-role-play-online.webp';
import { useCommonMessages, useLocalized } from '@/shared/i18n';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { InfoCard } from '@/shared/ui/info-card';
import { StepsList } from '@/shared/ui/steps-list';
import { HighlightBanner } from '@/shared/ui/highlight-banner';
import { CtaSection } from '@/shared/ui/cta-section';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { GLOBAL_COLLABORATION_CONTENT } from '../model/content';
import { useSeo } from '@/shared/lib';

const FORMAT_PHOTOS = [coilTeamsPhoto, talksPhoto, rolePlayPhoto];

export function GlobalCollaborationPage() {
  const content = useLocalized(GLOBAL_COLLABORATION_CONTENT);
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
      <PageSection aria-labelledby="partners-title">
        <SectionHeader
          id="partners-title"
          eyebrow={content.partnersEyebrow}
          title={content.partnersTitle}
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {content.partners.map((partner) => (
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

      <PageSection tone="surface">
        <HighlightBanner
          title={content.bannerTitle}
          description={content.bannerDescription}
          stats={content.stats}
        />
      </PageSection>

      <PageSection aria-labelledby="formats-title">
        <SectionHeader
          id="formats-title"
          eyebrow={content.formatsEyebrow}
          title={content.formatsTitle}
          description={content.formatsDescription}
        />
        <ul className="grid gap-6 lg:grid-cols-3">
          {content.formats.map((format, index) => (
            <li key={format.title}>
              <InfoCard
                image={FORMAT_PHOTOS[index]}
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

      <PageSection tone="surface" aria-labelledby="partnership-title">
        <SectionHeader
          id="partnership-title"
          eyebrow={content.partnershipEyebrow}
          title={content.partnershipTitle}
          accent={content.partnershipAccent}
        />
        <StepsList steps={content.partnershipSteps} />
      </PageSection>

      <CtaSection
        title={content.ctaTitle}
        description={content.ctaDescription}
        action={{ label: content.ctaAction, to: ROUTES.CONTACT }}
      />
    </PageLayout>
  );
}

import { ROUTES } from '@/shared/config/routes';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { InfoCard } from '@/shared/ui/info-card';
import { StepsList } from '@/shared/ui/steps-list';
import { HighlightBanner } from '@/shared/ui/highlight-banner';
import { CtaSection } from '@/shared/ui/cta-section';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import {
  FORMATS,
  FRAMEWORK_STATS,
  PARTNER_UNIVERSITIES,
  PARTNERSHIP_STEPS,
} from '../model/content';

export function GlobalCollaborationPage() {
  return (
    <PageLayout
      intro={
        <PageIntro
          breadcrumb={['About', 'Global Collaboration Framework']}
          title="Collaboration"
          accent="without borders."
          description="How KNU and partner universities build joint programs, research and student projects within the VIRaTeC network."
        />
      }
    >
      <PageSection aria-labelledby="partners-title">
        <SectionHeader
          id="partners-title"
          eyebrow="Partner universities"
          title="Our global network"
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {PARTNER_UNIVERSITIES.map((partner) => (
            <li key={partner.name}>
              <InfoCard
                index={partner.code}
                title={partner.name}
                description={partner.location}
                className="lg:min-h-[184px]"
              />
            </li>
          ))}
          <li>
            <InfoCard
              index="+"
              title="Your university"
              description="Join the network and co-create international programs."
              to={ROUTES.CONTACT}
              variant="invite"
              className="lg:min-h-[184px]"
            />
          </li>
        </ul>
      </PageSection>

      <PageSection tone="surface">
        <HighlightBanner
          title="One framework for joint learning and research"
          description="Partners agree on shared goals, co-design modules and form mixed student teams. KNU coordinates the network, partners bring their expertise and students."
          stats={FRAMEWORK_STATS}
        />
      </PageSection>

      <PageSection aria-labelledby="formats-title">
        <SectionHeader
          id="formats-title"
          eyebrow="Formats"
          title="Ways to collaborate"
          description="Flexible formats that fit different partners and academic calendars."
        />
        <ul className="grid gap-6 lg:grid-cols-3">
          {FORMATS.map((format) => (
            <li key={format.title}>
              <InfoCard
                withImage
                title={format.title}
                description={format.description}
                linkLabel="Learn more →"
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
          eyebrow="Become a partner"
          title="How partnership"
          accent="starts"
        />
        <StepsList steps={PARTNERSHIP_STEPS} />
      </PageSection>

      <CtaSection
        title="Let’s collaborate"
        description="Represent a university or organization? Tell us about your idea and we will find a format together."
        action={{ label: 'Become a partner', to: ROUTES.CONTACT }}
      />
    </PageLayout>
  );
}

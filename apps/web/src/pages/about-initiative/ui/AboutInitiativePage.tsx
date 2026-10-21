import { ROUTES } from '@/shared/config/routes';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { InfoCard } from '@/shared/ui/info-card';
import { StepsList } from '@/shared/ui/steps-list';
import { PersonCard } from '@/shared/ui/person-card';
import { CtaSection } from '@/shared/ui/cta-section';
import { ExpandableText } from '@/shared/ui/expandable-text';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { MISSION_VISION, PHILOSOPHY, TEAM, VALUES } from '../model/content';
import { useDocumentTitle } from '@/shared/lib';

export function AboutInitiativePage() {
  useDocumentTitle('About the Initiative');

  return (
    <PageLayout
      intro={
        <PageIntro
          breadcrumb={['About', 'About Initiative']}
          title="Why VIRaTeC"
          accent="exists."
          description="Since 2019 Dr. Larysa Liashenko and colleagues have connected students across Ukraine, the UK, the USA, Asia and Europe through virtual learning."
        />
      }
    >
      <PageSection aria-labelledby="mission-title">
        <SectionHeader id="mission-title" eyebrow="Mission & Vision" title="What drives us" />
        <div className="flex flex-col gap-7 lg:flex-row lg:gap-16">
          {MISSION_VISION.map((item) => (
            <div key={item.label} className="flex flex-col items-start gap-3.5 lg:flex-1">
              <h3 className="text-[15px] leading-5 font-medium text-viratec-accent lg:text-[17px] lg:leading-6">
                {item.label}
              </h3>
              <ExpandableText className="font-display text-[22px] leading-[30px] tracking-[-0.02em] text-white lg:text-[30px] lg:leading-[40px]">
                {item.text}
              </ExpandableText>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection tone="surface" aria-labelledby="values-title">
        <SectionHeader id="values-title" eyebrow="Our values" title="What we believe in" />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value, index) => (
            <li key={value.title}>
              <InfoCard
                index={String(index + 1).padStart(2, '0')}
                title={value.title}
                description={value.description}
                className="lg:min-h-[180px]"
              />
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection aria-labelledby="philosophy-title">
        <SectionHeader
          id="philosophy-title"
          eyebrow="Educational philosophy"
          title="How we teach"
        />
        <StepsList steps={PHILOSOPHY} />
      </PageSection>

      <PageSection tone="surface" aria-labelledby="team-title">
        <SectionHeader
          id="team-title"
          eyebrow="Team"
          title="People behind"
          accent="the initiative"
        />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((member) => (
            <li key={member.name}>
              <PersonCard name={member.name} role={member.role} photo={member.photo} />
            </li>
          ))}
        </ul>
      </PageSection>

      <CtaSection
        title="Discover the community"
        description="See how VIRaTeC works and how universities collaborate within the network."
        action={{ label: 'Explore VIRaTeC', to: ROUTES.VIRATEC }}
      />
    </PageLayout>
  );
}

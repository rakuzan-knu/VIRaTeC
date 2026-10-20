import { ROUTES } from '@/shared/config/routes';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { InfoCard } from '@/shared/ui/info-card';
import { HighlightBanner } from '@/shared/ui/highlight-banner';
import { CtaSection } from '@/shared/ui/cta-section';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';

const AREAS = [
  {
    title: 'Cybersecurity',
    description:
      'Threats, defence strategies and secure digital collaboration, studied by international student teams in a certified module.',
  },
  {
    title: 'Cross-cultural competence',
    description:
      'Emotional intelligence and intercultural communication in virtual international teams.',
  },
  {
    title: 'Education & EdTech',
    description:
      'COIL methodology and technology-enhanced learning that make international research accessible to every student.',
  },
] as const;

const FUTURE_DIRECTIONS = [
  {
    title: 'AI in education',
    description: 'EAP + AI technologies: how students use AI to learn and research.',
  },
  {
    title: 'Data analytics & storytelling',
    description: 'ESP/EAP + Data Analytics: turning data into stories and decisions.',
  },
  {
    title: 'Gerontology & digital society',
    description: 'ESP/EAP + Gerontology: interdisciplinary COIL with Georgia State University.',
  },
] as const;

const AREA_STATS = [
  { value: '16', label: 'partner universities' },
  { value: '5', label: 'continents' },
];

export function ResearchAreasPage() {
  return (
    <PageLayout
      intro={
        <PageIntro
          breadcrumb={['Research & Projects', 'Research Areas']}
          title="Our research"
          accent="areas."
          description="VIRaTeC brings together IT, linguistics and education. Every area connects students and researchers from KNU with colleagues from partner universities."
        />
      }
    >
      <PageSection aria-labelledby="areas-title">
        <SectionHeader
          id="areas-title"
          eyebrow="Research areas"
          title="Where we work"
          description="Each area is explored by mixed international teams through COIL projects, workshops and certified modules."
        />
        <ul className="grid gap-6 lg:grid-cols-3">
          {AREAS.map((area) => (
            <li key={area.title}>
              <InfoCard
                withImage
                title={area.title}
                description={area.description}
                linkLabel="See projects →"
                to={ROUTES.PROJECTS}
                className="lg:min-h-[405px]"
              />
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection tone="surface">
        <HighlightBanner
          title="Every area is explored by mixed international teams."
          description="Students and researchers from Kyiv work together with partners from the UK, Colombia, Chile, the UAE and India on one shared research question."
          stats={AREA_STATS}
        />
      </PageSection>

      <PageSection aria-labelledby="future-title">
        <SectionHeader
          id="future-title"
          eyebrow="Future directions"
          title="What’s next"
          description="Planned research directions. Details will be announced together with partner universities."
        />
        <ul className="grid gap-6 lg:grid-cols-3">
          {FUTURE_DIRECTIONS.map((direction) => (
            <li key={direction.title}>
              <InfoCard
                variant="muted"
                title={direction.title}
                description={direction.description}
                linkLabel="Get notified →"
                to={ROUTES.CONTACT}
                className="lg:min-h-[197px]"
              />
            </li>
          ))}
        </ul>
      </PageSection>

      <CtaSection
        tone="surface"
        title="Want to research with us?"
        description="Join an existing area or propose a new direction together with your team."
        action={{ label: 'See opportunities', to: ROUTES.OPPORTUNITIES }}
      />
    </PageLayout>
  );
}

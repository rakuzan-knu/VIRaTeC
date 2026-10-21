import { ROUTES } from '@/shared/config/routes';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { InfoCard } from '@/shared/ui/info-card';
import { HighlightBanner } from '@/shared/ui/highlight-banner';
import { CtaSection } from '@/shared/ui/cta-section';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { useDocumentTitle } from '@/shared/lib';

const AREAS = [
  {
    title: 'Cybersecurity',
    description:
      'Cyber risks, business intelligence and cyber hygiene, studied by international student teams in certified COIL modules.',
  },
  {
    title: 'NLP & AI',
    description:
      'Foundations of NLP: from text preprocessing to sentiment analysis, with 206 students from 7 universities and Chartbeat.',
  },
  {
    title: 'Education & EdTech',
    description:
      'COIL, virtual exchange and Research-Based Learning that turn students into researchers and global citizens.',
  },
] as const;

const FUTURE_DIRECTIONS = [
  {
    title: 'Intercultural communication',
    description: 'ESP + Intercultural Communication: pre-COIL workshops and global teamwork.',
  },
  {
    title: 'Data analytics & storytelling',
    description: 'ESP/EAP + Data Analytics: Data-Driven Decision Making Across Borders.',
  },
  {
    title: 'Gerontology & digital society',
    description:
      'ESP/EAP + Gerontology: interdisciplinary COIL with Georgia State University, Perimeter College.',
  },
] as const;

const AREA_STATS = [
  { value: '14', label: 'partner universities' },
  { value: '8', label: 'countries' },
];

export function ResearchAreasPage() {
  useDocumentTitle('Research Areas');

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
          eyebrow="Interdisciplinary models"
          title="Language meets discipline"
          description="ESP/EAP courses combined with other fields, so that language competence and subject expertise grow together."
        />
        <ul className="grid gap-6 lg:grid-cols-3">
          {FUTURE_DIRECTIONS.map((direction) => (
            <li key={direction.title}>
              <InfoCard
                variant="muted"
                title={direction.title}
                description={direction.description}
                linkLabel="Discuss a project →"
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

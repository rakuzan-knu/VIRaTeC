import { ROUTES } from '@/shared/config/routes';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { InfoCard } from '@/shared/ui/info-card';
import { StepsList, type StepItem } from '@/shared/ui/steps-list';
import { CtaSection } from '@/shared/ui/cta-section';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { useDocumentTitle } from '@/shared/lib';

const FORMATS = [
  {
    title: 'COIL projects',
    description:
      'Collaborative Online International Learning: one shared project for students from different countries and universities.',
    linkLabel: 'See projects →',
    to: ROUTES.PROJECTS,
  },
  {
    title: 'Synchronous online workshops',
    description:
      'Live sessions and role-play simulations, e.g. offshore wind farm negotiations with Johns Hopkins University.',
    linkLabel: 'See events →',
    to: ROUTES.PUBLICATIONS,
  },
  {
    title: 'Certified modules',
    description:
      'Certified Research-Based Learning modules where Master’s students lead workshops for international cohorts.',
    linkLabel: 'Learn more →',
    to: ROUTES.OPPORTUNITIES,
  },
] as const;

const PRINCIPLES: StepItem[] = [
  {
    title: 'Idea → outcome',
    description: 'Every project starts with a student idea and ends with a tangible result.',
  },
  {
    title: 'Challenge → collaboration',
    description: 'Teams from different countries solve one real problem together.',
  },
  {
    title: 'Knowledge → implementation',
    description: 'What students learn is applied in practice, not only in exams.',
  },
];

const OUTCOMES = [
  { title: 'Research skills', description: 'From formulating a question to presenting results.' },
  {
    title: 'Cross-cultural competence',
    description: 'Working with people from different cultures and time zones.',
  },
  { title: 'Emotional intelligence', description: 'Empathy and communication in virtual teams.' },
  {
    title: 'Global teamwork',
    description: 'Delivering one result together with international peers.',
  },
] as const;

export function ExperientialLearningPage() {
  useDocumentTitle('Experiential Learning');

  return (
    <PageLayout
      intro={
        <PageIntro
          breadcrumb={['Research & Projects', 'Experiential Learning']}
          title="Learning by"
          accent="doing."
          description="At VIRaTeC students learn through real international projects: they research, collaborate across cultures and deliver results together with partner universities."
        />
      }
    >
      <PageSection aria-labelledby="formats-title">
        <SectionHeader id="formats-title" eyebrow="Learning formats" title="How students learn" />
        <ul className="grid gap-6 lg:grid-cols-3">
          {FORMATS.map((format) => (
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
          eyebrow="Our approach"
          title="Three principles"
          accent="of every project"
        />
        <StepsList steps={PRINCIPLES} />
      </PageSection>

      <PageSection aria-labelledby="outcomes-title">
        <SectionHeader id="outcomes-title" eyebrow="Outcomes" title="What students gain" />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {OUTCOMES.map((outcome, index) => (
            <li key={outcome.title}>
              <InfoCard
                index={String(index + 1).padStart(2, '0')}
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
        title="Ready to learn by doing?"
        description="Join the next COIL project or workshop."
        action={{ label: 'See opportunities', to: ROUTES.OPPORTUNITIES }}
      />
    </PageLayout>
  );
}

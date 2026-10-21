import { ROUTES } from '@/shared/config/routes';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { InfoCard } from '@/shared/ui/info-card';
import { StepsList, type StepItem } from '@/shared/ui/steps-list';
import { HighlightBanner } from '@/shared/ui/highlight-banner';
import { CtaSection } from '@/shared/ui/cta-section';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { useDocumentTitle } from '@/shared/lib';

const STUDENT_PROJECTS = [
  {
    title: 'Cyber Risks and Business Intelligence',
    description:
      'A COIL module with the American University in the Emirates, led by Head Project Lead Anastasiia Loban with Anton Dmytrenko.',
  },
  {
    title: 'Foundations of NLP module',
    description:
      'Led by Master’s student Eduard Parkhomenko: 31 teams, 206 students, 7 universities.',
  },
  {
    title: 'Fundamentals of Cyber Hygiene',
    description:
      'Project Lead Yuliia Novichkova (KNU FIT): 87 students from 3 Ukrainian universities.',
  },
] as const;

const START_STEPS: StepItem[] = [
  { title: 'Share your idea', description: 'Describe your research idea in a few sentences.' },
  {
    title: 'Find a team',
    description: 'We connect you with students from partner universities.',
  },
  { title: 'Get a supervisor', description: 'A researcher helps you shape the project.' },
  { title: 'Deliver results', description: 'Run the project and present the results.' },
];

const HIGHLIGHT_STATS = [
  { value: '6', label: 'student authors' },
  { value: '2', label: 'articles in a Category B journal' },
];

export function StudentResearchPage() {
  useDocumentTitle('Student Research');

  return (
    <PageLayout
      intro={
        <PageIntro
          breadcrumb={['Research & Projects', 'Student Research']}
          title="Students lead"
          accent="the research."
          description="At VIRaTeC students are co-creators: they propose ideas, lead international teams and deliver research results together with partner universities."
        />
      }
    >
      <PageSection>
        <HighlightBanner
          title="From a global virtual classroom to a peer-reviewed journal."
          description="Six students of the KNU Faculty of Information Technology turned their COIL research into two articles in Grail of Science, a Ukrainian Category B journal, published on 1 May 2026."
          stats={HIGHLIGHT_STATS}
        />
      </PageSection>

      <PageSection tone="surface" aria-labelledby="student-projects-title">
        <SectionHeader
          id="student-projects-title"
          eyebrow="Student projects"
          title="Led by students"
          description="Research projects initiated and led by VIRaTeC students."
        />
        <ul className="grid gap-6 lg:grid-cols-3">
          {STUDENT_PROJECTS.map((project) => (
            <li key={project.title}>
              <InfoCard
                withImage
                title={project.title}
                description={project.description}
                linkLabel="View project →"
                to={ROUTES.PROJECTS}
                className="lg:min-h-[433px]"
              />
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection aria-labelledby="start-title">
        <SectionHeader
          id="start-title"
          eyebrow="Start your own"
          title="From idea"
          accent="to project"
        />
        <StepsList steps={START_STEPS} />
      </PageSection>

      <CtaSection
        tone="surface"
        title="Have a research idea?"
        description="Propose it — we will help you turn it into an international project."
        action={{ label: 'Propose an idea', to: ROUTES.CONTACT }}
      />
    </PageLayout>
  );
}

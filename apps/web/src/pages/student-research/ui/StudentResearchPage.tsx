import { ROUTES } from '@/shared/config/routes';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { InfoCard } from '@/shared/ui/info-card';
import { StepsList, type StepItem } from '@/shared/ui/steps-list';
import { HighlightBanner, type HighlightStat } from '@/shared/ui/highlight-banner';
import { CtaSection } from '@/shared/ui/cta-section';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { useDocumentTitle } from '@/shared/lib';

interface TitledText {
  title: string;
  description: string;
}

interface StudentResearchContent {
  documentTitle: string;
  breadcrumb: string[];
  title: string;
  accent: string;
  description: string;
  bannerTitle: string;
  bannerDescription: string;
  stats: HighlightStat[];
  projectsEyebrow: string;
  projectsTitle: string;
  projectsDescription: string;
  projects: TitledText[];
  startEyebrow: string;
  startTitle: string;
  startAccent: string;
  startSteps: StepItem[];
  ctaTitle: string;
  ctaDescription: string;
  ctaAction: string;
}

const STUDENT_RESEARCH_CONTENT = defineMessages<StudentResearchContent>({
  en: {
    documentTitle: 'Student Research',
    breadcrumb: ['Research & Projects', 'Student Research'],
    title: 'Students lead',
    accent: 'the research.',
    description:
      'At VIRaTeC students are co-creators: they propose ideas, lead international teams and deliver research results together with partner universities.',
    bannerTitle: 'From a global virtual classroom to a peer-reviewed journal.',
    bannerDescription:
      'Six students of the KNU Faculty of Information Technology turned their COIL research into two articles in Grail of Science, a Ukrainian Category B journal, published on 1 May 2026.',
    stats: [
      { value: '6', label: 'student authors' },
      { value: '2', label: 'articles in a Category B journal' },
    ],
    projectsEyebrow: 'Student projects',
    projectsTitle: 'Led by students',
    projectsDescription: 'Research projects initiated and led by VIRaTeC students.',
    projects: [
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
    ],
    startEyebrow: 'Start your own',
    startTitle: 'From idea',
    startAccent: 'to project',
    startSteps: [
      { title: 'Share your idea', description: 'Describe your research idea in a few sentences.' },
      {
        title: 'Find a team',
        description: 'We connect you with students from partner universities.',
      },
      { title: 'Get a supervisor', description: 'A researcher helps you shape the project.' },
      { title: 'Deliver results', description: 'Run the project and present the results.' },
    ],
    ctaTitle: 'Have a research idea?',
    ctaDescription: 'Propose it — we will help you turn it into an international project.',
    ctaAction: 'Propose an idea',
  },
  uk: {
    documentTitle: 'Студентські дослідження',
    breadcrumb: ['Дослідження та проєкти', 'Студентські дослідження'],
    title: 'Студенти очолюють',
    accent: 'дослідження.',
    description:
      'У VIRaTeC студенти — співтворці: вони пропонують ідеї, керують міжнародними командами та отримують наукові результати разом з університетами-партнерами.',
    bannerTitle: 'Від глобальної віртуальної аудиторії до рецензованого журналу.',
    bannerDescription:
      'Шестеро студентів факультету інформаційних технологій КНУ перетворили свої COIL-дослідження на дві статті в Grail of Science — українському журналі категорії Б, опубліковані 1 травня 2026 року.',
    stats: [
      { value: '6', label: 'студентів-авторів' },
      { value: '2', label: 'статті в журналі категорії Б' },
    ],
    projectsEyebrow: 'Студентські проєкти',
    projectsTitle: 'Під керівництвом студентів',
    projectsDescription: 'Дослідницькі проєкти, ініційовані та очолювані студентами VIRaTeC.',
    projects: [
      {
        title: 'Cyber Risks and Business Intelligence',
        description:
          'COIL-модуль з Американським університетом в Еміратах під керівництвом головної керівниці проєктів Анастасії Лобан разом з Антоном Дмитренком.',
      },
      {
        title: 'Модуль Foundations of NLP',
        description:
          'Під керівництвом магістранта Едуарда Пархоменка: 31 команда, 206 студентів, 7 університетів.',
      },
      {
        title: 'Fundamentals of Cyber Hygiene',
        description:
          'Керівниця проєкту Юлія Новічкова (ФІТ КНУ): 87 студентів із 3 українських університетів.',
      },
    ],
    startEyebrow: 'Започаткуйте власний',
    startTitle: 'Від ідеї',
    startAccent: 'до проєкту',
    startSteps: [
      {
        title: 'Поділіться ідеєю',
        description: 'Опишіть свою дослідницьку ідею кількома реченнями.',
      },
      {
        title: 'Знайдіть команду',
        description: 'Ми познайомимо вас зі студентами з університетів-партнерів.',
      },
      {
        title: 'Отримайте наукового керівника',
        description: 'Дослідник допоможе сформувати проєкт.',
      },
      {
        title: 'Досягніть результатів',
        description: 'Реалізуйте проєкт і презентуйте результати.',
      },
    ],
    ctaTitle: 'Маєте дослідницьку ідею?',
    ctaDescription: 'Запропонуйте її — ми допоможемо перетворити її на міжнародний проєкт.',
    ctaAction: 'Запропонувати ідею',
  },
});

export function StudentResearchPage() {
  const content = useLocalized(STUDENT_RESEARCH_CONTENT);
  const common = useCommonMessages();
  useDocumentTitle(content.documentTitle);

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
      <PageSection>
        <HighlightBanner
          title={content.bannerTitle}
          description={content.bannerDescription}
          stats={content.stats}
        />
      </PageSection>

      <PageSection tone="surface" aria-labelledby="student-projects-title">
        <SectionHeader
          id="student-projects-title"
          eyebrow={content.projectsEyebrow}
          title={content.projectsTitle}
          description={content.projectsDescription}
        />
        <ul className="grid gap-6 lg:grid-cols-3">
          {content.projects.map((project) => (
            <li key={project.title}>
              <InfoCard
                withImage
                title={project.title}
                description={project.description}
                linkLabel={common.viewProject}
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
          eyebrow={content.startEyebrow}
          title={content.startTitle}
          accent={content.startAccent}
        />
        <StepsList steps={content.startSteps} />
      </PageSection>

      <CtaSection
        tone="surface"
        title={content.ctaTitle}
        description={content.ctaDescription}
        action={{ label: content.ctaAction, to: ROUTES.CONTACT }}
      />
    </PageLayout>
  );
}

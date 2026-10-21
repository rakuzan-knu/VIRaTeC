import { ROUTES } from '@/shared/config/routes';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { InfoCard } from '@/shared/ui/info-card';
import { StepsList, type StepItem } from '@/shared/ui/steps-list';
import { CtaSection } from '@/shared/ui/cta-section';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { useSeo } from '@/shared/lib';

interface LearningFormat {
  title: string;
  description: string;
  linkLabel: string;
  to: string;
}

interface TitledText {
  title: string;
  description: string;
}

interface ExperientialLearningContent {
  documentTitle: string;
  breadcrumb: string[];
  title: string;
  accent: string;
  description: string;
  formatsEyebrow: string;
  formatsTitle: string;
  formats: LearningFormat[];
  approachEyebrow: string;
  approachTitle: string;
  approachAccent: string;
  principles: StepItem[];
  outcomesEyebrow: string;
  outcomesTitle: string;
  outcomes: TitledText[];
  ctaTitle: string;
  ctaDescription: string;
}

const EXPERIENTIAL_LEARNING_CONTENT = defineMessages<ExperientialLearningContent>({
  en: {
    documentTitle: 'Experiential Learning',
    breadcrumb: ['Research & Projects', 'Experiential Learning'],
    title: 'Learning by',
    accent: 'doing.',
    description:
      'At VIRaTeC students learn through real international projects: they research, collaborate across cultures and deliver results together with partner universities.',
    formatsEyebrow: 'Learning formats',
    formatsTitle: 'How students learn',
    formats: [
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
    ],
    approachEyebrow: 'Our approach',
    approachTitle: 'Three principles',
    approachAccent: 'of every project',
    principles: [
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
    ],
    outcomesEyebrow: 'Outcomes',
    outcomesTitle: 'What students gain',
    outcomes: [
      {
        title: 'Research skills',
        description: 'From formulating a question to presenting results.',
      },
      {
        title: 'Cross-cultural competence',
        description: 'Working with people from different cultures and time zones.',
      },
      {
        title: 'Emotional intelligence',
        description: 'Empathy and communication in virtual teams.',
      },
      {
        title: 'Global teamwork',
        description: 'Delivering one result together with international peers.',
      },
    ],
    ctaTitle: 'Ready to learn by doing?',
    ctaDescription: 'Join the next COIL project or workshop.',
  },
  uk: {
    documentTitle: 'Навчання через досвід',
    breadcrumb: ['Дослідження та проєкти', 'Навчання через досвід'],
    title: 'Навчання',
    accent: 'на практиці.',
    description:
      'У VIRaTeC студенти навчаються через реальні міжнародні проєкти: досліджують, співпрацюють із представниками різних культур і досягають результатів разом з університетами-партнерами.',
    formatsEyebrow: 'Формати навчання',
    formatsTitle: 'Як навчаються студенти',
    formats: [
      {
        title: 'COIL-проєкти',
        description:
          'Collaborative Online International Learning: один спільний проєкт для студентів із різних країн і університетів.',
        linkLabel: 'Переглянути проєкти →',
        to: ROUTES.PROJECTS,
      },
      {
        title: 'Синхронні онлайн-воркшопи',
        description:
          'Живі сесії та рольові симуляції, як-от переговори щодо офшорної вітрової електростанції з Університетом Джонса Гопкінса.',
        linkLabel: 'Переглянути події →',
        to: ROUTES.PUBLICATIONS,
      },
      {
        title: 'Сертифіковані модулі',
        description:
          'Сертифіковані модулі Research-Based Learning, у яких магістранти проводять воркшопи для міжнародних груп.',
        linkLabel: 'Дізнатися більше →',
        to: ROUTES.OPPORTUNITIES,
      },
    ],
    approachEyebrow: 'Наш підхід',
    approachTitle: 'Три принципи',
    approachAccent: 'кожного проєкту',
    principles: [
      {
        title: 'Ідея → результат',
        description:
          'Кожен проєкт починається зі студентської ідеї та завершується відчутним результатом.',
      },
      {
        title: 'Виклик → співпраця',
        description: 'Команди з різних країн разом розв’язують одну реальну проблему.',
      },
      {
        title: 'Знання → впровадження',
        description: 'Здобуті знання застосовуються на практиці, а не лише на іспитах.',
      },
    ],
    outcomesEyebrow: 'Результати',
    outcomesTitle: 'Що отримують студенти',
    outcomes: [
      {
        title: 'Дослідницькі навички',
        description: 'Від формулювання питання до презентації результатів.',
      },
      {
        title: 'Міжкультурна компетентність',
        description: 'Робота з людьми з різних культур і часових поясів.',
      },
      {
        title: 'Емоційний інтелект',
        description: 'Емпатія та комунікація у віртуальних командах.',
      },
      {
        title: 'Глобальна командна робота',
        description: 'Спільне досягнення результату з міжнародними колегами.',
      },
    ],
    ctaTitle: 'Готові навчатися на практиці?',
    ctaDescription: 'Долучайтеся до наступного COIL-проєкту чи воркшопу.',
  },
});

export function ExperientialLearningPage() {
  const content = useLocalized(EXPERIENTIAL_LEARNING_CONTENT);
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

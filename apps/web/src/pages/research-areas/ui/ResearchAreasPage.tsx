import { ROUTES } from '@/shared/config/routes';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { InfoCard } from '@/shared/ui/info-card';
import { HighlightBanner } from '@/shared/ui/highlight-banner';
import { CtaSection } from '@/shared/ui/cta-section';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { useDocumentTitle } from '@/shared/lib';

const RESEARCH_AREAS_CONTENT = defineMessages({
  en: {
    documentTitle: 'Research Areas',
    breadcrumb: ['Research & Projects', 'Research Areas'],
    title: 'Our research',
    accent: 'areas.',
    description:
      'VIRaTeC brings together IT, linguistics and education. Every area connects students and researchers from KNU with colleagues from partner universities.',
    areasEyebrow: 'Research areas',
    areasTitle: 'Where we work',
    areasDescription:
      'Each area is explored by mixed international teams through COIL projects, workshops and certified modules.',
    areas: [
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
    ],
    bannerTitle: 'Every area is explored by mixed international teams.',
    bannerDescription:
      'Students and researchers from Kyiv work together with partners from the UK, Colombia, Chile, the UAE and India on one shared research question.',
    stats: [
      { value: '14', label: 'partner universities' },
      { value: '8', label: 'countries' },
    ],
    futureEyebrow: 'Interdisciplinary models',
    futureTitle: 'Language meets discipline',
    futureDescription:
      'ESP/EAP courses combined with other fields, so that language competence and subject expertise grow together.',
    futureDirections: [
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
    ],
    discussProject: 'Discuss a project →',
    ctaTitle: 'Want to research with us?',
    ctaDescription: 'Join an existing area or propose a new direction together with your team.',
  },
  uk: {
    documentTitle: 'Напрями досліджень',
    breadcrumb: ['Дослідження та проєкти', 'Напрями досліджень'],
    title: 'Наші напрями',
    accent: 'досліджень.',
    description:
      'VIRaTeC поєднує ІТ, лінгвістику та освіту. Кожен напрям об’єднує студентів і дослідників КНУ з колегами з університетів-партнерів.',
    areasEyebrow: 'Напрями досліджень',
    areasTitle: 'Де ми працюємо',
    areasDescription:
      'Кожен напрям досліджують змішані міжнародні команди через COIL-проєкти, воркшопи та сертифіковані модулі.',
    areas: [
      {
        title: 'Кібербезпека',
        description:
          'Кіберризики, бізнес-аналітика та кібергігієна, які вивчають міжнародні студентські команди в сертифікованих COIL-модулях.',
      },
      {
        title: 'NLP та ШІ',
        description:
          'Foundations of NLP: від попередньої обробки тексту до аналізу тональності — 206 студентів із 7 університетів і компанії Chartbeat.',
      },
      {
        title: 'Освіта та EdTech',
        description:
          'COIL, віртуальний обмін і Research-Based Learning, що перетворюють студентів на дослідників і громадян світу.',
      },
    ],
    bannerTitle: 'Кожен напрям досліджують змішані міжнародні команди.',
    bannerDescription:
      'Студенти та дослідники з Києва працюють разом із партнерами з Великої Британії, Колумбії, Чилі, ОАЕ та Індії над одним спільним дослідницьким питанням.',
    stats: [
      { value: '14', label: 'університетів-партнерів' },
      { value: '8', label: 'країн' },
    ],
    futureEyebrow: 'Міждисциплінарні моделі',
    futureTitle: 'Мова зустрічає фах',
    futureDescription:
      'Курси ESP/EAP у поєднанні з іншими галузями, щоб мовна компетентність і фахова експертиза зростали разом.',
    futureDirections: [
      {
        title: 'Міжкультурна комунікація',
        description:
          'ESP + міжкультурна комунікація: pre-COIL воркшопи та глобальна командна робота.',
      },
      {
        title: 'Аналітика даних і сторітелінг',
        description: 'ESP/EAP + аналітика даних: Data-Driven Decision Making Across Borders.',
      },
      {
        title: 'Геронтологія та цифрове суспільство',
        description:
          'ESP/EAP + геронтологія: міждисциплінарний COIL з Університетом штату Джорджія, Perimeter College.',
      },
    ],
    discussProject: 'Обговорити проєкт →',
    ctaTitle: 'Хочете досліджувати з нами?',
    ctaDescription:
      'Долучайтеся до наявного напряму або запропонуйте новий разом зі своєю командою.',
  },
});

export function ResearchAreasPage() {
  const content = useLocalized(RESEARCH_AREAS_CONTENT);
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
      <PageSection aria-labelledby="areas-title">
        <SectionHeader
          id="areas-title"
          eyebrow={content.areasEyebrow}
          title={content.areasTitle}
          description={content.areasDescription}
        />
        <ul className="grid gap-6 lg:grid-cols-3">
          {content.areas.map((area) => (
            <li key={area.title}>
              <InfoCard
                withImage
                title={area.title}
                description={area.description}
                linkLabel={common.seeProjects}
                to={ROUTES.PROJECTS}
                className="lg:min-h-[405px]"
              />
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection tone="surface">
        <HighlightBanner
          title={content.bannerTitle}
          description={content.bannerDescription}
          stats={content.stats}
        />
      </PageSection>

      <PageSection aria-labelledby="future-title">
        <SectionHeader
          id="future-title"
          eyebrow={content.futureEyebrow}
          title={content.futureTitle}
          description={content.futureDescription}
        />
        <ul className="grid gap-6 lg:grid-cols-3">
          {content.futureDirections.map((direction) => (
            <li key={direction.title}>
              <InfoCard
                variant="muted"
                title={direction.title}
                description={direction.description}
                linkLabel={content.discussProject}
                to={ROUTES.CONTACT}
                className="lg:min-h-[197px]"
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

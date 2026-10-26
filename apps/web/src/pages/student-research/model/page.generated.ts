import type { Localized } from '@/shared/i18n/model/types';
import type { StudentResearchContent } from './content';
import asset_studentresearchpage_projects_1_image from '@/shared/assets/contentful/studentresearchpage-projects-1-image.webp';
import asset_studentresearchpage_projects_2_image from '@/shared/assets/contentful/studentresearchpage-projects-2-image.webp';
import asset_studentresearchpage_projects_3_image from '@/shared/assets/contentful/studentresearchpage-projects-3-image.webp';

export const PAGE_TEXT: Localized<StudentResearchContent> = {
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
      { value: '8', label: 'students published in Category B journals' },
      { value: '4', label: 'students published in Scopus-indexed journals' },
    ],
    projectsEyebrow: 'Student projects',
    projectsTitle: 'Led by students',
    projectsDescription: 'Research projects initiated and led by VIRaTeC students.',
    projects: [
      {
        title: 'Cyber Risks and Business Intelligence',
        description:
          'A COIL module with the American University in the Emirates, led by Head Project Lead Anastasiia Loban with Anton Dmytrenko.',
        image: asset_studentresearchpage_projects_1_image,
      },
      {
        title: 'Foundations of NLP module',
        description:
          'Led by Master’s student Eduard Parkhomenko: 31 teams, 206 students, 8 universities.',
        image: asset_studentresearchpage_projects_2_image,
      },
      {
        title: 'Fundamentals of Cyber Hygiene',
        description:
          'Project Lead Yuliia Novichkova (KNU FIT): 87 students from 3 Ukrainian universities.',
        image: asset_studentresearchpage_projects_3_image,
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
      { value: '8', label: 'студентів опублікувалися в журналах категорії Б' },
      { value: '4', label: 'студенти опублікувалися в журналах Scopus' },
    ],
    projectsEyebrow: 'Студентські проєкти',
    projectsTitle: 'Під керівництвом студентів',
    projectsDescription: 'Дослідницькі проєкти, ініційовані та очолювані студентами VIRaTeC.',
    projects: [
      {
        title: 'Cyber Risks and Business Intelligence',
        description:
          'COIL-модуль з Американським університетом в Еміратах під керівництвом головної керівниці проєктів Анастасії Лобан разом з Антоном Дмитренком.',
        image: asset_studentresearchpage_projects_1_image,
      },
      {
        title: 'Модуль Foundations of NLP',
        description:
          'Під керівництвом магістранта Едуарда Пархоменка: 31 команда, 206 студентів, 8 університетів.',
        image: asset_studentresearchpage_projects_2_image,
      },
      {
        title: 'Fundamentals of Cyber Hygiene',
        description:
          'Керівниця проєкту Юлія Новічкова (ФІТ КНУ): 87 студентів із 3 українських університетів.',
        image: asset_studentresearchpage_projects_3_image,
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
};

import { ROUTES } from '@/shared/config/routes';
import { defineMessages } from '@/shared/i18n';
import type { StepItem } from '@/shared/ui/steps-list';

export interface Milestone {
  date: string;
  title: string;
  description: string;
  isUpcoming?: boolean;
}

interface Stat {
  value: string;
  label: string;
}

interface TitledText {
  title: string;
  description: string;
}

interface Principle extends TitledText {
  to: string;
}

export interface ViratecContent {
  documentTitle: string;
  breadcrumb: string[];
  title: string;
  accent: string;
  description: string;
  whatIsEyebrow: string;
  whatIsTitle: string;
  whatIsDescription: string;
  videoTitle: string;
  stats: Stat[];
  journeyEyebrow: string;
  journeyTitle: string;
  journeyAccent: string;
  milestones: Milestone[];
  participantsEyebrow: string;
  participantsTitle: string;
  participants: TitledText[];
  coilEyebrow: string;
  coilTitle: string;
  coilDescription: string;
  principles: Principle[];
  joinEyebrow: string;
  joinTitle: string;
  joinAccent: string;
  joinSteps: StepItem[];
  ctaTitle: string;
  ctaDescription: string;
}

export const VIRATEC_CONTENT = defineMessages<ViratecContent>({
  en: {
    documentTitle: 'About VIRaTeC',
    breadcrumb: ['About', 'VIRaTeC'],
    title: 'One community,',
    accent: 'many countries.',
    description:
      'VIRaTeC — Virtual Innovative Research & Technology Community. Students, educators, researchers and innovators connected through AI, EdTech and international collaboration.',
    whatIsEyebrow: 'What is VIRaTeC',
    whatIsTitle: 'What is VIRaTeC?',
    whatIsDescription:
      'Watch how students, educators and researchers from partner universities in 8 countries learn and do research together, online and across borders.',
    videoTitle: 'What is VIRaTeC?',
    stats: [
      { value: '14', label: 'partner universities named in projects' },
      { value: '8', label: 'countries' },
      { value: '360', label: 'participants in three 2025–2026 modules' },
      { value: '142', label: 'members of the LinkedIn community' },
    ],
    journeyEyebrow: 'Our journey',
    journeyTitle: 'From an idea',
    journeyAccent: 'to a global community',
    milestones: [
      {
        date: '2019',
        title: 'Where it started',
        description:
          'Dr. Larysa Liashenko starts international virtual exchanges that connect KNU students with peers in the UK, the USA, Asia and Europe.',
      },
      {
        date: 'April 2025',
        title: 'Cybersecurity in Action',
        description:
          'A Cybersecurity Essentials COIL pilot with partners in Colombia and Chile is presented at the VIII International PCSICS Conference on 11 April 2025.',
      },
      {
        date: 'April 2025',
        title: 'VIRaTeC Global Community',
        description:
          'The VIRaTeC Global Community at KNU opens to students, educators, researchers and innovators worldwide.',
      },
      {
        date: 'June 2025',
        title: 'COIL + CyberBridge Talks',
        description:
          'Three concurrent COIL modules with Coventry University, Universidad Católica de Colombia, Santo Tomás, the American University in the Emirates and Karunya Institute end with certificates on 5 June. KNU names the students’ project the first intercontinental virtual research (COIL) project.',
      },
      {
        date: 'February 2026',
        title: 'Foundations of NLP',
        description:
          'An 8-week certified Research-Based Learning module starts on 16 February: 206 students from 7 universities and Chartbeat, 31 international teams.',
      },
      {
        date: 'Spring 2026',
        title: 'Data-Driven Decision Making Across Borders',
        description:
          'An 8-week COIL with Coventry University, the University of Florida and the KNU Faculty of Economics: 67 students.',
      },
      {
        date: 'May 2026',
        title: 'Student research published',
        description:
          'Six KNU FIT students publish two articles in Grail of Science, a Category B journal, on 1 May 2026.',
      },
      {
        date: 'June 2026',
        title: 'Digital Narratives 2026',
        description:
          'A KNU conference on 8 June presents the results of certified COIL modules to nearly 100 participants.',
      },
      {
        date: 'September 2026',
        title: 'Global Collaboration Framework with Johns Hopkins',
        description:
          'An author-led workshop by Dr. Kelly Tzoumis (JHU) for 54 students and faculty, followed by the online event “From Student Ideas to Global Research” on 15 September.',
      },
      {
        date: 'October 2026',
        title: 'Tyshchenko Legacy Conference at KNU',
        description:
          'The II International Scientific Conference on 14–15 October, where Dr. Larysa Liashenko gives a plenary talk on the global student collaboration network.',
      },
    ],
    participantsEyebrow: 'Who takes part',
    participantsTitle: 'People behind the community',
    participants: [
      {
        title: 'Students',
        description: 'Join international teams, lead projects and earn certificates.',
      },
      {
        title: 'Researchers',
        description: 'Supervise projects and run joint research with colleagues abroad.',
      },
      {
        title: 'Partner universities',
        description: 'Co-design modules and send mixed student teams.',
      },
      { title: 'Experts', description: 'Share practice in talks, workshops and mentoring.' },
    ],
    coilEyebrow: 'COIL format',
    coilTitle: 'How we work',
    coilDescription:
      'Every VIRaTeC activity follows three principles that turn learning into real results.',
    principles: [
      {
        title: 'From idea to outcome',
        description:
          'Every project starts with a student idea and ends with a tangible result: a paper, a prototype or a presentation.',
        to: ROUTES.STUDENT_RESEARCH,
      },
      {
        title: 'From challenge to collaboration',
        description:
          'Real-world challenges are solved by mixed international teams working online across time zones.',
        to: ROUTES.PROJECTS,
      },
      {
        title: 'From knowledge to implementation',
        description:
          'Knowledge from modules and COIL CyberBridge Talks is applied directly in research and practice.',
        to: ROUTES.EXPERIENTIAL_LEARNING,
      },
    ],
    joinEyebrow: 'How to join',
    joinTitle: 'Become part',
    joinAccent: 'of VIRaTeC',
    joinSteps: [
      {
        title: 'Choose a format',
        description: 'Pick a COIL project, a workshop or a certified module.',
      },
      { title: 'Apply', description: 'Register for a module or write to coil.knu@gmail.com.' },
      {
        title: 'Meet your team',
        description: 'Get matched with students from partner universities.',
      },
      { title: 'Create together', description: 'Work on the project and present the results.' },
    ],
    ctaTitle: 'Ready to join VIRaTeC?',
    ctaDescription:
      'Find a program, a project or a workshop that fits you and become part of the community.',
  },
  uk: {
    documentTitle: 'Про VIRaTeC',
    breadcrumb: ['Про нас', 'VIRaTeC'],
    title: 'Одна спільнота,',
    accent: 'багато країн.',
    description:
      'VIRaTeC — Virtual Innovative Research & Technology Community. Студенти, викладачі, дослідники та інноватори, об’єднані завдяки ШІ, EdTech і міжнародній співпраці.',
    whatIsEyebrow: 'Що таке VIRaTeC',
    whatIsTitle: 'Що таке VIRaTeC?',
    whatIsDescription:
      'Подивіться, як студенти, викладачі та дослідники з університетів-партнерів у 8 країнах разом навчаються й досліджують — онлайн і без кордонів.',
    videoTitle: 'Що таке VIRaTeC?',
    stats: [
      { value: '14', label: 'університетів-партнерів, залучених до проєктів' },
      { value: '8', label: 'країн' },
      { value: '360', label: 'учасників трьох модулів 2025–2026 років' },
      { value: '142', label: 'учасники спільноти в LinkedIn' },
    ],
    journeyEyebrow: 'Наш шлях',
    journeyTitle: 'Від ідеї',
    journeyAccent: 'до глобальної спільноти',
    milestones: [
      {
        date: '2019',
        title: 'З чого все почалося',
        description:
          'Д-р Лариса Ляшенко започатковує міжнародні віртуальні обміни, що об’єднують студентів КНУ з однолітками з Великої Британії, США, Азії та Європи.',
      },
      {
        date: 'Квітень 2025',
        title: 'Cybersecurity in Action',
        description:
          'Пілотний COIL Cybersecurity Essentials з партнерами з Колумбії та Чилі представлено на VIII Міжнародній конференції PCSICS 11 квітня 2025 року.',
      },
      {
        date: 'Квітень 2025',
        title: 'Глобальна спільнота VIRaTeC',
        description:
          'Глобальна спільнота VIRaTeC при КНУ відкривається для студентів, викладачів, дослідників та інноваторів з усього світу.',
      },
      {
        date: 'Червень 2025',
        title: 'COIL + CyberBridge Talks',
        description:
          'Три паралельні COIL-модулі з Університетом Ковентрі, Universidad Católica de Colombia, Santo Tomás, Американським університетом в Еміратах і Karunya Institute завершуються врученням сертифікатів 5 червня. КНУ називає студентський проєкт першим міжконтинентальним віртуальним дослідницьким (COIL) проєктом.',
      },
      {
        date: 'Лютий 2026',
        title: 'Foundations of NLP',
        description:
          '16 лютого стартує 8-тижневий сертифікований модуль Research-Based Learning: 206 студентів із 7 університетів і компанії Chartbeat, 31 міжнародна команда.',
      },
      {
        date: 'Весна 2026',
        title: 'Data-Driven Decision Making Across Borders',
        description:
          '8-тижневий COIL з Університетом Ковентрі, Університетом Флориди та економічним факультетом КНУ: 67 студентів.',
      },
      {
        date: 'Травень 2026',
        title: 'Опубліковано студентські дослідження',
        description:
          '1 травня 2026 року шестеро студентів ФІТ КНУ публікують дві статті в Grail of Science — журналі категорії Б.',
      },
      {
        date: 'Червень 2026',
        title: 'Digital Narratives 2026',
        description:
          'Конференція КНУ 8 червня представляє результати сертифікованих COIL-модулів майже 100 учасникам.',
      },
      {
        date: 'Вересень 2026',
        title: 'Global Collaboration Framework з Університетом Джонса Гопкінса',
        description:
          'Авторський воркшоп д-ра Келлі Цуміс (JHU) для 54 студентів і викладачів, а 15 вересня — онлайн-подія «From Student Ideas to Global Research».',
      },
      {
        date: 'Жовтень 2026',
        title: 'Конференція в КНУ, присвячена спадщині Тищенка',
        description:
          'ІІ Міжнародна наукова конференція 14–15 жовтня, на якій д-р Лариса Ляшенко виступає з пленарною доповіддю про глобальну мережу студентської співпраці.',
      },
    ],
    participantsEyebrow: 'Хто бере участь',
    participantsTitle: 'Люди, що творять спільноту',
    participants: [
      {
        title: 'Студенти',
        description: 'Працюють у міжнародних командах, очолюють проєкти й отримують сертифікати.',
      },
      {
        title: 'Дослідники',
        description: 'Керують проєктами та проводять спільні дослідження з колегами з-за кордону.',
      },
      {
        title: 'Університети-партнери',
        description: 'Спільно розробляють модулі та формують змішані студентські команди.',
      },
      {
        title: 'Експерти',
        description: 'Діляться практичним досвідом у доповідях, воркшопах і менторстві.',
      },
    ],
    coilEyebrow: 'Формат COIL',
    coilTitle: 'Як ми працюємо',
    coilDescription:
      'Кожна активність VIRaTeC ґрунтується на трьох принципах, що перетворюють навчання на реальні результати.',
    principles: [
      {
        title: 'Від ідеї до результату',
        description:
          'Кожен проєкт починається зі студентської ідеї та завершується відчутним результатом: статтею, прототипом чи презентацією.',
        to: ROUTES.STUDENT_RESEARCH,
      },
      {
        title: 'Від виклику до співпраці',
        description:
          'Реальні проблеми розв’язують змішані міжнародні команди, що працюють онлайн у різних часових поясах.',
        to: ROUTES.PROJECTS,
      },
      {
        title: 'Від знань до впровадження',
        description:
          'Знання з модулів і COIL CyberBridge Talks безпосередньо застосовуються в дослідженнях і на практиці.',
        to: ROUTES.EXPERIENTIAL_LEARNING,
      },
    ],
    joinEyebrow: 'Як долучитися',
    joinTitle: 'Станьте частиною',
    joinAccent: 'VIRaTeC',
    joinSteps: [
      {
        title: 'Оберіть формат',
        description: 'COIL-проєкт, воркшоп або сертифікований модуль.',
      },
      {
        title: 'Подайте заявку',
        description: 'Зареєструйтеся на модуль або напишіть на coil.knu@gmail.com.',
      },
      {
        title: 'Познайомтеся з командою',
        description: 'Ми підберемо вам команду зі студентів університетів-партнерів.',
      },
      {
        title: 'Творіть разом',
        description: 'Працюйте над проєктом і презентуйте результати.',
      },
    ],
    ctaTitle: 'Готові долучитися до VIRaTeC?',
    ctaDescription:
      'Знайдіть програму, проєкт або воркшоп, що вам підходить, і станьте частиною спільноти.',
  },
});

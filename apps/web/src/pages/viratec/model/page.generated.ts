import type { Localized } from '@/shared/i18n/model/types';
import type { ViratecText } from './content';
import { ROUTES } from '@/shared/config/routes';
import asset_viratecpage_principles_1_image from '@/shared/assets/contentful/viratecpage-principles-1-image.webp';
import asset_viratecpage_principles_2_image from '@/shared/assets/contentful/viratecpage-principles-2-image.webp';
import asset_viratecpage_principles_3_image from '@/shared/assets/contentful/viratecpage-principles-3-image.webp';

export const PAGE_TEXT: Localized<ViratecText> = {
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
      'Watch how students, educators and researchers from partner universities in 10 countries learn and do research together, online and across borders.',
    videoTitle: 'What is VIRaTeC?',
    videoTranscriptLabel: 'Text version of the video (the video has no sound)',
    videoTranscript: [
      'VIRaTeC — Virtual Innovative Research & Technology Community, Taras Shevchenko National University of Kyiv.',
      'One community, many countries. Students, educators, researchers and innovators connected through AI, EdTech and international collaboration.',
      'Learning and research across borders: 500+ students worldwide, 15+ partner universities, 10 partner countries, 5 industry and research partners.',
      'Research that crosses borders and disciplines. Since 2019 VIRaTeC has been building inclusive virtual environments where students from different countries work together on joint projects and research using AI, EdTech and COIL.',
      'From an idea to a global community: 2019 — where it started; April 2025 — VIRaTeC Global Community; 2025 — COIL + CyberBridge Talks; February 2026 — Foundations of NLP; May 2026 — student research published; June 2026 — Digital Narratives 2026; September 2026 — workshops with Johns Hopkins; October 2026 — international conference at KNU.',
      'How we work: 1. Idea → outcome: every project starts with a student idea and ends with a tangible research result. 2. Challenge → collaboration: mixed international teams solve real problems across cultures and time zones. 3. Knowledge → implementation: workshops and mentoring turn what students learn into applied solutions.',
      '15+ partner universities in 10 countries, including Johns Hopkins University, Coventry University, Georgia State University, the University of Florida, Karunya Institute of Technology and École Nationale Polytechnique.',
      'Become part of the VIRaTeC network: coil.knu@gmail.com.',
    ],
    stats: [
      { value: '500+', label: 'students from the Americas, Europe, Africa and Asia' },
      { value: '15+', label: 'partner universities worldwide' },
      { value: '10', label: 'partner countries' },
      { value: '5', label: 'industry & research partners' },
    ],
    journeyEyebrow: 'Our journey',
    journeyTitle: 'From an idea',
    journeyAccent: 'to a global community',
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
        image: asset_viratecpage_principles_1_image,
      },
      {
        title: 'From challenge to collaboration',
        description:
          'Real-world challenges are solved by mixed international teams working online across time zones.',
        to: ROUTES.PROJECTS,
        image: asset_viratecpage_principles_2_image,
      },
      {
        title: 'From knowledge to implementation',
        description:
          'Knowledge from modules and COIL CyberBridge Talks is applied directly in research and practice.',
        to: ROUTES.EXPERIENTIAL_LEARNING,
        image: asset_viratecpage_principles_3_image,
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
    momentsEyebrow: 'Moments',
    momentsTitle: 'Life of',
    momentsAccent: 'the network.',
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
      'Подивіться, як студенти, викладачі та дослідники з університетів-партнерів у 10 країнах разом навчаються й досліджують — онлайн і без кордонів.',
    videoTitle: 'Що таке VIRaTeC?',
    videoTranscriptLabel: 'Текстова версія відео (відео без звуку)',
    videoTranscript: [
      'VIRaTeC — Virtual Innovative Research & Technology Community, Київський національний університет імені Тараса Шевченка.',
      'Одна спільнота, багато країн. Студенти, викладачі, дослідники та інноватори, об’єднані завдяки ШІ, EdTech і міжнародній співпраці.',
      'Навчання й дослідження без кордонів: 500+ студентів у світі, 15+ університетів-партнерів, 10 країн-партнерів, 5 індустріальних і дослідницьких партнерів.',
      'Дослідження, що перетинають кордони й дисципліни. З 2019 року VIRaTeC створює інклюзивні віртуальні середовища, де студенти з різних країн разом працюють над спільними проєктами й дослідженнями за допомогою ШІ, EdTech і COIL.',
      'Від ідеї до глобальної спільноти: 2019 — з чого все почалося; квітень 2025 — VIRaTeC Global Community; 2025 — COIL + CyberBridge Talks; лютий 2026 — Foundations of NLP; травень 2026 — опубліковано студентські дослідження; червень 2026 — Digital Narratives 2026; вересень 2026 — воркшопи з Johns Hopkins; жовтень 2026 — міжнародна конференція в КНУ.',
      'Як ми працюємо: 1. Ідея → результат: кожен проєкт починається зі студентської ідеї й завершується відчутним дослідницьким результатом. 2. Виклик → співпраця: змішані міжнародні команди розв’язують реальні задачі в різних культурах і часових поясах. 3. Знання → впровадження: воркшопи й менторство перетворюють здобуті знання на прикладні рішення.',
      '15+ університетів-партнерів у 10 країнах, серед них Університет Джонса Гопкінса, Ковентрійський університет, Університет штату Джорджія, Університет Флориди, Інститут технологій Каруньї та Національна політехнічна школа.',
      'Долучайтеся до мережі VIRaTeC: coil.knu@gmail.com.',
    ],
    stats: [
      { value: '500+', label: 'студентів з Америки, Європи, Африки та Азії' },
      { value: '15+', label: 'університетів-партнерів у світі' },
      { value: '10', label: 'країн-партнерів' },
      { value: '5', label: 'індустріальних і дослідницьких партнерів' },
    ],
    journeyEyebrow: 'Наш шлях',
    journeyTitle: 'Від ідеї',
    journeyAccent: 'до глобальної спільноти',
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
        image: asset_viratecpage_principles_1_image,
      },
      {
        title: 'Від виклику до співпраці',
        description:
          'Реальні проблеми розв’язують змішані міжнародні команди, що працюють онлайн у різних часових поясах.',
        to: ROUTES.PROJECTS,
        image: asset_viratecpage_principles_2_image,
      },
      {
        title: 'Від знань до впровадження',
        description:
          'Знання з модулів і COIL CyberBridge Talks безпосередньо застосовуються в дослідженнях і на практиці.',
        to: ROUTES.EXPERIENTIAL_LEARNING,
        image: asset_viratecpage_principles_3_image,
      },
    ],
    joinEyebrow: 'Як долучитися',
    joinTitle: 'Станьте частиною',
    joinAccent: 'VIRaTeC',
    joinSteps: [
      { title: 'Оберіть формат', description: 'COIL-проєкт, воркшоп або сертифікований модуль.' },
      {
        title: 'Подайте заявку',
        description: 'Зареєструйтеся на модуль або напишіть на coil.knu@gmail.com.',
      },
      {
        title: 'Познайомтеся з командою',
        description: 'Ми підберемо вам команду зі студентів університетів-партнерів.',
      },
      { title: 'Творіть разом', description: 'Працюйте над проєктом і презентуйте результати.' },
    ],
    momentsEyebrow: 'Моменти',
    momentsTitle: 'Життя',
    momentsAccent: 'мережі.',
    ctaTitle: 'Готові долучитися до VIRaTeC?',
    ctaDescription:
      'Знайдіть програму, проєкт або воркшоп, що вам підходить, і станьте частиною спільноти.',
  },
};

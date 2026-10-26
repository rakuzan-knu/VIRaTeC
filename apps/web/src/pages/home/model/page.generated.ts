import type { Localized } from '@/shared/i18n/model/types';
import type { HomeText } from './content';
import { ROUTES } from '@/shared/config/routes';

export const PAGE_TEXT: Localized<HomeText> = {
  en: {
    hero: {
      eyebrow: 'Virtual Innovative Research & Technology Community',
      titleLine: 'Where ambitious minds',
      titleAccent: 'move research forward.',
      description:
        'A global academic and industry community at Taras Shevchenko National University of Kyiv, connecting students, educators and researchers through AI, EdTech and international collaboration.',
      researchAction: 'Our Research',
      collaborateAction: 'Collaborate',
      partnersCaption: 'In collaboration with',
    },
    about: {
      eyebrow: 'About VIRaTeC',
      title: 'Research that crosses',
      titleAccent: 'borders and disciplines.',
      description:
        'Since 2019 Dr. Larysa Liashenko and colleagues have been building international virtual learning experiences. VIRaTeC connects students from different countries in joint projects and research through AI, EdTech and COIL.',
      action: 'Learn More',
      pillars: [
        {
          title: 'Idea → outcome',
          description:
            'Every project starts with a student idea and ends with a tangible research result.',
          index: '01',
        },
        {
          title: 'Challenge → collaboration',
          description:
            'Mixed international teams solve real problems across cultures and time zones.',
          index: '02',
        },
        {
          title: 'Knowledge → implementation',
          description: 'Workshops and mentoring turn what students learn into applied solutions.',
          index: '03',
        },
      ],
      stats: [
        { value: '500+', label: 'students from the Americas, Europe, Africa and Asia' },
        { value: '15+', label: 'partner universities worldwide' },
        { value: '10', label: 'partner countries' },
      ],
    },
    research: {
      eyebrow: 'Research & Projects',
      title: 'What we work on',
      action: 'View All Projects',
      cardAction: 'Explore',
      projects: [
        {
          title: 'Cybersecurity',
          description:
            'COIL modules on cyber risks, business intelligence and cyber hygiene, led by master’s students with partners in the UK, the UAE, Colombia, Chile and India.',
          to: ROUTES.PROJECTS,
        },
        {
          title: 'Foundations of NLP',
          description:
            'An 8-week certified module led by a Master’s student: 31 international teams, 206 students from 8 universities.',
          to: ROUTES.PROJECTS,
        },
        {
          title: 'Data-driven decision making',
          description:
            'An 8-week COIL with Coventry University and the University of Florida: 67 students worked with modern data analytics tools.',
          to: ROUTES.PROJECTS,
        },
      ],
      highlightTitle: 'Students don’t just join research — they lead it.',
      highlightDescription:
        'Master’s students design cases, lead workshops and mentor international teams of undergraduates in certified Research-Based Learning modules.',
      highlightNumbers: [
        { value: '31', label: 'international teams' },
        { value: '8', label: 'weeks per module' },
      ],
    },
    publications: {
      eyebrow: 'Publications & Media',
      title: 'Latest from VIRaTeC',
      action: 'All Publications',
      cardAction: 'Read more',
    },
    getInvolved: {
      eyebrow: 'Get Involved',
      titleLine: 'Become part of the',
      titleAccent: 'VIRaTeC network.',
      action: 'Join Us',
      audiences: [
        {
          title: 'For students',
          description:
            'Join a certified COIL module, lead workshops as a master’s student and prepare your research for publication.',
        },
        {
          title: 'For researchers',
          description:
            'Co-supervise student projects and run joint research with colleagues from partner universities.',
        },
        {
          title: 'For partners',
          description: 'Bring your university or organisation into VIRaTeC COIL projects.',
        },
      ],
    },
  },
  uk: {
    hero: {
      eyebrow: 'Віртуальна інноваційна дослідницька та технологічна спільнота',
      titleLine: 'Де амбітні уми',
      titleAccent: 'рухають науку вперед.',
      description:
        'Глобальна академічна та індустріальна спільнота при Київському національному університеті імені Тараса Шевченка, що об’єднує студентів, викладачів і дослідників через ШІ, EdTech та міжнародну співпрацю.',
      researchAction: 'Наші дослідження',
      collaborateAction: 'Співпрацювати',
      partnersCaption: 'У співпраці з',
    },
    about: {
      eyebrow: 'Про VIRaTeC',
      title: 'Дослідження, що долають',
      titleAccent: 'кордони та межі дисциплін.',
      description:
        'З 2019 року д-р Лариса Ляшенко та колеги створюють міжнародні програми віртуального навчання. VIRaTeC об’єднує студентів із різних країн у спільних проєктах і дослідженнях через ШІ, EdTech та COIL.',
      action: 'Дізнатися більше',
      pillars: [
        {
          title: 'Ідея → результат',
          description:
            'Кожен проєкт починається зі студентської ідеї та завершується відчутним науковим результатом.',
          index: '01',
        },
        {
          title: 'Виклик → співпраця',
          description:
            'Змішані міжнародні команди розв’язують реальні проблеми, долаючи культурні відмінності та часові пояси.',
          index: '02',
        },
        {
          title: 'Знання → впровадження',
          description:
            'Воркшопи та менторство перетворюють здобуті студентами знання на прикладні рішення.',
          index: '03',
        },
      ],
      stats: [
        { value: '500+', label: 'студентів з Америки, Європи, Африки та Азії' },
        { value: '15+', label: 'університетів-партнерів у світі' },
        { value: '10', label: 'країн-партнерів' },
      ],
    },
    research: {
      eyebrow: 'Дослідження та проєкти',
      title: 'Над чим ми працюємо',
      action: 'Усі проєкти',
      cardAction: 'Детальніше',
      projects: [
        {
          title: 'Кібербезпека',
          description:
            'COIL-модулі з кіберризиків, бізнес-аналітики та кібергігієни під керівництвом магістрантів разом із партнерами з Великої Британії, ОАЕ, Колумбії, Чилі та Індії.',
          to: ROUTES.PROJECTS,
        },
        {
          title: 'Основи NLP',
          description:
            '8-тижневий сертифікований модуль під керівництвом магістранта: 31 міжнародна команда, 206 студентів із 8 університетів.',
          to: ROUTES.PROJECTS,
        },
        {
          title: 'Ухвалення рішень на основі даних',
          description:
            '8-тижневий COIL з Університетом Ковентрі та Університетом Флориди: 67 студентів працювали із сучасними інструментами аналізу даних.',
          to: ROUTES.PROJECTS,
        },
      ],
      highlightTitle: 'Студенти не просто долучаються до досліджень — вони їх очолюють.',
      highlightDescription:
        'Магістранти розробляють кейси, проводять воркшопи та менторять міжнародні команди бакалаврів у сертифікованих модулях Research-Based Learning.',
      highlightNumbers: [
        { value: '31', label: 'міжнародна команда' },
        { value: '8', label: 'тижнів на модуль' },
      ],
    },
    publications: {
      eyebrow: 'Публікації та медіа',
      title: 'Останнє від VIRaTeC',
      action: 'Усі публікації',
      cardAction: 'Читати далі',
    },
    getInvolved: {
      eyebrow: 'Долучайтеся',
      titleLine: 'Станьте частиною',
      titleAccent: 'мережі VIRaTeC.',
      action: 'Приєднатися',
      audiences: [
        {
          title: 'Для студентів',
          description:
            'Пройдіть сертифікований COIL-модуль, проводьте воркшопи як магістрант і підготуйте своє дослідження до публікації.',
        },
        {
          title: 'Для дослідників',
          description:
            'Станьте співкерівником студентських проєктів і проводьте спільні дослідження з колегами з університетів-партнерів.',
        },
        {
          title: 'Для партнерів',
          description: 'Залучіть свій університет чи організацію до COIL-проєктів VIRaTeC.',
        },
      ],
    },
  },
};

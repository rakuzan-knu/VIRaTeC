import type { Localized } from '../i18n/model/types';
import type { PageSeo, PageSeoEntry } from './seo';
import { ROUTES } from './routes';

export const DEFAULT_SEO: Localized<PageSeo> = {
  en: {
    description:
      'VIRaTeC is an international research and education community at Taras Shevchenko National University of Kyiv uniting students, educators and researchers through AI, EdTech and COIL.',
  },
  uk: {
    description:
      'VIRaTeC — міжнародна освітня та наукова спільнота КНУ імені Тараса Шевченка (ФІТ + ННІФ): дослідження ШІ та NLP, EdTech, COIL-проєкти з університетами-партнерами.',
  },
  de: {
    description:
      'VIRaTeC is an international research and education community at Taras Shevchenko National University of Kyiv uniting students, educators and researchers through AI, EdTech and COIL.',
  },
  fr: {
    description:
      'VIRaTeC is an international research and education community at Taras Shevchenko National University of Kyiv uniting students, educators and researchers through AI, EdTech and COIL.',
  },
  ar: {
    description:
      'VIRaTeC is an international research and education community at Taras Shevchenko National University of Kyiv uniting students, educators and researchers through AI, EdTech and COIL.',
  },
};

export const PAGE_SEO_ENTRIES: PageSeoEntry[] = [
  {
    route: ROUTES.HOME,
    seo: {
      en: {
        description:
          'VIRaTeC is an international research and education community at Taras Shevchenko National University of Kyiv uniting students, educators and researchers through AI, EdTech and COIL.',
      },
      uk: {
        description:
          'VIRaTeC — міжнародна освітня та наукова спільнота КНУ імені Тараса Шевченка (ФІТ + ННІФ): дослідження ШІ та NLP, EdTech, COIL-проєкти з університетами-партнерами.',
      },
      de: {
        description:
          'VIRaTeC is an international research and education community at Taras Shevchenko National University of Kyiv uniting students, educators and researchers through AI, EdTech and COIL.',
      },
      fr: {
        description:
          'VIRaTeC is an international research and education community at Taras Shevchenko National University of Kyiv uniting students, educators and researchers through AI, EdTech and COIL.',
      },
      ar: {
        description:
          'VIRaTeC is an international research and education community at Taras Shevchenko National University of Kyiv uniting students, educators and researchers through AI, EdTech and COIL.',
      },
    },
  },
  {
    route: ROUTES.ABOUT_INITIATIVE,
    seo: {
      en: {
        title: 'About the Initiative',
        description:
          'Since 2019 Dr. Larysa Liashenko and colleagues have connected students across Ukraine, the UK, the USA, Asia and Europe through virtual learning. Learn why VIRaTeC exists.',
      },
      uk: {
        title: 'Про ініціативу',
        description:
          'З 2019 року д-р Лариса Ляшенко та колеги об’єднують студентів з України, Великої Британії, США, Азії та Європи завдяки віртуальному навчанню. Місія та цінності VIRaTeC.',
      },
      de: {
        title: 'About the Initiative',
        description:
          'Since 2019 Dr. Larysa Liashenko and colleagues have connected students across Ukraine, the UK, the USA, Asia and Europe through virtual learning. Learn why VIRaTeC exists.',
      },
      fr: {
        title: 'About the Initiative',
        description:
          'Since 2019 Dr. Larysa Liashenko and colleagues have connected students across Ukraine, the UK, the USA, Asia and Europe through virtual learning. Learn why VIRaTeC exists.',
      },
      ar: {
        title: 'About the Initiative',
        description:
          'Since 2019 Dr. Larysa Liashenko and colleagues have connected students across Ukraine, the UK, the USA, Asia and Europe through virtual learning. Learn why VIRaTeC exists.',
      },
    },
  },
  {
    route: ROUTES.VIRATEC,
    seo: {
      en: {
        title: 'About VIRaTeC',
        description:
          'VIRaTeC — Virtual Innovative Research & Technology Community: students, educators, researchers and innovators from 10 countries connected through AI, EdTech and COIL.',
      },
      uk: {
        title: 'Про VIRaTeC',
        description:
          'VIRaTeC — Virtual Innovative Research & Technology Community: студенти, викладачі й дослідники з 10 країн, об’єднані завдяки ШІ, EdTech і міжнародній співпраці.',
      },
      de: {
        title: 'About VIRaTeC',
        description:
          'VIRaTeC — Virtual Innovative Research & Technology Community: students, educators, researchers and innovators from 10 countries connected through AI, EdTech and COIL.',
      },
      fr: {
        title: 'About VIRaTeC',
        description:
          'VIRaTeC — Virtual Innovative Research & Technology Community: students, educators, researchers and innovators from 10 countries connected through AI, EdTech and COIL.',
      },
      ar: {
        title: 'About VIRaTeC',
        description:
          'VIRaTeC — Virtual Innovative Research & Technology Community: students, educators, researchers and innovators from 10 countries connected through AI, EdTech and COIL.',
      },
    },
  },
  {
    route: ROUTES.GLOBAL_COLLABORATION,
    seo: {
      en: {
        title: 'Global Collaboration Framework',
        description:
          'How Taras Shevchenko National University of Kyiv and partner universities build joint programs, research and student projects within the VIRaTeC network.',
      },
      uk: {
        title: 'Рамкова програма глобальної співпраці',
        description:
          'Як КНУ імені Тараса Шевченка та університети-партнери створюють спільні програми, дослідження та студентські проєкти в мережі VIRaTeC.',
      },
      de: {
        title: 'Global Collaboration Framework',
        description:
          'How Taras Shevchenko National University of Kyiv and partner universities build joint programs, research and student projects within the VIRaTeC network.',
      },
      fr: {
        title: 'Global Collaboration Framework',
        description:
          'How Taras Shevchenko National University of Kyiv and partner universities build joint programs, research and student projects within the VIRaTeC network.',
      },
      ar: {
        title: 'Global Collaboration Framework',
        description:
          'How Taras Shevchenko National University of Kyiv and partner universities build joint programs, research and student projects within the VIRaTeC network.',
      },
    },
  },
  {
    route: ROUTES.RESEARCH_AREAS,
    seo: {
      en: {
        title: 'Research Areas',
        description:
          'VIRaTeC research areas bring together IT, linguistics and education: AI, NLP, cybersecurity, ESP and intercultural communication with partner universities.',
      },
      uk: {
        title: 'Напрями досліджень',
        description:
          'Напрями досліджень VIRaTeC поєднують ІТ, лінгвістику та освіту: ШІ, NLP, кібербезпека, ESP та міжкультурна комунікація разом з університетами-партнерами.',
      },
      de: {
        title: 'Research Areas',
        description:
          'VIRaTeC research areas bring together IT, linguistics and education: AI, NLP, cybersecurity, ESP and intercultural communication with partner universities.',
      },
      fr: {
        title: 'Research Areas',
        description:
          'VIRaTeC research areas bring together IT, linguistics and education: AI, NLP, cybersecurity, ESP and intercultural communication with partner universities.',
      },
      ar: {
        title: 'Research Areas',
        description:
          'VIRaTeC research areas bring together IT, linguistics and education: AI, NLP, cybersecurity, ESP and intercultural communication with partner universities.',
      },
    },
  },
  {
    route: ROUTES.PROJECTS,
    seo: {
      en: {
        title: 'Projects',
        description:
          'COIL projects, workshops and research teams where students and researchers from Kyiv work together with partner universities around the world.',
      },
      uk: {
        title: 'Проєкти',
        description:
          'COIL-проєкти, воркшопи та дослідницькі команди, у яких студенти й дослідники КНУ працюють разом з університетами-партнерами з усього світу.',
      },
      de: {
        title: 'Projects',
        description:
          'COIL projects, workshops and research teams where students and researchers from Kyiv work together with partner universities around the world.',
      },
      fr: {
        title: 'Projects',
        description:
          'COIL projects, workshops and research teams where students and researchers from Kyiv work together with partner universities around the world.',
      },
      ar: {
        title: 'Projects',
        description:
          'COIL projects, workshops and research teams where students and researchers from Kyiv work together with partner universities around the world.',
      },
    },
  },
  {
    route: ROUTES.EXPERIENTIAL_LEARNING,
    seo: {
      en: {
        title: 'Experiential Learning',
        description:
          'At VIRaTeC students learn through real international projects: they research, collaborate across cultures and deliver results with partner universities.',
      },
      uk: {
        title: 'Навчання через досвід',
        description:
          'У VIRaTeC студенти навчаються через реальні міжнародні проєкти: досліджують, співпрацюють з представниками різних культур і досягають результатів.',
      },
      de: {
        title: 'Experiential Learning',
        description:
          'At VIRaTeC students learn through real international projects: they research, collaborate across cultures and deliver results with partner universities.',
      },
      fr: {
        title: 'Experiential Learning',
        description:
          'At VIRaTeC students learn through real international projects: they research, collaborate across cultures and deliver results with partner universities.',
      },
      ar: {
        title: 'Experiential Learning',
        description:
          'At VIRaTeC students learn through real international projects: they research, collaborate across cultures and deliver results with partner universities.',
      },
    },
  },
  {
    route: ROUTES.STUDENT_RESEARCH,
    seo: {
      en: {
        title: 'Student Research',
        description:
          'At VIRaTeC students are co-creators: they propose ideas, lead international teams and publish research results together with partner universities.',
      },
      uk: {
        title: 'Студентські дослідження',
        description:
          'У VIRaTeC студенти — співтворці: пропонують ідеї, керують міжнародними командами та публікують наукові результати разом з університетами-партнерами.',
      },
      de: {
        title: 'Student Research',
        description:
          'At VIRaTeC students are co-creators: they propose ideas, lead international teams and publish research results together with partner universities.',
      },
      fr: {
        title: 'Student Research',
        description:
          'At VIRaTeC students are co-creators: they propose ideas, lead international teams and publish research results together with partner universities.',
      },
      ar: {
        title: 'Student Research',
        description:
          'At VIRaTeC students are co-creators: they propose ideas, lead international teams and publish research results together with partner universities.',
      },
    },
  },
  {
    route: ROUTES.PUBLICATIONS,
    seo: {
      en: {
        title: 'Publications',
        description:
          'Papers, conference talks, project news and media coverage of VIRaTeC and its partner universities: AI, EdTech, COIL and intercultural communication.',
      },
      uk: {
        title: 'Публікації',
        description:
          'Статті, доповіді на конференціях, новини проєктів і згадки про VIRaTeC та університети-партнери в медіа: ШІ, EdTech, COIL і міжкультурна комунікація.',
      },
      de: {
        title: 'Publications',
        description:
          'Papers, conference talks, project news and media coverage of VIRaTeC and its partner universities: AI, EdTech, COIL and intercultural communication.',
      },
      fr: {
        title: 'Publications',
        description:
          'Papers, conference talks, project news and media coverage of VIRaTeC and its partner universities: AI, EdTech, COIL and intercultural communication.',
      },
      ar: {
        title: 'Publications',
        description:
          'Papers, conference talks, project news and media coverage of VIRaTeC and its partner universities: AI, EdTech, COIL and intercultural communication.',
      },
    },
  },
  {
    route: ROUTES.OPPORTUNITIES,
    seo: {
      en: {
        title: 'Opportunities',
        description:
          'Projects, workshops and partnerships for students, researchers and universities. Pick your role to see what is open in the VIRaTeC network right now.',
      },
      uk: {
        title: 'Можливості',
        description:
          'Проєкти, воркшопи та партнерства для студентів, дослідників і університетів. Оберіть свою роль, щоб побачити, що відкрито в мережі VIRaTeC зараз.',
      },
      de: {
        title: 'Opportunities',
        description:
          'Projects, workshops and partnerships for students, researchers and universities. Pick your role to see what is open in the VIRaTeC network right now.',
      },
      fr: {
        title: 'Opportunities',
        description:
          'Projects, workshops and partnerships for students, researchers and universities. Pick your role to see what is open in the VIRaTeC network right now.',
      },
      ar: {
        title: 'Opportunities',
        description:
          'Projects, workshops and partnerships for students, researchers and universities. Pick your role to see what is open in the VIRaTeC network right now.',
      },
    },
  },
  {
    route: ROUTES.CONTACT,
    seo: {
      en: {
        title: 'Contact',
        description:
          'A student with an idea, a researcher looking for an international team or a university that wants to join the network? Contact VIRaTeC at KNU.',
      },
      uk: {
        title: 'Контакти',
        description:
          'Студент з ідеєю, дослідник, що шукає міжнародну команду, чи університет, який хоче долучитися до мережі? Зв’яжіться з VIRaTeC у КНУ.',
      },
      de: {
        title: 'Contact',
        description:
          'A student with an idea, a researcher looking for an international team or a university that wants to join the network? Contact VIRaTeC at KNU.',
      },
      fr: {
        title: 'Contact',
        description:
          'A student with an idea, a researcher looking for an international team or a university that wants to join the network? Contact VIRaTeC at KNU.',
      },
      ar: {
        title: 'Contact',
        description:
          'A student with an idea, a researcher looking for an international team or a university that wants to join the network? Contact VIRaTeC at KNU.',
      },
    },
  },
  {
    route: ROUTES.TERMS,
    seo: {
      en: {
        title: 'Terms of Service',
        description:
          'Terms of use of the VIRaTeC website and community platform at Taras Shevchenko National University of Kyiv.',
      },
      uk: {
        title: 'Умови використання',
        description:
          'Умови використання сайту та платформи спільноти VIRaTeC Київського національного університету імені Тараса Шевченка.',
      },
      de: {
        title: 'Terms of Service',
        description:
          'Terms of use of the VIRaTeC website and community platform at Taras Shevchenko National University of Kyiv.',
      },
      fr: {
        title: 'Terms of Service',
        description:
          'Terms of use of the VIRaTeC website and community platform at Taras Shevchenko National University of Kyiv.',
      },
      ar: {
        title: 'Terms of Service',
        description:
          'Terms of use of the VIRaTeC website and community platform at Taras Shevchenko National University of Kyiv.',
      },
    },
  },
  {
    route: ROUTES.PRIVACY,
    seo: {
      en: {
        title: 'Privacy Policy',
        description:
          'What personal data VIRaTeC collects, why we use it, how long we keep it and what rights you have.',
      },
      uk: {
        title: 'Політика конфіденційності',
        description:
          'Які персональні дані збирає VIRaTeC, навіщо ми їх використовуємо, скільки зберігаємо та які права ви маєте.',
      },
      de: {
        title: 'Privacy Policy',
        description:
          'What personal data VIRaTeC collects, why we use it, how long we keep it and what rights you have.',
      },
      fr: {
        title: 'Privacy Policy',
        description:
          'What personal data VIRaTeC collects, why we use it, how long we keep it and what rights you have.',
      },
      ar: {
        title: 'Privacy Policy',
        description:
          'What personal data VIRaTeC collects, why we use it, how long we keep it and what rights you have.',
      },
    },
  },
  {
    route: ROUTES.COOKIES,
    seo: {
      en: {
        title: 'Cookie Policy',
        description:
          'How the VIRaTeC website uses cookies and browser storage, and how you can control them.',
      },
      uk: {
        title: 'Політика щодо cookie',
        description:
          'Як сайт VIRaTeC використовує cookie та сховище браузера і як ви можете ними керувати.',
      },
      de: {
        title: 'Cookie Policy',
        description:
          'How the VIRaTeC website uses cookies and browser storage, and how you can control them.',
      },
      fr: {
        title: 'Cookie Policy',
        description:
          'How the VIRaTeC website uses cookies and browser storage, and how you can control them.',
      },
      ar: {
        title: 'Cookie Policy',
        description:
          'How the VIRaTeC website uses cookies and browser storage, and how you can control them.',
      },
    },
  },
  {
    route: ROUTES.GUIDELINES,
    seo: {
      en: {
        title: 'Community Guidelines',
        description:
          'The rules of the VIRaTeC community: respect, honesty, responsible research, privacy and ethical hacking.',
      },
      uk: {
        title: 'Правила спільноти',
        description:
          'Правила спільноти VIRaTeC: повага, чесність, відповідальні дослідження, захист приватності та етичний хакінг.',
      },
      de: {
        title: 'Community Guidelines',
        description:
          'The rules of the VIRaTeC community: respect, honesty, responsible research, privacy and ethical hacking.',
      },
      fr: {
        title: 'Community Guidelines',
        description:
          'The rules of the VIRaTeC community: respect, honesty, responsible research, privacy and ethical hacking.',
      },
      ar: {
        title: 'Community Guidelines',
        description:
          'The rules of the VIRaTeC community: respect, honesty, responsible research, privacy and ethical hacking.',
      },
    },
  },
];

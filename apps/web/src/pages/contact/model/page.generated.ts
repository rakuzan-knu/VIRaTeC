import type { Localized } from '@/shared/i18n/model/types';
import type { ContactContent } from './content';
import { ROUTES } from '@/shared/config/routes';
import asset_contactpage_chairphoto from '@/shared/assets/contentful/contactpage-chairphoto.webp';

export const PAGE_TEXT: Localized<ContactContent> = {
  en: {
    documentTitle: 'Contact',
    eyebrow: 'Contact / Collaborate',
    title: 'Let’s build research',
    accent: 'together.',
    description:
      'Whether you are a student with an idea, a researcher looking for an international team or a university that wants to join the network — write to us and we will find the right format together.',
    getInTouchTitle: 'Get in touch',
    emailTitle: 'Email',
    replyTime: 'We usually reply within 2–3 working days.',
    writeToUs: 'Write to us',
    chairTitle: 'Project Chair',
    chairName: 'Larysa Liashenko',
    chairRole:
      'PhD in Psychology, Associate Professor, Department of Foreign Languages for Mathematical Faculties, Educational and Scientific Institute of Philology, KNU · Honoured Educator of Ukraine',
    chairPhoto: asset_contactpage_chairphoto,
    locationTitle: 'Location',
    socialLabels: {
      group: 'VIRaTeC group',
      chair: 'Dr. Larysa Liashenko',
      orcid: 'ORCID',
      scopus: 'Scopus',
      facebook: 'Facebook group',
      scholar: 'Google Scholar',
    },
    waysTitle: 'Ways to collaborate',
    subjectPrefix: 'Subject',
    ways: [
      {
        title: 'For students',
        description:
          'Join an ongoing COIL project or propose your own research idea. Tell us your faculty, year and topic of interest.',
        subject: 'Student project',
        linkLabel: 'Opportunities →',
        to: ROUTES.OPPORTUNITIES,
      },
      {
        title: 'For researchers',
        description:
          'Co-supervise student teams, run joint workshops or start a research project with colleagues from partner universities.',
        subject: 'Research collaboration',
        linkLabel: 'Research Areas →',
        to: ROUTES.RESEARCH_AREAS,
      },
      {
        title: 'For partner universities',
        description:
          'Bring your students into intercontinental COIL projects within the Global Collaboration Framework.',
        subject: 'University partnership',
        linkLabel: 'Global Collaboration Framework →',
        to: ROUTES.GLOBAL_COLLABORATION,
      },
    ],
  },
  uk: {
    documentTitle: 'Контакти',
    eyebrow: 'Контакти / Співпраця',
    title: 'Створюймо дослідження',
    accent: 'разом.',
    description:
      'Ви студент з ідеєю, дослідник, який шукає міжнародну команду, чи університет, що хоче долучитися до мережі? Напишіть нам — і ми разом знайдемо відповідний формат.',
    getInTouchTitle: 'Зв’яжіться з нами',
    emailTitle: 'Електронна пошта',
    replyTime: 'Зазвичай ми відповідаємо протягом 2–3 робочих днів.',
    writeToUs: 'Написати нам',
    chairTitle: 'Керівниця проєкту',
    chairName: 'Лариса Ляшенко',
    chairRole:
      'Кандидатка психологічних наук, доцентка кафедри іноземних мов математичних факультетів Навчально-наукового інституту філології, КНУ · Заслужена працівниця освіти України',
    chairPhoto: asset_contactpage_chairphoto,
    locationTitle: 'Розташування',
    socialLabels: {
      group: 'Група VIRaTeC',
      chair: 'Д-р Лариса Ляшенко',
      orcid: 'ORCID',
      scopus: 'Scopus',
      facebook: 'Група у Facebook',
      scholar: 'Google Scholar',
    },
    waysTitle: 'Як співпрацювати',
    subjectPrefix: 'Тема',
    ways: [
      {
        title: 'Для студентів',
        description:
          'Долучайтеся до чинного COIL-проєкту або запропонуйте власну дослідницьку ідею. Вкажіть свій факультет, курс і тему, що вас цікавить.',
        subject: 'Студентський проєкт',
        linkLabel: 'Можливості →',
        to: ROUTES.OPPORTUNITIES,
      },
      {
        title: 'Для дослідників',
        description:
          'Керуйте студентськими командами, проводьте спільні воркшопи або започаткуйте дослідницький проєкт із колегами з університетів-партнерів.',
        subject: 'Наукова співпраця',
        linkLabel: 'Напрями досліджень →',
        to: ROUTES.RESEARCH_AREAS,
      },
      {
        title: 'Для університетів-партнерів',
        description:
          'Залучайте своїх студентів до міжконтинентальних COIL-проєктів у межах Global Collaboration Framework.',
        subject: 'Партнерство університетів',
        linkLabel: 'Рамкова програма глобальної співпраці →',
        to: ROUTES.GLOBAL_COLLABORATION,
      },
    ],
  },
};

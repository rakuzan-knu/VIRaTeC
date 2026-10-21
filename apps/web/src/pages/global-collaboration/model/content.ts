import { ROUTES } from '@/shared/config/routes';
import { defineMessages } from '@/shared/i18n';
import type { StepItem } from '@/shared/ui/steps-list';

interface PartnerUniversity {
  code: string;
  name: string;
  location: string;
}

interface Stat {
  value: string;
  label: string;
}

interface Format {
  title: string;
  description: string;
  to: string;
}

export interface GlobalCollaborationContent {
  documentTitle: string;
  breadcrumb: string[];
  title: string;
  accent: string;
  description: string;
  partnersEyebrow: string;
  partnersTitle: string;
  partners: PartnerUniversity[];
  inviteTitle: string;
  inviteDescription: string;
  bannerTitle: string;
  bannerDescription: string;
  stats: Stat[];
  formatsEyebrow: string;
  formatsTitle: string;
  formatsDescription: string;
  formats: Format[];
  partnershipEyebrow: string;
  partnershipTitle: string;
  partnershipAccent: string;
  partnershipSteps: StepItem[];
  ctaTitle: string;
  ctaDescription: string;
  ctaAction: string;
}

export const GLOBAL_COLLABORATION_CONTENT = defineMessages<GlobalCollaborationContent>({
  en: {
    documentTitle: 'Global Collaboration Framework',
    breadcrumb: ['About', 'Global Collaboration Framework'],
    title: 'Collaboration',
    accent: 'without borders.',
    description:
      'How KNU and partner universities build joint programs, research and student projects within the VIRaTeC network.',
    partnersEyebrow: 'Partner universities',
    partnersTitle: 'Our global network',
    partners: [
      { code: 'UK', name: 'Coventry University', location: 'United Kingdom' },
      { code: 'US', name: 'Johns Hopkins University', location: 'USA' },
      { code: 'US', name: 'Georgia State University', location: 'USA · Perimeter College' },
      { code: 'US', name: 'University of Florida', location: 'USA' },
      { code: 'US', name: 'University of Central Arkansas', location: 'USA' },
      { code: 'US', name: 'Campbellsville University', location: 'USA' },
      { code: 'IN', name: 'Karunya Institute of Technology and Sciences', location: 'India' },
      { code: 'DZ', name: 'École Nationale Polytechnique', location: 'Algeria · Algiers' },
      { code: 'CO', name: 'Universidad Católica de Colombia', location: 'Colombia' },
      { code: 'CL', name: 'Instituto Profesional Santo Tomás', location: 'Chile' },
      { code: 'AE', name: 'American University in the Emirates', location: 'UAE' },
      { code: 'UA', name: 'Pryazovskyi State Technical University', location: 'Ukraine' },
      { code: 'UA', name: 'Lutsk National Technical University', location: 'Ukraine' },
      { code: 'UA', name: 'Kyiv Aviation Institute', location: 'Ukraine' },
    ],
    inviteTitle: 'Your university',
    inviteDescription: 'Join the network and co-create international programs.',
    bannerTitle: 'One framework for joint learning and research',
    bannerDescription:
      'Partners agree on shared goals, co-design modules and form mixed student teams. KNU coordinates the network, partners bring their expertise and students.',
    stats: [
      { value: '14', label: 'partner universities' },
      { value: '8', label: 'countries' },
    ],
    formatsEyebrow: 'Formats',
    formatsTitle: 'Ways to collaborate',
    formatsDescription: 'Flexible formats that fit different partners and academic calendars.',
    formats: [
      {
        title: 'COIL projects',
        description:
          'Mixed teams of students from two or more universities solve a shared challenge online.',
        to: ROUTES.PROJECTS,
      },
      {
        title: 'COIL CyberBridge Talks',
        description:
          'An international conference series where student teams present the results of concurrent COIL modules.',
        to: ROUTES.PUBLICATIONS,
      },
      {
        title: 'Role-play & digital simulation',
        description:
          'Global Collaboration Framework sessions with Johns Hopkins University, such as an offshore wind farm negotiation.',
        to: ROUTES.EXPERIENTIAL_LEARNING,
      },
    ],
    partnershipEyebrow: 'Become a partner',
    partnershipTitle: 'How partnership',
    partnershipAccent: 'starts',
    partnershipSteps: [
      { title: 'Get in touch', description: 'Write to us about your university and interests.' },
      { title: 'Align goals', description: 'Agree on topics, formats and schedule.' },
      { title: 'Launch a pilot', description: 'Run a first COIL project or workshop.' },
      { title: 'Grow together', description: 'Scale to modules and joint research.' },
    ],
    ctaTitle: 'Let’s collaborate',
    ctaDescription:
      'Represent a university or organization? Tell us about your idea and we will find a format together.',
    ctaAction: 'Become a partner',
  },
  uk: {
    documentTitle: 'Рамкова програма глобальної співпраці',
    breadcrumb: ['Про нас', 'Рамкова програма глобальної співпраці'],
    title: 'Співпраця',
    accent: 'без кордонів.',
    description:
      'Як КНУ та університети-партнери створюють спільні програми, дослідження та студентські проєкти в мережі VIRaTeC.',
    partnersEyebrow: 'Університети-партнери',
    partnersTitle: 'Наша глобальна мережа',
    partners: [
      { code: 'UK', name: 'Університет Ковентрі', location: 'Велика Британія' },
      { code: 'US', name: 'Університет Джонса Гопкінса', location: 'США' },
      { code: 'US', name: 'Університет штату Джорджія', location: 'США · Perimeter College' },
      { code: 'US', name: 'Університет Флориди', location: 'США' },
      { code: 'US', name: 'Університет Центрального Арканзасу', location: 'США' },
      { code: 'US', name: 'Університет Кемпбеллсвілла', location: 'США' },
      {
        code: 'IN',
        name: 'Karunya Institute of Technology and Sciences',
        location: 'Індія',
      },
      { code: 'DZ', name: 'École Nationale Polytechnique', location: 'Алжир · м. Алжир' },
      { code: 'CO', name: 'Universidad Católica de Colombia', location: 'Колумбія' },
      { code: 'CL', name: 'Instituto Profesional Santo Tomás', location: 'Чилі' },
      { code: 'AE', name: 'Американський університет в Еміратах', location: 'ОАЕ' },
      { code: 'UA', name: 'Приазовський державний технічний університет', location: 'Україна' },
      { code: 'UA', name: 'Луцький національний технічний університет', location: 'Україна' },
      { code: 'UA', name: 'Київський авіаційний інститут', location: 'Україна' },
    ],
    inviteTitle: 'Ваш університет',
    inviteDescription: 'Долучайтеся до мережі та створюйте міжнародні програми разом із нами.',
    bannerTitle: 'Єдина рамка для спільного навчання та досліджень',
    bannerDescription:
      'Партнери узгоджують спільні цілі, разом розробляють модулі та формують змішані студентські команди. КНУ координує мережу, а партнери долучають свою експертизу та студентів.',
    stats: [
      { value: '14', label: 'університетів-партнерів' },
      { value: '8', label: 'країн' },
    ],
    formatsEyebrow: 'Формати',
    formatsTitle: 'Як співпрацювати',
    formatsDescription: 'Гнучкі формати, що підходять різним партнерам та академічним календарям.',
    formats: [
      {
        title: 'COIL-проєкти',
        description:
          'Змішані команди студентів із двох і більше університетів онлайн розв’язують спільне завдання.',
        to: ROUTES.PROJECTS,
      },
      {
        title: 'COIL CyberBridge Talks',
        description:
          'Серія міжнародних конференцій, на яких студентські команди представляють результати паралельних COIL-модулів.',
        to: ROUTES.PUBLICATIONS,
      },
      {
        title: 'Рольові ігри та цифрові симуляції',
        description:
          'Сесії Global Collaboration Framework з Університетом Джонса Гопкінса, як-от переговори щодо офшорної вітрової електростанції.',
        to: ROUTES.EXPERIENTIAL_LEARNING,
      },
    ],
    partnershipEyebrow: 'Станьте партнером',
    partnershipTitle: 'З чого починається',
    partnershipAccent: 'партнерство',
    partnershipSteps: [
      {
        title: 'Зв’яжіться з нами',
        description: 'Розкажіть про свій університет та інтереси.',
      },
      { title: 'Узгодьте цілі', description: 'Домовтеся про теми, формати та графік.' },
      { title: 'Запустіть пілот', description: 'Проведіть перший COIL-проєкт або воркшоп.' },
      { title: 'Розвивайтеся разом', description: 'Масштабуйте до модулів і спільних досліджень.' },
    ],
    ctaTitle: 'Співпрацюймо',
    ctaDescription:
      'Представляєте університет чи організацію? Розкажіть про свою ідею, і ми разом знайдемо формат.',
    ctaAction: 'Стати партнером',
  },
});

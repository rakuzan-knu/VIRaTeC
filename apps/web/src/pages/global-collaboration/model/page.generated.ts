import type { Localized } from '@/shared/i18n/model/types';
import type { GlobalCollaborationContent } from './content';
import { ROUTES } from '@/shared/config/routes';
import asset_globalcollaborationpage_formats_1_image from '@/shared/assets/contentful/globalcollaborationpage-formats-1-image.webp';
import asset_globalcollaborationpage_formats_2_image from '@/shared/assets/contentful/globalcollaborationpage-formats-2-image.webp';
import asset_globalcollaborationpage_formats_3_image from '@/shared/assets/contentful/globalcollaborationpage-formats-3-image.webp';

export const PAGE_TEXT: Localized<GlobalCollaborationContent> = {
  en: {
    documentTitle: 'Global Collaboration Framework',
    breadcrumb: ['About', 'Global Collaboration Framework'],
    title: 'Collaboration',
    accent: 'without borders.',
    description:
      'How KNU and partner universities build joint programs, research and student projects within the VIRaTeC network.',
    partnersEyebrow: 'Partner universities',
    partnersTitle: 'Our global network',
    inviteTitle: 'Your university',
    inviteDescription: 'Join the network and co-create international programs.',
    bannerTitle: 'One framework for joint learning and research',
    bannerDescription:
      'Partners agree on shared goals, co-design modules and form mixed student teams. KNU coordinates the network, partners bring their expertise and students.',
    stats: [
      { value: '15+', label: 'partner universities' },
      { value: '10', label: 'partner countries' },
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
        image: asset_globalcollaborationpage_formats_1_image,
      },
      {
        title: 'COIL CyberBridge Talks',
        description:
          'An international conference series where student teams present the results of concurrent COIL modules.',
        to: ROUTES.PUBLICATIONS,
        image: asset_globalcollaborationpage_formats_2_image,
      },
      {
        title: 'Role-play & digital simulation',
        description:
          'Global Collaboration Framework sessions with Johns Hopkins University, such as an offshore wind farm negotiation.',
        to: ROUTES.EXPERIENTIAL_LEARNING,
        image: asset_globalcollaborationpage_formats_3_image,
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
    inviteTitle: 'Ваш університет',
    inviteDescription: 'Долучайтеся до мережі та створюйте міжнародні програми разом із нами.',
    bannerTitle: 'Єдина рамка для спільного навчання та досліджень',
    bannerDescription:
      'Партнери узгоджують спільні цілі, разом розробляють модулі та формують змішані студентські команди. КНУ координує мережу, а партнери долучають свою експертизу та студентів.',
    stats: [
      { value: '15+', label: 'університетів-партнерів' },
      { value: '10', label: 'країн-партнерів' },
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
        image: asset_globalcollaborationpage_formats_1_image,
      },
      {
        title: 'COIL CyberBridge Talks',
        description:
          'Серія міжнародних конференцій, на яких студентські команди представляють результати паралельних COIL-модулів.',
        to: ROUTES.PUBLICATIONS,
        image: asset_globalcollaborationpage_formats_2_image,
      },
      {
        title: 'Рольові ігри та цифрові симуляції',
        description:
          'Сесії Global Collaboration Framework з Університетом Джонса Гопкінса, як-от переговори щодо офшорної вітрової електростанції.',
        to: ROUTES.EXPERIENTIAL_LEARNING,
        image: asset_globalcollaborationpage_formats_3_image,
      },
    ],
    partnershipEyebrow: 'Станьте партнером',
    partnershipTitle: 'З чого починається',
    partnershipAccent: 'партнерство',
    partnershipSteps: [
      { title: 'Зв’яжіться з нами', description: 'Розкажіть про свій університет та інтереси.' },
      { title: 'Узгодьте цілі', description: 'Домовтеся про теми, формати та графік.' },
      { title: 'Запустіть пілот', description: 'Проведіть перший COIL-проєкт або воркшоп.' },
      { title: 'Розвивайтеся разом', description: 'Масштабуйте до модулів і спільних досліджень.' },
    ],
    ctaTitle: 'Співпрацюймо',
    ctaDescription:
      'Представляєте університет чи організацію? Розкажіть про свою ідею, і ми разом знайдемо формат.',
    ctaAction: 'Стати партнером',
  },
};

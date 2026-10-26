import type { Localized } from '@/shared/i18n/model/types';
import type { ResearchAreasContent } from './content';
import asset_researchareaspage_areas_1_image from '@/shared/assets/contentful/researchareaspage-areas-1-image.webp';
import asset_researchareaspage_areas_2_image from '@/shared/assets/contentful/researchareaspage-areas-2-image.webp';
import asset_researchareaspage_areas_3_image from '@/shared/assets/contentful/researchareaspage-areas-3-image.webp';

export const PAGE_TEXT: Localized<ResearchAreasContent> = {
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
        image: asset_researchareaspage_areas_1_image,
      },
      {
        title: 'NLP & AI',
        description:
          'Foundations of NLP: from text preprocessing to sentiment analysis, with 206 students from 8 universities.',
        image: asset_researchareaspage_areas_2_image,
      },
      {
        title: 'Education & EdTech',
        description:
          'COIL, virtual exchange and Research-Based Learning that turn students into researchers and global citizens.',
        image: asset_researchareaspage_areas_3_image,
      },
    ],
    bannerTitle: 'Every area is explored by mixed international teams.',
    bannerDescription:
      'Students and researchers from Kyiv work together with partners from the UK, Colombia, Chile, the UAE and India on one shared research question.',
    stats: [
      { value: '15+', label: 'partner universities' },
      { value: '10', label: 'partner countries' },
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
        image: asset_researchareaspage_areas_1_image,
      },
      {
        title: 'NLP та ШІ',
        description:
          'Foundations of NLP: від попередньої обробки тексту до аналізу тональності — 206 студентів із 8 університетів.',
        image: asset_researchareaspage_areas_2_image,
      },
      {
        title: 'Освіта та EdTech',
        description:
          'COIL, віртуальний обмін і Research-Based Learning, що перетворюють студентів на дослідників і громадян світу.',
        image: asset_researchareaspage_areas_3_image,
      },
    ],
    bannerTitle: 'Кожен напрям досліджують змішані міжнародні команди.',
    bannerDescription:
      'Студенти та дослідники з Києва працюють разом із партнерами з Великої Британії, Колумбії, Чилі, ОАЕ та Індії над одним спільним дослідницьким питанням.',
    stats: [
      { value: '15+', label: 'університетів-партнерів' },
      { value: '10', label: 'країн-партнерів' },
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
};

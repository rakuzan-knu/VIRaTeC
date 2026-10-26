import type { Localized } from '@/shared/i18n/model/types';
import type { ExperientialLearningContent } from './content';
import { ROUTES } from '@/shared/config/routes';

export const PAGE_TEXT: Localized<ExperientialLearningContent> = {
  en: {
    documentTitle: 'Experiential Learning',
    breadcrumb: ['Research & Projects', 'Experiential Learning'],
    title: 'Learning by',
    accent: 'doing.',
    description:
      'At VIRaTeC students learn through real international projects: they research, collaborate across cultures and deliver results together with partner universities.',
    formatsEyebrow: 'Learning formats',
    formatsTitle: 'How students learn',
    formats: [
      {
        title: 'COIL projects',
        description:
          'Collaborative Online International Learning: one shared project for students from different countries and universities.',
        linkLabel: 'See projects →',
        to: ROUTES.PROJECTS,
      },
      {
        title: 'Synchronous online workshops',
        description:
          'Live sessions and role-play simulations, e.g. offshore wind farm negotiations with Johns Hopkins University.',
        linkLabel: 'See events →',
        to: ROUTES.PUBLICATIONS,
      },
      {
        title: 'Certified modules',
        description:
          'Certified Research-Based Learning modules where Master’s students lead workshops for international cohorts.',
        linkLabel: 'Learn more →',
        to: ROUTES.OPPORTUNITIES,
      },
    ],
    approachEyebrow: 'Our approach',
    approachTitle: 'Three principles',
    approachAccent: 'of every project',
    principles: [
      {
        title: 'Idea → outcome',
        description: 'Every project starts with a student idea and ends with a tangible result.',
      },
      {
        title: 'Challenge → collaboration',
        description: 'Teams from different countries solve one real problem together.',
      },
      {
        title: 'Knowledge → implementation',
        description: 'What students learn is applied in practice, not only in exams.',
      },
    ],
    outcomesEyebrow: 'Outcomes',
    outcomesTitle: 'What students gain',
    outcomes: [
      {
        title: 'Research skills',
        description: 'From formulating a question to presenting results.',
      },
      {
        title: 'Cross-cultural competence',
        description: 'Working with people from different cultures and time zones.',
      },
      {
        title: 'Emotional intelligence',
        description: 'Empathy and communication in virtual teams.',
      },
      {
        title: 'Global teamwork',
        description: 'Delivering one result together with international peers.',
      },
    ],
    ctaTitle: 'Ready to learn by doing?',
    ctaDescription: 'Join the next COIL project or workshop.',
  },
  uk: {
    documentTitle: 'Навчання через досвід',
    breadcrumb: ['Дослідження та проєкти', 'Навчання через досвід'],
    title: 'Навчання',
    accent: 'на практиці.',
    description:
      'У VIRaTeC студенти навчаються через реальні міжнародні проєкти: досліджують, співпрацюють із представниками різних культур і досягають результатів разом з університетами-партнерами.',
    formatsEyebrow: 'Формати навчання',
    formatsTitle: 'Як навчаються студенти',
    formats: [
      {
        title: 'COIL-проєкти',
        description:
          'Collaborative Online International Learning: один спільний проєкт для студентів із різних країн і університетів.',
        linkLabel: 'Переглянути проєкти →',
        to: ROUTES.PROJECTS,
      },
      {
        title: 'Синхронні онлайн-воркшопи',
        description:
          'Живі сесії та рольові симуляції, як-от переговори щодо офшорної вітрової електростанції з Університетом Джонса Гопкінса.',
        linkLabel: 'Переглянути події →',
        to: ROUTES.PUBLICATIONS,
      },
      {
        title: 'Сертифіковані модулі',
        description:
          'Сертифіковані модулі Research-Based Learning, у яких магістранти проводять воркшопи для міжнародних груп.',
        linkLabel: 'Дізнатися більше →',
        to: ROUTES.OPPORTUNITIES,
      },
    ],
    approachEyebrow: 'Наш підхід',
    approachTitle: 'Три принципи',
    approachAccent: 'кожного проєкту',
    principles: [
      {
        title: 'Ідея → результат',
        description:
          'Кожен проєкт починається зі студентської ідеї та завершується відчутним результатом.',
      },
      {
        title: 'Виклик → співпраця',
        description: 'Команди з різних країн разом розв’язують одну реальну проблему.',
      },
      {
        title: 'Знання → впровадження',
        description: 'Здобуті знання застосовуються на практиці, а не лише на іспитах.',
      },
    ],
    outcomesEyebrow: 'Результати',
    outcomesTitle: 'Що отримують студенти',
    outcomes: [
      {
        title: 'Дослідницькі навички',
        description: 'Від формулювання питання до презентації результатів.',
      },
      {
        title: 'Міжкультурна компетентність',
        description: 'Робота з людьми з різних культур і часових поясів.',
      },
      {
        title: 'Емоційний інтелект',
        description: 'Емпатія та комунікація у віртуальних командах.',
      },
      {
        title: 'Глобальна командна робота',
        description: 'Спільне досягнення результату з міжнародними колегами.',
      },
    ],
    ctaTitle: 'Готові навчатися на практиці?',
    ctaDescription: 'Долучайтеся до наступного COIL-проєкту чи воркшопу.',
  },
};

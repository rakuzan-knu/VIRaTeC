import type { Localized } from '@/shared/i18n/model/types';
import type { OpportunitiesText } from './content';

export const PAGE_TEXT: Localized<OpportunitiesText> = {
  en: {
    documentTitle: 'Opportunities',
    eyebrow: 'Opportunities',
    title: 'Find your place in',
    accent: 'the VIRaTeC network.',
    description:
      'Projects, workshops and partnerships for students, researchers and universities. Pick your role to see what is open right now.',
    tabsLabel: 'Opportunities by role',
    eventsTitle: 'Upcoming events',
    eventsDescription:
      'Conferences, symposia and courses where VIRaTeC students and partners take part this season.',
    howItWorksTitle: 'How it works',
    howItWorks: [
      { title: 'Write to us', description: 'Tell us who you are and what you are interested in.' },
      { title: 'Intro call', description: 'We meet online and discuss your goals and format.' },
      { title: 'Get matched', description: 'We connect you with a project, team or partner.' },
      { title: 'Start', description: 'You join the project and start working together.' },
    ],
    ctaTitle: 'Didn’t find your format?',
    ctaDescription: 'Write to us — we are open to new ideas, courses and partnerships.',
  },
  uk: {
    documentTitle: 'Можливості',
    eyebrow: 'Можливості',
    title: 'Знайдіть своє місце',
    accent: 'в мережі VIRaTeC.',
    description:
      'Проєкти, воркшопи та партнерства для студентів, дослідників і університетів. Оберіть свою роль, щоб побачити, що відкрито зараз.',
    tabsLabel: 'Можливості за роллю',
    eventsTitle: 'Найближчі події',
    eventsDescription:
      'Конференції, симпозіуми та курси, у яких цього сезону беруть участь студенти й партнери VIRaTeC.',
    howItWorksTitle: 'Як це працює',
    howItWorks: [
      { title: 'Напишіть нам', description: 'Розкажіть, хто ви і що вас цікавить.' },
      {
        title: 'Знайомство',
        description: 'Ми зустрінемося онлайн і обговоримо ваші цілі та формат.',
      },
      { title: 'Підбір', description: 'Ми підберемо для вас проєкт, команду чи партнера.' },
      { title: 'Старт', description: 'Ви долучаєтеся до проєкту й починаєте спільну роботу.' },
    ],
    ctaTitle: 'Не знайшли свій формат?',
    ctaDescription: 'Напишіть нам — ми відкриті до нових ідей, курсів і партнерств.',
  },
};

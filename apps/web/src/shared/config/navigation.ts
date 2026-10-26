import { defineMessages, mapLocalized, useLocalized } from '@/shared/i18n';
import { ROUTES } from './routes';
import { SITE_SETTINGS } from './site';

export interface NavLinkItem {
  label: string;
  to: string;
  description?: string;
}

export type NavGroupId = 'about' | 'research' | 'explore';

export interface NavGroup {
  id: NavGroupId;
  label: string;
  items: NavLinkItem[];
}

export type MainNavItem = { type: 'link'; link: NavLinkItem } | { type: 'group'; group: NavGroup };

export interface Navigation {
  about: NavGroup;
  research: NavGroup;
  explore: NavGroup;
  main: MainNavItem[];
}

const NAV_TEXT = defineMessages({
  en: {
    about: 'About',
    aboutInitiative: 'About Initiative',
    aboutInitiativeDescription: 'Mission, vision and the team behind the initiative',
    viratecDescription: 'Virtual Innovative Research & Technology Community',
    globalCollaboration: 'Global Collaboration Framework',
    globalCollaborationDescription: 'How we partner with universities around the world',
    people: 'Community members',
    peopleDescription: 'Find researchers, mentors and partners to collaborate with',
    research: 'Research & Projects',
    researchAreas: 'Research Areas',
    researchAreasDescription: 'Cybersecurity, cross-cultural competence and more',
    projects: 'Projects',
    projectsDescription: 'COIL projects and CyberBridge Talks',
    experientialLearning: 'Experiential Learning',
    experientialLearningDescription: 'Learning by doing in international teams',
    studentResearch: 'Student Research',
    studentResearchDescription: 'Research projects initiated and led by students',
    explore: 'Explore',
    home: 'Home',
    publications: 'Publications & Media',
    opportunities: 'Opportunities',
    contact: 'Contact / Collaborate',
  },
  uk: {
    about: 'Про нас',
    aboutInitiative: 'Про ініціативу',
    aboutInitiativeDescription: 'Місія, бачення та команда ініціативи',
    viratecDescription: 'Віртуальна інноваційна дослідницька та технологічна спільнота',
    globalCollaboration: 'Рамкова програма глобальної співпраці',
    globalCollaborationDescription: 'Як ми співпрацюємо з університетами світу',
    people: 'Учасники спільноти',
    peopleDescription: 'Знайдіть дослідників, менторів і партнерів для співпраці',
    research: 'Дослідження та проєкти',
    researchAreas: 'Напрями досліджень',
    researchAreasDescription: 'Кібербезпека, міжкультурна компетентність та інше',
    projects: 'Проєкти',
    projectsDescription: 'COIL-проєкти та CyberBridge Talks',
    experientialLearning: 'Навчання через досвід',
    experientialLearningDescription: 'Навчання на практиці в міжнародних командах',
    studentResearch: 'Студентські дослідження',
    studentResearchDescription: 'Дослідницькі проєкти, ініційовані та очолювані студентами',
    explore: 'Розділи',
    home: 'Головна',
    publications: 'Публікації та медіа',
    opportunities: 'Можливості',
    contact: 'Контакти / Співпраця',
  },
});

export const NAVIGATION = mapLocalized(NAV_TEXT, (text): Navigation => {
  const home: NavLinkItem = { label: text.home, to: ROUTES.HOME };
  const publications: NavLinkItem = { label: text.publications, to: ROUTES.PUBLICATIONS };
  const opportunities: NavLinkItem = { label: text.opportunities, to: ROUTES.OPPORTUNITIES };
  const people: NavLinkItem = {
    label: text.people,
    to: ROUTES.PEOPLE,
    description: text.peopleDescription,
  };

  const about: NavGroup = {
    id: 'about',
    label: text.about,
    items: [
      {
        label: text.aboutInitiative,
        to: ROUTES.ABOUT_INITIATIVE,
        description: text.aboutInitiativeDescription,
      },
      { label: 'VIRaTeC', to: ROUTES.VIRATEC, description: text.viratecDescription },
      {
        label: text.globalCollaboration,
        to: ROUTES.GLOBAL_COLLABORATION,
        description: text.globalCollaborationDescription,
      },
      people,
    ],
  };

  const research: NavGroup = {
    id: 'research',
    label: text.research,
    items: [
      {
        label: text.researchAreas,
        to: ROUTES.RESEARCH_AREAS,
        description: text.researchAreasDescription,
      },
      { label: text.projects, to: ROUTES.PROJECTS, description: text.projectsDescription },
      {
        label: text.experientialLearning,
        to: ROUTES.EXPERIENTIAL_LEARNING,
        description: text.experientialLearningDescription,
      },
      {
        label: text.studentResearch,
        to: ROUTES.STUDENT_RESEARCH,
        description: text.studentResearchDescription,
      },
    ],
  };

  const explore: NavGroup = {
    id: 'explore',
    label: text.explore,
    items: [
      home,
      publications,
      opportunities,
      { label: people.label, to: people.to },
      { label: text.contact, to: ROUTES.CONTACT },
    ],
  };

  return {
    about,
    research,
    explore,
    main: [
      { type: 'link', link: home },
      { type: 'group', group: about },
      { type: 'group', group: research },
      { type: 'link', link: publications },
      { type: 'link', link: opportunities },
    ],
  };
});

export const useNavigation = () => useLocalized(NAVIGATION);

export type { SocialLinkKey } from './site';

export const CONTACT_EMAIL = SITE_SETTINGS.contactEmail;

export const SOCIAL_LINKS = SITE_SETTINGS.socialLinks;

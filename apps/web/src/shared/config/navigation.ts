import { defineMessages, mapLocalized, useLocalized } from '@/shared/i18n';
import { ROUTES } from './routes';

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
    items: [home, publications, opportunities, { label: text.contact, to: ROUTES.CONTACT }],
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

export const CONTACT_EMAIL = 'coil.knu@gmail.com';

export type SocialLinkKey =
  'linkedinGroup' | 'linkedinChair' | 'orcid' | 'facebookGroup' | 'scopus' | 'googleScholar';

export const SOCIAL_LINKS: Record<SocialLinkKey, string | null> = {
  linkedinGroup: 'https://www.linkedin.com/groups/13199033/',
  linkedinChair: 'https://www.linkedin.com/in/dr-larysa-liashenko-aa382990/',
  orcid: 'https://orcid.org/0009-0008-6464-3167',
  facebookGroup: 'https://www.facebook.com/groups/1654374395202463/',
  scopus: 'https://www.scopus.com/authid/detail.uri?authorId=57224363587',
  googleScholar: 'https://scholar.google.com/citations?user=7zimYMcAAAAJ',
};

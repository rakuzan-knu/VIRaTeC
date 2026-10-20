import { ROUTES } from './routes';

export interface NavLinkItem {
  label: string;
  to: string;
  description?: string;
}

export interface NavGroup {
  label: string;
  items: NavLinkItem[];
}

export const ABOUT_NAV: NavGroup = {
  label: 'About',
  items: [
    {
      label: 'About Initiative',
      to: ROUTES.ABOUT_INITIATIVE,
      description: 'Mission, vision and the team behind the initiative',
    },
    {
      label: 'VIRaTeC',
      to: ROUTES.VIRATEC,
      description: 'Virtual Innovative Research & Technology Community',
    },
    {
      label: 'Global Collaboration Framework',
      to: ROUTES.GLOBAL_COLLABORATION,
      description: 'How we partner with universities around the world',
    },
  ],
};

export const RESEARCH_NAV: NavGroup = {
  label: 'Research & Projects',
  items: [
    {
      label: 'Research Areas',
      to: ROUTES.RESEARCH_AREAS,
      description: 'Cybersecurity, cross-cultural competence and more',
    },
    {
      label: 'Projects',
      to: ROUTES.PROJECTS,
      description: 'COIL projects and CyberBridge Talks',
    },
    {
      label: 'Experiential Learning',
      to: ROUTES.EXPERIENTIAL_LEARNING,
      description: 'Learning by doing in international teams',
    },
    {
      label: 'Student Research',
      to: ROUTES.STUDENT_RESEARCH,
      description: 'Research projects initiated and led by students',
    },
  ],
};

export const EXPLORE_NAV: NavGroup = {
  label: 'Explore',
  items: [
    { label: 'Home', to: ROUTES.HOME },
    { label: 'Publications & Media', to: ROUTES.PUBLICATIONS },
    { label: 'Opportunities', to: ROUTES.OPPORTUNITIES },
    { label: 'Contact / Collaborate', to: ROUTES.CONTACT },
  ],
};

export type MainNavItem = { type: 'link'; link: NavLinkItem } | { type: 'group'; group: NavGroup };

export const MAIN_NAV: MainNavItem[] = [
  { type: 'link', link: { label: 'Home', to: ROUTES.HOME } },
  { type: 'group', group: ABOUT_NAV },
  { type: 'group', group: RESEARCH_NAV },
  { type: 'link', link: { label: 'Publications & Media', to: ROUTES.PUBLICATIONS } },
  { type: 'link', link: { label: 'Opportunities', to: ROUTES.OPPORTUNITIES } },
];

export const CONTACT_EMAIL = 'coil.knu@gmail.com';

export const SOCIAL_LINKS = {
  linkedinGroup: '#',
  linkedinChair: '#',
  researchGate: '#',
  googleScholar: '#',
} as const;

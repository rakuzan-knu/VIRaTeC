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
    events: 'Events',
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
    events: 'Події',
    contact: 'Контакти / Співпраця',
  },
  de: {
    about: 'Über uns',
    aboutInitiative: 'Über die Initiative',
    aboutInitiativeDescription: 'Mission, Vision und das Team hinter der Initiative',
    viratecDescription: 'Virtual Innovative Research & Technology Community',
    globalCollaboration: 'Global Collaboration Framework',
    globalCollaborationDescription: 'Wie wir mit Universitäten weltweit zusammenarbeiten',
    people: 'Community-Mitglieder',
    peopleDescription:
      'Finden Sie Forschende, Mentorinnen, Mentoren und Partner für Ihre Zusammenarbeit',
    research: 'Forschung & Projekte',
    researchAreas: 'Forschungsbereiche',
    researchAreasDescription: 'Cybersicherheit, interkulturelle Kompetenz und mehr',
    projects: 'Projekte',
    projectsDescription: 'COIL-Projekte und CyberBridge Talks',
    experientialLearning: 'Erfahrungsbasiertes Lernen',
    experientialLearningDescription: 'Lernen durch Handeln in internationalen Teams',
    studentResearch: 'Studentische Forschung',
    studentResearchDescription: 'Von Studierenden initiierte und geleitete Forschungsprojekte',
    explore: 'Entdecken',
    home: 'Startseite',
    publications: 'Publikationen & Medien',
    opportunities: 'Möglichkeiten',
    events: 'Veranstaltungen',
    contact: 'Kontakt / Zusammenarbeit',
  },
  fr: {
    about: 'À propos',
    aboutInitiative: 'À propos de l’initiative',
    aboutInitiativeDescription: 'Mission, vision et l’équipe derrière l’initiative',
    viratecDescription: 'Virtual Innovative Research & Technology Community',
    globalCollaboration: 'Cadre de collaboration mondiale',
    globalCollaborationDescription: 'Comment nous collaborons avec des universités du monde entier',
    people: 'Membres de la communauté',
    peopleDescription: 'Trouvez des chercheurs, mentors et partenaires avec qui collaborer',
    research: 'Recherche & projets',
    researchAreas: 'Domaines de recherche',
    researchAreasDescription: 'Cybersécurité, compétences interculturelles et plus encore',
    projects: 'Projets',
    projectsDescription: 'Projets COIL et CyberBridge Talks',
    experientialLearning: 'Apprentissage expérientiel',
    experientialLearningDescription: 'Apprendre en faisant au sein d’équipes internationales',
    studentResearch: 'Recherche étudiante',
    studentResearchDescription: 'Projets de recherche initiés et menés par des étudiants',
    explore: 'Explorer',
    home: 'Accueil',
    publications: 'Publications & médias',
    opportunities: 'Opportunités',
    events: 'Événements',
    contact: 'Contact / Collaboration',
  },
  ar: {
    about: 'من نحن',
    aboutInitiative: 'عن المبادرة',
    aboutInitiativeDescription: 'المهمة والرؤية والفريق الذي يقف وراء المبادرة',
    viratecDescription: 'Virtual Innovative Research & Technology Community',
    globalCollaboration: 'إطار التعاون العالمي',
    globalCollaborationDescription: 'كيف نتشارك مع جامعات حول العالم',
    people: 'أعضاء المجتمع',
    peopleDescription: 'اعثر على باحثين ومرشدين وشركاء للتعاون معهم',
    research: 'البحث والمشاريع',
    researchAreas: 'مجالات البحث',
    researchAreasDescription: 'الأمن السيبراني والكفاءة بين الثقافات والمزيد',
    projects: 'المشاريع',
    projectsDescription: 'مشاريع COIL وCyberBridge Talks',
    experientialLearning: 'التعلم التجريبي',
    experientialLearningDescription: 'التعلم بالممارسة ضمن فرق دولية',
    studentResearch: 'البحث الطلابي',
    studentResearchDescription: 'مشاريع بحثية يبادر بها الطلاب ويقودونها',
    explore: 'استكشف',
    home: 'الرئيسية',
    publications: 'المنشورات والإعلام',
    opportunities: 'الفرص',
    events: 'الفعاليات',
    contact: 'تواصل / تعاون',
  },
});

export const NAVIGATION = mapLocalized(NAV_TEXT, (text): Navigation => {
  const home: NavLinkItem = { label: text.home, to: ROUTES.HOME };
  const publications: NavLinkItem = { label: text.publications, to: ROUTES.PUBLICATIONS };
  const opportunities: NavLinkItem = { label: text.opportunities, to: ROUTES.OPPORTUNITIES };
  const events: NavLinkItem = { label: text.events, to: ROUTES.EVENTS };
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
      events,
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
      { type: 'link', link: events },
      { type: 'link', link: opportunities },
    ],
  };
});

export const useNavigation = () => useLocalized(NAVIGATION);

export type { SocialLinkKey } from './site';

export const CONTACT_EMAIL = SITE_SETTINGS.contactEmail;

export const SOCIAL_LINKS = SITE_SETTINGS.socialLinks;

import { ROUTES, buildPublicationPath } from '@/shared/config/routes';
import johnsHopkinsLogo from '../assets/johns-hopkins.png';
import coventryLogo from '../assets/coventry.png';
import georgiaStateLogo from '../assets/georgia-state.png';
import floridaLogo from '../assets/university-of-florida.png';
import karunyaLogo from '../assets/karunya.png';
import ecoleLogo from '../assets/ecole-polytechnique.png';

export interface Partner {
  name: string;
  logo: string;
  logoClassName: string;
  caption?: [string, string];
}

export const PARTNERS: Partner[] = [
  {
    name: 'Johns Hopkins University',
    logo: johnsHopkinsLogo,
    logoClassName: 'h-[52px] w-[118px] lg:h-14 lg:w-[127px]',
  },
  {
    name: 'Coventry University',
    logo: coventryLogo,
    logoClassName: 'h-[52px] w-[75px] lg:h-14 lg:w-[82px]',
  },
  {
    name: 'Georgia State University',
    logo: georgiaStateLogo,
    logoClassName: 'h-[52px] w-16 lg:h-14 lg:w-[68px]',
  },
  {
    name: 'University of Florida',
    logo: floridaLogo,
    logoClassName: 'h-[30px] w-[159px] lg:h-[34px] lg:w-[179px]',
  },
  {
    name: 'Karunya Institute of Technology',
    logo: karunyaLogo,
    logoClassName: 'h-10 w-[41px] lg:h-[52px] lg:w-[54px]',
    caption: ['Karunya Institute', 'of Technology'],
  },
  {
    name: 'École Nationale Polytechnique',
    logo: ecoleLogo,
    logoClassName: 'h-[46px] w-[91px] lg:h-[50px] lg:w-[99px]',
  },
];

export interface Pillar {
  index: string;
  title: string;
  description: string;
}

export const PILLARS: Pillar[] = [
  {
    index: '01',
    title: 'Idea → outcome',
    description:
      'Every project starts with a student idea and ends with a tangible research result.',
  },
  {
    index: '02',
    title: 'Challenge → collaboration',
    description: 'Mixed international teams solve real problems across cultures and time zones.',
  },
  {
    index: '03',
    title: 'Knowledge → implementation',
    description: 'Workshops and mentoring turn what students learn into applied solutions.',
  },
];

export interface Stat {
  value: string;
  label: string;
}

export const STATS: Stat[] = [
  { value: '16', label: 'partner universities' },
  { value: '11', label: 'countries in the network' },
  { value: '1st', label: 'intercontinental student-led COIL project in Ukraine' },
];

export interface ProjectCard {
  title: string;
  description: string;
  to: string;
}

export const PROJECTS: ProjectCard[] = [
  {
    title: 'Cybersecurity',
    description:
      'A certified cybersecurity module where international student teams study threats and defence strategies together.',
    to: ROUTES.PROJECTS,
  },
  {
    title: 'Foundations of NLP',
    description:
      'An 8-week certified module designed by a Master’s student: 31 international teams, 200+ students from 7 universities.',
    to: ROUTES.PROJECTS,
  },
  {
    title: 'Cross-cultural competence',
    description:
      'Research on emotional intelligence and intercultural communication in virtual international teams.',
    to: ROUTES.PROJECTS,
  },
];

export const RESEARCH_HIGHLIGHT_NUMBERS: Stat[] = [
  { value: 'COIL', label: 'project format' },
  { value: '3', label: 'continents in one team' },
];

export interface PublicationCard {
  year: string;
  title: string;
  source: string;
  to: string;
  isUpcoming?: boolean;
}

export const PUBLICATIONS: PublicationCard[] = [
  {
    year: '2025',
    title: 'The first intercontinental virtual student research (COIL) project',
    source: 'Educational and Scientific Institute of Philology, KNU',
    to: buildPublicationPath('first-intercontinental-coil-project'),
  },
  {
    year: '2026',
    title: 'Author-led workshop by Dr. Kelly Tzoumis (JHU): Global Collaboration Framework',
    source: 'VIRaTeC',
    to: buildPublicationPath('global-collaboration-framework-workshop'),
  },
  {
    year: '2026',
    title: 'From virtual classroom to publication: student research in a category «B» journal',
    source: 'A. Loban, K. Kravets et al. · KNU FIT',
    to: buildPublicationPath('from-virtual-classroom-to-publication'),
    isUpcoming: true,
  },
];

export interface Audience {
  title: string;
  description: string;
}

export const AUDIENCES: Audience[] = [
  {
    title: 'For students',
    description:
      'Join an international COIL project, lead your own research and gain experience in a global team.',
  },
  {
    title: 'For researchers',
    description:
      'Co-supervise student projects and run joint research with colleagues from partner universities.',
  },
  {
    title: 'For partners',
    description: 'Bring your university or organisation into the Global Collaboration Framework.',
  },
];

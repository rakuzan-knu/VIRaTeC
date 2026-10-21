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
  { value: '14', label: 'partner universities named in projects' },
  { value: '8', label: 'countries in the network' },
  { value: '206', label: 'students in the 2026 Foundations of NLP module' },
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
      'COIL modules on cyber risks, business intelligence and cyber hygiene, led by master’s students with partners in the UK, the UAE, Colombia, Chile and India.',
    to: ROUTES.PROJECTS,
  },
  {
    title: 'Foundations of NLP',
    description:
      'An 8-week certified module led by a Master’s student: 31 international teams, 206 students from 7 universities and Chartbeat.',
    to: ROUTES.PROJECTS,
  },
  {
    title: 'Data-driven decision making',
    description:
      'An 8-week COIL with Coventry University and the University of Florida: 67 students worked with modern data analytics tools.',
    to: ROUTES.PROJECTS,
  },
];

export const RESEARCH_HIGHLIGHT_NUMBERS: Stat[] = [
  { value: '31', label: 'international teams' },
  { value: '8', label: 'weeks per module' },
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
    year: '2026',
    title: 'Big Data and AI: the foundation of the digital economy',
    source: 'K. Kravets, A. Mekshun, A. Loban, L. Liashenko · Grail of Science, No. 67',
    to: buildPublicationPath('big-data-and-ai-digital-economy'),
  },
  {
    year: '2026',
    title: 'The economic efficiency of AI-driven talent acquisition',
    source: 'M. Artemenko, S. Vasylyeva, M. Tymoshenko, L. Liashenko · Grail of Science, No. 67',
    to: buildPublicationPath('ai-driven-talent-acquisition'),
  },
  {
    year: '2026',
    title: 'Digital Narratives: AI and IT in Multidisciplinary Research 2026',
    source: 'Conference · KNU, 8 June 2026',
    to: buildPublicationPath('digital-narratives-2026'),
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
      'Join a certified COIL module, lead workshops as a master’s student and prepare your research for publication.',
  },
  {
    title: 'For researchers',
    description:
      'Co-supervise student projects and run joint research with colleagues from partner universities.',
  },
  {
    title: 'For partners',
    description: 'Bring your university or organisation into VIRaTeC COIL projects.',
  },
];

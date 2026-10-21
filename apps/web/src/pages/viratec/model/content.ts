import { ROUTES } from '@/shared/config/routes';
import type { StepItem } from '@/shared/ui/steps-list';

export const STATS = [
  { value: '14', label: 'partner universities named in projects' },
  { value: '8', label: 'countries' },
  { value: '360', label: 'participants in three 2025–2026 modules' },
  { value: '142', label: 'members of the LinkedIn community' },
] as const;

export interface Milestone {
  date: string;
  title: string;
  description: string;
  isUpcoming?: boolean;
}

export const MILESTONES: Milestone[] = [
  {
    date: '2019',
    title: 'Where it started',
    description:
      'Dr. Larysa Liashenko starts international virtual exchanges that connect KNU students with peers in the UK, the USA, Asia and Europe.',
  },
  {
    date: 'April 2025',
    title: 'Cybersecurity in Action',
    description:
      'A Cybersecurity Essentials COIL pilot with partners in Colombia and Chile is presented at the VIII International PCSICS Conference on 11 April 2025.',
  },
  {
    date: 'April 2025',
    title: 'VIRaTeC Global Community',
    description:
      'The VIRaTeC Global Community at KNU opens to students, educators, researchers and innovators worldwide.',
  },
  {
    date: 'June 2025',
    title: 'COIL + CyberBridge Talks',
    description:
      'Three concurrent COIL modules with Coventry University, Universidad Católica de Colombia, Santo Tomás, the American University in the Emirates and Karunya Institute end with certificates on 5 June. KNU names the students’ project the first intercontinental virtual research (COIL) project.',
  },
  {
    date: 'February 2026',
    title: 'Foundations of NLP',
    description:
      'An 8-week certified Research-Based Learning module starts on 16 February: 206 students from 7 universities and Chartbeat, 31 international teams.',
  },
  {
    date: 'Spring 2026',
    title: 'Data-Driven Decision Making Across Borders',
    description:
      'An 8-week COIL with Coventry University, the University of Florida and the KNU Faculty of Economics: 67 students.',
  },
  {
    date: 'May 2026',
    title: 'Student research published',
    description:
      'Six KNU FIT students publish two articles in Grail of Science, a Category B journal, on 1 May 2026.',
  },
  {
    date: 'June 2026',
    title: 'Digital Narratives 2026',
    description:
      'A KNU conference on 8 June presents the results of certified COIL modules to nearly 100 participants.',
  },
  {
    date: 'September 2026',
    title: 'Global Collaboration Framework with Johns Hopkins',
    description:
      'An author-led workshop by Dr. Kelly Tzoumis (JHU) for 54 students and faculty, followed by the online event “From Student Ideas to Global Research” on 15 September.',
  },
  {
    date: 'October 2026',
    title: 'Tyshchenko Legacy Conference at KNU',
    description:
      'The II International Scientific Conference on 14–15 October, where Dr. Larysa Liashenko gives a plenary talk on the global student collaboration network.',
  },
];

export const PARTICIPANTS = [
  {
    title: 'Students',
    description: 'Join international teams, lead projects and earn certificates.',
  },
  {
    title: 'Researchers',
    description: 'Supervise projects and run joint research with colleagues abroad.',
  },
  {
    title: 'Partner universities',
    description: 'Co-design modules and send mixed student teams.',
  },
  { title: 'Experts', description: 'Share practice in talks, workshops and mentoring.' },
] as const;

export const PRINCIPLES = [
  {
    title: 'From idea to outcome',
    description:
      'Every project starts with a student idea and ends with a tangible result: a paper, a prototype or a presentation.',
    to: ROUTES.STUDENT_RESEARCH,
  },
  {
    title: 'From challenge to collaboration',
    description:
      'Real-world challenges are solved by mixed international teams working online across time zones.',
    to: ROUTES.PROJECTS,
  },
  {
    title: 'From knowledge to implementation',
    description:
      'Knowledge from modules and COIL CyberBridge Talks is applied directly in research and practice.',
    to: ROUTES.EXPERIENTIAL_LEARNING,
  },
] as const;

export const JOIN_STEPS: StepItem[] = [
  {
    title: 'Choose a format',
    description: 'Pick a COIL project, a workshop or a certified module.',
  },
  { title: 'Apply', description: 'Register for a module or write to coil.knu@gmail.com.' },
  { title: 'Meet your team', description: 'Get matched with students from partner universities.' },
  { title: 'Create together', description: 'Work on the project and present the results.' },
];

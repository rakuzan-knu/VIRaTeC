import { ROUTES } from '@/shared/config/routes';
import type { StepItem } from '@/shared/ui/steps-list';

export const STATS = [
  { value: '16', label: 'partner universities' },
  { value: '11', label: 'countries' },
  { value: '360+', label: 'students in 2025–2026 modules' },
  { value: '142', label: 'community members' },
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
    title: 'VIRaTeC Global Community',
    description:
      'The community is founded at Taras Shevchenko National University of Kyiv and opens to students, educators and researchers worldwide.',
  },
  {
    date: 'June 2025',
    title: 'First intercontinental student COIL project',
    description:
      'Master’s students of KNU FIT deliver a cybersecurity module with partners in the UK, Colombia, Chile, the UAE and India.',
  },
  {
    date: 'April 2026',
    title: 'Foundations of NLP',
    description:
      'A certified Research-Based Learning module: 200+ students in 31 international teams from 7 universities.',
  },
  {
    date: 'May 2026',
    title: 'Data-Driven Decision Making',
    description:
      'An 8-week COIL with Coventry University and the University of Florida: 67 students worked with real data.',
  },
  {
    date: 'June 2026',
    title: 'Digital Narratives 2026',
    description:
      'KNU conference presenting the results of certified COIL modules to around 100 participants.',
  },
  {
    date: 'September 2026',
    title: 'Workshops with Johns Hopkins',
    description:
      'Global Collaboration Framework workshops with Dr. Kelly Tzoumis for 54 students and educators.',
  },
  {
    date: 'October 2026',
    title: 'International conference at KNU',
    description:
      'Section 7 “IT in Education and Science: Data-Driven and Intercultural Communication”, 14–15 October.',
    isUpcoming: true,
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
  { title: 'Apply', description: 'Fill in a short application or write to the coordinator.' },
  { title: 'Meet your team', description: 'Get matched with students from partner universities.' },
  { title: 'Create together', description: 'Work on the project and present the results.' },
];

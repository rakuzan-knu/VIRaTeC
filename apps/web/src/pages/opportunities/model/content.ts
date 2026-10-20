import { ROUTES } from '@/shared/config/routes';
import type { StepItem } from '@/shared/ui/steps-list';

export interface Opportunity {
  meta: string;
  title: string;
  description: string;
  actionLabel: string;
  to: string;
}

export interface AudienceGroup {
  id: string;
  tab: string;
  title: string;
  description: string;
  opportunities: Opportunity[];
}

export const AUDIENCE_GROUPS: AudienceGroup[] = [
  {
    id: 'for-students',
    tab: 'For Students',
    title: 'Learn by doing in international teams.',
    description:
      'Take part in real research with students from partner universities on three continents.',
    opportunities: [
      {
        meta: 'Online · 1 semester',
        title: 'COIL research project',
        description:
          'Join a mixed international team and work on one research challenge for a semester.',
        actionLabel: 'Apply',
        to: ROUTES.CONTACT,
      },
      {
        meta: 'Online · 8 weeks',
        title: 'Certified RBL modules',
        description:
          'Workshops led by Master’s students for international cohorts, with Certificates of Completion or Distinction.',
        actionLabel: 'Register',
        to: ROUTES.REGISTER,
      },
      {
        meta: 'Your format',
        title: 'Start your own project',
        description:
          'Have an idea? We help you find partners, a supervisor and turn it into a COIL project.',
        actionLabel: 'Propose an idea',
        to: ROUTES.CONTACT,
      },
    ],
  },
  {
    id: 'for-researchers',
    tab: 'For Researchers',
    title: 'Grow your research through collaboration.',
    description:
      'Work with colleagues from partner universities and mentor the next generation of researchers.',
    opportunities: [
      {
        meta: 'Online · 1 semester',
        title: 'Co-supervise a student team',
        description: 'Mentor an international student team from idea to published result.',
        actionLabel: 'Get involved',
        to: ROUTES.CONTACT,
      },
      {
        meta: 'Flexible',
        title: 'Joint research',
        description: 'Start a research project with colleagues from partner universities.',
        actionLabel: 'Discuss',
        to: ROUTES.CONTACT,
      },
      {
        meta: 'KNU · 14–15 Oct 2026',
        title: 'Call for keynote speakers',
        description: 'Section 7 “IT in Education and Science” at the KNU international conference.',
        actionLabel: 'Offer a topic',
        to: ROUTES.CONTACT,
      },
    ],
  },
  {
    id: 'for-partners',
    tab: 'For Partners',
    title: 'Bring your university into the network.',
    description:
      'Join the Global Collaboration Framework and give your students access to intercontinental projects.',
    opportunities: [
      {
        meta: 'Partnership',
        title: 'Join the Framework',
        description: 'Become a partner university and co-host COIL projects with KNU.',
        actionLabel: 'Become a partner',
        to: ROUTES.GLOBAL_COLLABORATION,
      },
      {
        meta: '1 semester',
        title: 'Co-host a COIL project',
        description: 'Match your course with a KNU course and run one shared project.',
        actionLabel: 'Propose a course',
        to: ROUTES.CONTACT,
      },
      {
        meta: 'Flexible',
        title: 'Industry expertise',
        description:
          'Organisations like Chartbeat bring real challenges and mentors to student teams.',
        actionLabel: 'Contact us',
        to: ROUTES.CONTACT,
      },
    ],
  },
];

export const HOW_IT_WORKS: StepItem[] = [
  { title: 'Write to us', description: 'Tell us who you are and what you are interested in.' },
  { title: 'Intro call', description: 'We meet online and discuss your goals and format.' },
  { title: 'Get matched', description: 'We connect you with a project, team or partner.' },
  { title: 'Start', description: 'You join the project and start working together.' },
];

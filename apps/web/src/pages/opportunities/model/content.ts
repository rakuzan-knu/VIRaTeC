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
      'Take part in real research with students from partner universities on four continents.',
    opportunities: [
      {
        meta: 'Online · 8 weeks',
        title: 'COIL research project',
        description:
          'Join a mixed international team, work with real data and present your results in a final video poster.',
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
        meta: 'Online · 8 weeks',
        title: 'Join the Board of Advisors',
        description:
          'Guide master’s students who lead workshops, or speak on a panel as an academic or industry expert.',
        actionLabel: 'Get involved',
        to: ROUTES.CONTACT,
      },
      {
        meta: 'Flexible',
        title: 'Joint publications',
        description:
          'Turn a shared idea into a research article, book chapter or monograph, including the planned collaborative book with JHU.',
        actionLabel: 'Discuss',
        to: ROUTES.CONTACT,
      },
      {
        meta: 'Oxford · 14–16 Dec 2026',
        title: 'Oxford Education Research Symposium',
        description:
          'Shared by VIRaTeC: abstracts are due by 15 November 2026, final registration by 22 November 2026.',
        actionLabel: 'Ask for guidance',
        to: ROUTES.CONTACT,
      },
    ],
  },
  {
    id: 'for-partners',
    tab: 'For Partners',
    title: 'Bring your university into the network.',
    description: 'Join VIRaTeC and give your students access to intercontinental COIL projects.',
    opportunities: [
      {
        meta: 'Partnership',
        title: 'Join the network',
        description: 'Become a partner university and co-host COIL projects with KNU.',
        actionLabel: 'Become a partner',
        to: ROUTES.GLOBAL_COLLABORATION,
      },
      {
        meta: '8 weeks',
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

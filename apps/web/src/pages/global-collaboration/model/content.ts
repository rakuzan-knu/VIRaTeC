import { ROUTES } from '@/shared/config/routes';
import type { StepItem } from '@/shared/ui/steps-list';

export const PARTNER_UNIVERSITIES = [
  { code: 'UK', name: 'Coventry University', location: 'United Kingdom' },
  { code: 'US', name: 'Johns Hopkins University', location: 'USA' },
  { code: 'US', name: 'Georgia State University', location: 'USA · Perimeter College' },
  { code: 'US', name: 'University of Florida', location: 'USA' },
  { code: 'US', name: 'University of Central Arkansas', location: 'USA' },
  { code: 'US', name: 'Campbellsville University', location: 'USA' },
  { code: 'IN', name: 'Karunya Institute of Technology and Sciences', location: 'India' },
  { code: 'DZ', name: 'École Nationale Polytechnique', location: 'Algeria · Algiers' },
  { code: 'CO', name: 'Universidad Católica de Colombia', location: 'Colombia' },
  { code: 'CL', name: 'Instituto Profesional Santo Tomás', location: 'Chile' },
  { code: 'AE', name: 'American University in the Emirates', location: 'UAE' },
  { code: 'UA', name: 'Pryazovskyi State Technical University', location: 'Ukraine' },
  { code: 'UA', name: 'Lutsk National Technical University', location: 'Ukraine' },
  { code: 'UA', name: 'Kyiv Aviation Institute', location: 'Ukraine' },
] as const;

export const FRAMEWORK_STATS = [
  { value: '14', label: 'partner universities' },
  { value: '8', label: 'countries' },
];

export const FORMATS = [
  {
    title: 'COIL projects',
    description:
      'Mixed teams of students from two or more universities solve a shared challenge online.',
    to: ROUTES.PROJECTS,
  },
  {
    title: 'COIL CyberBridge Talks',
    description:
      'An international conference series where student teams present the results of concurrent COIL modules.',
    to: ROUTES.PUBLICATIONS,
  },
  {
    title: 'Role-play & digital simulation',
    description:
      'Global Collaboration Framework sessions with Johns Hopkins University, such as an offshore wind farm negotiation.',
    to: ROUTES.EXPERIENTIAL_LEARNING,
  },
] as const;

export const PARTNERSHIP_STEPS: StepItem[] = [
  { title: 'Get in touch', description: 'Write to us about your university and interests.' },
  { title: 'Align goals', description: 'Agree on topics, formats and schedule.' },
  { title: 'Launch a pilot', description: 'Run a first COIL project or workshop.' },
  { title: 'Grow together', description: 'Scale to modules and joint research.' },
];

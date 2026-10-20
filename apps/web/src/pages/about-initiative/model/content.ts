import type { StepItem } from '@/shared/ui/steps-list';
import larysaPhoto from '@/shared/assets/people/larysa-liashenko.webp';

export const MISSION_VISION = [
  {
    label: 'Mission',
    text: 'To create inclusive virtual environments where participants from different countries work together on joint projects, discussions and problem-solving tasks.',
  },
  {
    label: 'Vision',
    text: 'We do not educate students to fit into a predetermined future. We create opportunities for them to discover themselves and shape the world they will live in.',
  },
] as const;

export const VALUES = [
  { title: 'Openness', description: 'Research and learning open to every student and partner.' },
  { title: 'Collaboration', description: 'Mixed international teams working as one.' },
  { title: 'Student leadership', description: 'Students propose ideas and lead projects.' },
  { title: 'Real impact', description: 'Results that matter beyond the classroom.' },
] as const;

export const PHILOSOPHY: StepItem[] = [
  {
    title: 'Students as co-creators',
    description: 'Students don’t just attend — they shape the research.',
  },
  {
    title: 'Learning across borders',
    description: 'Every project brings together different countries and cultures.',
  },
  {
    title: 'Learning by doing',
    description: 'Knowledge is applied in real projects with real results.',
  },
];

export interface TeamMember {
  name: string;
  role: string;
  photo?: string;
}

export const TEAM: TeamMember[] = [
  {
    name: 'Larysa Liashenko',
    role: 'Founder · Academic Lead of COIL Programmes, Associate Professor, Institute of Philology, KNU',
    photo: larysaPhoto,
  },
  { name: 'Tetiana Andriichuk', role: 'Co-admin · Assistant Professor, KNU' },
  { name: 'Olha Yezerska', role: 'Student moderator · KNU FIT' },
  { name: 'Eduard Parkhomenko', role: 'Team Lead, NLP module · KNU FIT' },
];

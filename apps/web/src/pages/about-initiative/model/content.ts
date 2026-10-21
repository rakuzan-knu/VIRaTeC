import type { StepItem } from '@/shared/ui/steps-list';
import larysaPhoto from '@/shared/assets/people/larysa-liashenko.webp';
import tetianaPhoto from '@/shared/assets/people/tetiana-andriichuk.webp';
import anastasiiaPhoto from '@/shared/assets/people/anastasiia-loban.webp';
import antonPhoto from '@/shared/assets/people/anton-dmytrenko.webp';
import yuliiaPhoto from '@/shared/assets/people/yuliia-novichkova.webp';

export const MISSION_VISION = [
  {
    label: 'Mission',
    text: 'To create inclusive virtual environments where participants from different countries work together on joint projects, discussions and problem-solving, making global learning more accessible.',
  },
  {
    label: 'Vision',
    text: 'We do not educate students to fit into a predetermined future. We create opportunities for them to discover themselves, create their own futures and take responsibility for the world they will live and work in.',
  },
] as const;

export const VALUES = [
  {
    title: 'Intercultural competence',
    description: 'Empathy, trust and openness in international teams.',
  },
  { title: 'Digital literacy', description: 'AI and EdTech used critically and responsibly.' },
  {
    title: 'Student leadership',
    description: 'Master’s students design and lead workshops for undergraduates.',
  },
  {
    title: 'Subject expertise',
    description: 'Language competence and disciplinary knowledge developed together.',
  },
] as const;

export const PHILOSOPHY: StepItem[] = [
  {
    title: 'Students as co-creators',
    description: 'Students move from completing assignments to designing projects and research.',
  },
  {
    title: 'Learning for others',
    description: 'Peer teaching: master’s students design and lead workshops for undergraduates.',
  },
  {
    title: 'Learning by doing',
    description:
      'Experiential Learning for undergraduates, Research-Based Learning for postgraduates.',
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
    role: 'Founder & Academic Lead of COIL Programmes · PhD in Psychology, Associate Professor, Department of Foreign Languages for Mathematical Faculties, KNU',
    photo: larysaPhoto,
  },
  {
    name: 'Tetiana Andriichuk',
    role: 'Co-admin of the VIRaTeC community · Assistant Professor, KNU',
    photo: tetianaPhoto,
  },
  {
    name: 'Anastasiia Loban',
    role: 'Head Project Lead & Program Creator · Cybersecurity COIL modules',
    photo: anastasiiaPhoto,
  },
  {
    name: 'Anton Dmytrenko',
    role: 'Project Lead & Workshop Trainer · Cybersecurity COIL',
    photo: antonPhoto,
  },
  {
    name: 'Eduard Parkhomenko',
    role: 'Team Lead · Foundations of NLP, Master’s student, Department of Intelligent Technologies, KNU FIT',
  },
  {
    name: 'Yuliia Novichkova',
    role: 'Team Lead · Fundamentals of Cyber Hygiene, KNU FIT',
    photo: yuliiaPhoto,
  },
  { name: 'Olha Yezerska', role: 'Workshop trainer & moderator · KNU FIT' },
];

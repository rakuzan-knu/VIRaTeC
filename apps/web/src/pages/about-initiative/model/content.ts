import { defineMessages } from '@/shared/i18n';
import type { StepItem } from '@/shared/ui/steps-list';
import larysaPhoto from '@/shared/assets/people/larysa-liashenko.webp';
import tetianaPhoto from '@/shared/assets/people/tetiana-andriichuk.webp';
import anastasiiaPhoto from '@/shared/assets/people/anastasiia-loban.webp';
import antonPhoto from '@/shared/assets/people/anton-dmytrenko.webp';
import yuliiaPhoto from '@/shared/assets/people/yuliia-novichkova.webp';

export interface TeamMember {
  name: string;
  role: string;
  photo?: string;
}

interface LabeledText {
  label: string;
  text: string;
}

interface TitledText {
  title: string;
  description: string;
}

export interface AboutInitiativeContent {
  documentTitle: string;
  breadcrumb: string[];
  title: string;
  accent: string;
  description: string;
  missionEyebrow: string;
  missionTitle: string;
  missionVision: LabeledText[];
  valuesEyebrow: string;
  valuesTitle: string;
  values: TitledText[];
  philosophyEyebrow: string;
  philosophyTitle: string;
  philosophy: StepItem[];
  founderEyebrow: string;
  founderName: string;
  founderRole: string;
  founderBio: string[];
  teamEyebrow: string;
  teamTitle: string;
  teamAccent: string;
  team: TeamMember[];
  ctaTitle: string;
  ctaDescription: string;
  ctaAction: string;
}

export const FOUNDER_PHOTO = larysaPhoto;

export const ABOUT_INITIATIVE_CONTENT = defineMessages<AboutInitiativeContent>({
  en: {
    documentTitle: 'About the Initiative',
    breadcrumb: ['About', 'About Initiative'],
    title: 'Why VIRaTeC',
    accent: 'exists.',
    description:
      'Since 2019 Dr. Larysa Liashenko and colleagues have connected students across Ukraine, the UK, the USA, Asia and Europe through virtual learning.',
    missionEyebrow: 'Mission & Vision',
    missionTitle: 'What drives us',
    missionVision: [
      {
        label: 'Mission',
        text: 'To create inclusive virtual environments where participants from different countries work together on joint projects, discussions and problem-solving, making global learning more accessible.',
      },
      {
        label: 'Vision',
        text: 'We do not educate students to fit into a predetermined future. We create opportunities for them to discover themselves, create their own futures and take responsibility for the world they will live and work in.',
      },
    ],
    valuesEyebrow: 'Our values',
    valuesTitle: 'What we believe in',
    values: [
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
    ],
    philosophyEyebrow: 'Educational philosophy',
    philosophyTitle: 'How we teach',
    philosophy: [
      {
        title: 'Students as co-creators',
        description:
          'Students move from completing assignments to designing projects and research.',
      },
      {
        title: 'Learning for others',
        description:
          'Peer teaching: master’s students design and lead workshops for undergraduates.',
      },
      {
        title: 'Learning by doing',
        description:
          'Experiential Learning for undergraduates, Research-Based Learning for postgraduates.',
      },
    ],
    founderEyebrow: 'Academic Lead',
    founderName: 'Dr. Larysa Liashenko',
    founderRole: 'Associate Professor · PhD in Psychology, CELTA · Honoured Educator of Ukraine',
    founderBio: [
      'Dr. Larysa Liashenko, Associate Professor at Taras Shevchenko National University of Kyiv (PhD in Psychology, CELTA), is an expert in Research-Based Learning and EAP/ESP pedagogy.',
      'An award-winning academic recognized as an Honoured Educator of Ukraine and commendee of the NATO-Ukraine PDP, she has authored around 50 scholarly works at the intersection of developmental psychology and applied linguistics.',
      'As Academic Lead of the VIRaTeC Global COIL Program, she spearheads transformative Internationalisation at Home initiatives. She facilitates student-centered, cross-border research platforms where postgraduate module designers and industry mentors empower undergraduate researchers through authentic global collaboration.',
    ],
    teamEyebrow: 'Team',
    teamTitle: 'People behind',
    teamAccent: 'the initiative',
    team: [
      {
        name: 'Larysa Liashenko',
        role: 'Founder & Academic Lead of the VIRaTeC Global COIL Program · Associate Professor, Department of Foreign Languages for Mathematical Faculties, KNU',
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
    ],
    ctaTitle: 'Discover the community',
    ctaDescription: 'See how VIRaTeC works and how universities collaborate within the network.',
    ctaAction: 'Explore VIRaTeC',
  },
  uk: {
    documentTitle: 'Про ініціативу',
    breadcrumb: ['Про нас', 'Про ініціативу'],
    title: 'Навіщо існує',
    accent: 'VIRaTeC.',
    description:
      'З 2019 року д-р Лариса Ляшенко та колеги об’єднують студентів з України, Великої Британії, США, Азії та Європи завдяки віртуальному навчанню.',
    missionEyebrow: 'Місія та бачення',
    missionTitle: 'Що нас рухає',
    missionVision: [
      {
        label: 'Місія',
        text: 'Створювати інклюзивні віртуальні середовища, де учасники з різних країн разом працюють над спільними проєктами, дискусіями та розв’язанням проблем, роблячи глобальне навчання доступнішим.',
      },
      {
        label: 'Бачення',
        text: 'Ми не готуємо студентів до наперед визначеного майбутнього. Ми створюємо можливості, щоб вони відкрили себе, творили власне майбутнє та брали відповідальність за світ, у якому житимуть і працюватимуть.',
      },
    ],
    valuesEyebrow: 'Наші цінності',
    valuesTitle: 'У що ми віримо',
    values: [
      {
        title: 'Міжкультурна компетентність',
        description: 'Емпатія, довіра та відкритість у міжнародних командах.',
      },
      {
        title: 'Цифрова грамотність',
        description: 'Критичне й відповідальне використання ШІ та EdTech.',
      },
      {
        title: 'Студентське лідерство',
        description: 'Магістранти розробляють і проводять воркшопи для бакалаврів.',
      },
      {
        title: 'Предметна експертиза',
        description: 'Мовна компетентність і фахові знання розвиваються разом.',
      },
    ],
    philosophyEyebrow: 'Освітня філософія',
    philosophyTitle: 'Як ми навчаємо',
    philosophy: [
      {
        title: 'Студенти як співтворці',
        description:
          'Студенти переходять від виконання завдань до розроблення проєктів і досліджень.',
      },
      {
        title: 'Навчання для інших',
        description: 'Взаємонавчання: магістранти розробляють і проводять воркшопи для бакалаврів.',
      },
      {
        title: 'Навчання через практику',
        description:
          'Experiential Learning для бакалаврів, Research-Based Learning для магістрантів і аспірантів.',
      },
    ],
    founderEyebrow: 'Академічна керівниця',
    founderName: 'Д-р Лариса Ляшенко',
    founderRole:
      'Доцентка · кандидатка психологічних наук, CELTA · заслужена працівниця освіти України',
    founderBio: [
      'Д-р Лариса Ляшенко — доцентка Київського національного університету імені Тараса Шевченка (кандидатка психологічних наук, CELTA), експертка з Research-Based Learning та методики EAP/ESP.',
      'Відзначена нагородами науковиця, заслужена працівниця освіти України та відзначена учасниця програми NATO-Ukraine PDP, вона є авторкою близько 50 наукових праць на перетині психології розвитку та прикладної лінгвістики.',
      'Як академічна керівниця глобальної COIL-програми VIRaTeC, вона очолює трансформаційні ініціативи інтернаціоналізації вдома. Вона розвиває студентоцентровані міжнародні дослідницькі платформи, де магістранти — розробники модулів — і ментори з індустрії допомагають бакалаврам-дослідникам через справжню глобальну співпрацю.',
    ],
    teamEyebrow: 'Команда',
    teamTitle: 'Люди, що стоять',
    teamAccent: 'за ініціативою',
    team: [
      {
        name: 'Лариса Ляшенко',
        role: 'Засновниця та академічна керівниця програм COIL · кандидатка психологічних наук, доцентка кафедри іноземних мов математичних факультетів, КНУ',
        photo: larysaPhoto,
      },
      {
        name: 'Тетяна Андрійчук',
        role: 'Співадміністраторка спільноти VIRaTeC · асистентка, КНУ',
        photo: tetianaPhoto,
      },
      {
        name: 'Анастасія Лобан',
        role: 'Головна керівниця проєктів і авторка програми · COIL-модулі з кібербезпеки',
        photo: anastasiiaPhoto,
      },
      {
        name: 'Антон Дмитренко',
        role: 'Керівник проєкту та тренер воркшопів · COIL з кібербезпеки',
        photo: antonPhoto,
      },
      {
        name: 'Едуард Пархоменко',
        role: 'Тимлід · Foundations of NLP, магістрант кафедри інтелектуальних технологій, ФІТ КНУ',
      },
      {
        name: 'Юлія Новічкова',
        role: 'Тимлідка · Fundamentals of Cyber Hygiene, ФІТ КНУ',
        photo: yuliiaPhoto,
      },
      { name: 'Ольга Єзерська', role: 'Тренерка воркшопів і модераторка · ФІТ КНУ' },
    ],
    ctaTitle: 'Відкрийте спільноту',
    ctaDescription: 'Дізнайтеся, як працює VIRaTeC і як університети співпрацюють у мережі.',
    ctaAction: 'Про VIRaTeC',
  },
});

import type { Localized } from '@/shared/i18n/model/types';
import type { Founder, TeamMember } from './types';
import asset_person_anastasiia_loban_photo from '@/shared/assets/contentful/person-anastasiia-loban-photo.webp';
import asset_person_anton_dmytrenko_photo from '@/shared/assets/contentful/person-anton-dmytrenko-photo.webp';
import asset_person_larysa_liashenko_photo from '@/shared/assets/contentful/person-larysa-liashenko-photo.webp';
import asset_person_tetiana_andriichuk_photo from '@/shared/assets/contentful/person-tetiana-andriichuk-photo.webp';
import asset_person_yuliia_novichkova_photo from '@/shared/assets/contentful/person-yuliia-novichkova-photo.webp';

export const TEAM: Localized<TeamMember[]> = {
  en: [
    {
      name: 'Larysa Liashenko',
      role: 'Founder & Academic Lead of the VIRaTeC Global COIL Program · Associate Professor, Department of Foreign Languages for Mathematical Faculties, KNU',
      photo: asset_person_larysa_liashenko_photo,
    },
    {
      name: 'Tetiana Andriichuk',
      role: 'Co-admin of the VIRaTeC community · Assistant Professor, KNU',
      photo: asset_person_tetiana_andriichuk_photo,
    },
    {
      name: 'Anastasiia Loban',
      role: 'Head Project Lead & Program Creator · Cybersecurity COIL modules',
      photo: asset_person_anastasiia_loban_photo,
    },
    {
      name: 'Anton Dmytrenko',
      role: 'Project Lead & Workshop Trainer · Cybersecurity COIL',
      photo: asset_person_anton_dmytrenko_photo,
    },
    {
      name: 'Eduard Parkhomenko',
      role: 'Team Lead · Foundations of NLP, Master’s student, Department of Intelligent Technologies, KNU FIT',
    },
    {
      name: 'Yuliia Novichkova',
      role: 'Team Lead · Fundamentals of Cyber Hygiene, KNU FIT',
      photo: asset_person_yuliia_novichkova_photo,
    },
    { name: 'Olha Yezerska', role: 'Workshop trainer & moderator · KNU FIT' },
  ],
  uk: [
    {
      name: 'Лариса Ляшенко',
      role: 'Засновниця та академічна керівниця програм COIL · кандидатка психологічних наук, доцентка кафедри іноземних мов математичних факультетів, КНУ',
      photo: asset_person_larysa_liashenko_photo,
    },
    {
      name: 'Тетяна Андрійчук',
      role: 'Співадміністраторка спільноти VIRaTeC · асистентка, КНУ',
      photo: asset_person_tetiana_andriichuk_photo,
    },
    {
      name: 'Анастасія Лобан',
      role: 'Головна керівниця проєктів і авторка програми · COIL-модулі з кібербезпеки',
      photo: asset_person_anastasiia_loban_photo,
    },
    {
      name: 'Антон Дмитренко',
      role: 'Керівник проєкту та тренер воркшопів · COIL з кібербезпеки',
      photo: asset_person_anton_dmytrenko_photo,
    },
    {
      name: 'Едуард Пархоменко',
      role: 'Тимлід · Foundations of NLP, магістрант кафедри інтелектуальних технологій, ФІТ КНУ',
    },
    {
      name: 'Юлія Новічкова',
      role: 'Тимлідка · Fundamentals of Cyber Hygiene, ФІТ КНУ',
      photo: asset_person_yuliia_novichkova_photo,
    },
    { name: 'Ольга Єзерська', role: 'Тренерка воркшопів і модераторка · ФІТ КНУ' },
  ],
};

export const FOUNDER: Localized<Founder> = {
  en: {
    name: 'Dr. Larysa Liashenko',
    role: 'Associate Professor · PhD in Psychology, CELTA · Honoured Educator of Ukraine',
    bio: [
      'Dr. Larysa Liashenko, Associate Professor at Taras Shevchenko National University of Kyiv (PhD in Psychology, CELTA), is an expert in Research-Based Learning and EAP/ESP pedagogy.',
      'An award-winning academic recognized as an Honoured Educator of Ukraine and commendee of the NATO-Ukraine PDP, she has authored around 50 scholarly works at the intersection of developmental psychology and applied linguistics.',
      'As Academic Lead of the VIRaTeC Global COIL Program, she spearheads transformative Internationalisation at Home initiatives. She facilitates student-centered, cross-border research platforms where postgraduate module designers and industry mentors empower undergraduate researchers through authentic global collaboration.',
    ],
    photo: asset_person_larysa_liashenko_photo,
  },
  uk: {
    name: 'Д-р Лариса Ляшенко',
    role: 'Доцентка · кандидатка психологічних наук, CELTA · заслужена працівниця освіти України',
    bio: [
      'Д-р Лариса Ляшенко — доцентка Київського національного університету імені Тараса Шевченка (кандидатка психологічних наук, CELTA), експертка з Research-Based Learning та методики EAP/ESP.',
      'Відзначена нагородами науковиця, заслужена працівниця освіти України та відзначена учасниця програми NATO-Ukraine PDP, вона є авторкою близько 50 наукових праць на перетині психології розвитку та прикладної лінгвістики.',
      'Як академічна керівниця глобальної COIL-програми VIRaTeC, вона очолює трансформаційні ініціативи інтернаціоналізації вдома. Вона розвиває студентоцентровані міжнародні дослідницькі платформи, де магістранти — розробники модулів — і ментори з індустрії допомагають бакалаврам-дослідникам через справжню глобальну співпрацю.',
    ],
    photo: asset_person_larysa_liashenko_photo,
  },
};

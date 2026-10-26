import type { Localized } from '@/shared/i18n/model/types';
import type { AudienceGroup } from './types';
import { ROUTES } from '@/shared/config/routes';

export const AUDIENCE_GROUPS: Localized<AudienceGroup[]> = {
  en: [
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
  ],
  uk: [
    {
      id: 'for-students',
      tab: 'Для студентів',
      title: 'Навчайтеся на практиці в міжнародних командах.',
      description:
        'Беріть участь у реальних дослідженнях зі студентами з університетів-партнерів на чотирьох континентах.',
      opportunities: [
        {
          meta: 'Онлайн · 8 тижнів',
          title: 'Дослідницький COIL-проєкт',
          description:
            'Приєднайтеся до змішаної міжнародної команди, працюйте з реальними даними та представте результати у фінальному відеопостері.',
          actionLabel: 'Подати заявку',
          to: ROUTES.CONTACT,
        },
        {
          meta: 'Онлайн · 8 тижнів',
          title: 'Сертифіковані модулі RBL',
          description:
            'Воркшопи від магістрантів для міжнародних груп із сертифікатами про проходження або з відзнакою.',
          actionLabel: 'Зареєструватися',
          to: ROUTES.REGISTER,
        },
        {
          meta: 'Ваш формат',
          title: 'Започаткуйте власний проєкт',
          description:
            'Маєте ідею? Ми допоможемо знайти партнерів і наукового керівника та перетворити її на COIL-проєкт.',
          actionLabel: 'Запропонувати ідею',
          to: ROUTES.CONTACT,
        },
      ],
    },
    {
      id: 'for-researchers',
      tab: 'Для дослідників',
      title: 'Розвивайте свої дослідження через співпрацю.',
      description:
        'Працюйте з колегами з університетів-партнерів і будьте наставниками для нового покоління дослідників.',
      opportunities: [
        {
          meta: 'Онлайн · 8 тижнів',
          title: 'Долучіться до Консультативної ради',
          description:
            'Супроводжуйте магістрантів, які проводять воркшопи, або виступайте на панелі як академічний чи індустріальний експерт.',
          actionLabel: 'Долучитися',
          to: ROUTES.CONTACT,
        },
        {
          meta: 'Гнучкий графік',
          title: 'Спільні публікації',
          description:
            'Перетворіть спільну ідею на наукову статтю, розділ книги чи монографію, зокрема в межах запланованої спільної книги з JHU.',
          actionLabel: 'Обговорити',
          to: ROUTES.CONTACT,
        },
        {
          meta: 'Оксфорд · 14–16 грудня 2026',
          title: 'Oxford Education Research Symposium',
          description:
            'Анонс від VIRaTeC: тези приймають до 15 листопада 2026 року, остаточна реєстрація — до 22 листопада 2026 року.',
          actionLabel: 'Отримати консультацію',
          to: ROUTES.CONTACT,
        },
      ],
    },
    {
      id: 'for-partners',
      tab: 'Для партнерів',
      title: 'Залучіть свій університет до мережі.',
      description:
        'Приєднуйтеся до VIRaTeC і відкрийте своїм студентам доступ до міжконтинентальних COIL-проєктів.',
      opportunities: [
        {
          meta: 'Партнерство',
          title: 'Приєднатися до мережі',
          description: 'Станьте університетом-партнером і проводьте COIL-проєкти спільно з КНУ.',
          actionLabel: 'Стати партнером',
          to: ROUTES.GLOBAL_COLLABORATION,
        },
        {
          meta: '8 тижнів',
          title: 'Спільний COIL-проєкт',
          description: 'Поєднайте свій курс із курсом КНУ та реалізуйте один спільний проєкт.',
          actionLabel: 'Запропонувати курс',
          to: ROUTES.CONTACT,
        },
        {
          meta: 'Гнучкий графік',
          title: 'Індустріальна експертиза',
          description:
            'Організації на кшталт Chartbeat пропонують студентським командам реальні завдання та менторів.',
          actionLabel: 'Зв’язатися з нами',
          to: ROUTES.CONTACT,
        },
      ],
    },
  ],
};

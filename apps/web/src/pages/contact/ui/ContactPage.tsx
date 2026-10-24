import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/config/routes';
import { CONTACT_EMAIL, SOCIAL_LINKS } from '@/shared/config/navigation';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { OptionalLink } from '@/shared/ui/optional-link';
import { CardLinkLabel } from '@/shared/ui/card-link-label';
import { ResponsiveImage } from '@/shared/ui/responsive-image';
import { ButtonArrow, linkButtonClassName } from '@/shared/ui/link-button';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import larysaPhoto from '@/shared/assets/people/larysa-liashenko.webp';
import linkedinIcon from '@/shared/assets/icons/linkedin.svg';
import { useSeo } from '@/shared/lib';

const CARD_CLASS =
  'flex flex-col gap-4 atlas-card rounded-[24px] border border-transparent p-6 lg:min-h-[266px] lg:rounded-[28px] lg:p-8';

const COLUMN_TITLE_CLASS =
  'font-display text-[30px] leading-[36px] font-medium tracking-[-0.025em] text-white lg:text-[40px] lg:leading-[46px]';

type SocialKey = 'group' | 'chair' | 'orcid' | 'scopus' | 'facebook' | 'scholar';

const SOCIALS: { key: SocialKey; href: string | null; badge: string | null }[] = [
  { key: 'group', href: SOCIAL_LINKS.linkedinGroup, badge: null },
  { key: 'chair', href: SOCIAL_LINKS.linkedinChair, badge: null },
  { key: 'orcid', href: SOCIAL_LINKS.orcid, badge: 'iD' },
  { key: 'scopus', href: SOCIAL_LINKS.scopus, badge: 'Sc' },
  { key: 'facebook', href: SOCIAL_LINKS.facebookGroup, badge: 'f' },
  { key: 'scholar', href: SOCIAL_LINKS.googleScholar, badge: 'GS' },
];

interface CollaborationWay {
  title: string;
  description: string;
  subject: string;
  linkLabel: string;
  to: string;
}

interface ContactContent {
  documentTitle: string;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  getInTouchTitle: string;
  emailTitle: string;
  replyTime: string;
  writeToUs: string;
  chairTitle: string;
  chairName: string;
  chairRole: string;
  locationTitle: string;
  socialLabels: Record<SocialKey, string>;
  waysTitle: string;
  subjectPrefix: string;
  ways: CollaborationWay[];
}

const CONTACT_CONTENT = defineMessages<ContactContent>({
  en: {
    documentTitle: 'Contact',
    eyebrow: 'Contact / Collaborate',
    title: 'Let’s build research',
    accent: 'together.',
    description:
      'Whether you are a student with an idea, a researcher looking for an international team or a university that wants to join the network — write to us and we will find the right format together.',
    getInTouchTitle: 'Get in touch',
    emailTitle: 'Email',
    replyTime: 'We usually reply within 2–3 working days.',
    writeToUs: 'Write to us',
    chairTitle: 'Project Chair',
    chairName: 'Larysa Liashenko',
    chairRole:
      'PhD in Psychology, Associate Professor, Department of Foreign Languages for Mathematical Faculties, Educational and Scientific Institute of Philology, KNU · Honoured Educator of Ukraine',
    locationTitle: 'Location',
    socialLabels: {
      group: 'VIRaTeC group',
      chair: 'Dr. Larysa Liashenko',
      orcid: 'ORCID',
      scopus: 'Scopus',
      facebook: 'Facebook group',
      scholar: 'Google Scholar',
    },
    waysTitle: 'Ways to collaborate',
    subjectPrefix: 'Subject',
    ways: [
      {
        title: 'For students',
        description:
          'Join an ongoing COIL project or propose your own research idea. Tell us your faculty, year and topic of interest.',
        subject: 'Student project',
        linkLabel: 'Opportunities →',
        to: ROUTES.OPPORTUNITIES,
      },
      {
        title: 'For researchers',
        description:
          'Co-supervise student teams, run joint workshops or start a research project with colleagues from partner universities.',
        subject: 'Research collaboration',
        linkLabel: 'Research Areas →',
        to: ROUTES.RESEARCH_AREAS,
      },
      {
        title: 'For partner universities',
        description:
          'Bring your students into intercontinental COIL projects within the Global Collaboration Framework.',
        subject: 'University partnership',
        linkLabel: 'Global Collaboration Framework →',
        to: ROUTES.GLOBAL_COLLABORATION,
      },
    ],
  },
  uk: {
    documentTitle: 'Контакти',
    eyebrow: 'Контакти / Співпраця',
    title: 'Створюймо дослідження',
    accent: 'разом.',
    description:
      'Ви студент з ідеєю, дослідник, який шукає міжнародну команду, чи університет, що хоче долучитися до мережі? Напишіть нам — і ми разом знайдемо відповідний формат.',
    getInTouchTitle: 'Зв’яжіться з нами',
    emailTitle: 'Електронна пошта',
    replyTime: 'Зазвичай ми відповідаємо протягом 2–3 робочих днів.',
    writeToUs: 'Написати нам',
    chairTitle: 'Керівниця проєкту',
    chairName: 'Лариса Ляшенко',
    chairRole:
      'Кандидатка психологічних наук, доцентка кафедри іноземних мов математичних факультетів Навчально-наукового інституту філології, КНУ · Заслужена працівниця освіти України',
    locationTitle: 'Розташування',
    socialLabels: {
      group: 'Група VIRaTeC',
      chair: 'Д-р Лариса Ляшенко',
      orcid: 'ORCID',
      scopus: 'Scopus',
      facebook: 'Група у Facebook',
      scholar: 'Google Scholar',
    },
    waysTitle: 'Як співпрацювати',
    subjectPrefix: 'Тема',
    ways: [
      {
        title: 'Для студентів',
        description:
          'Долучайтеся до чинного COIL-проєкту або запропонуйте власну дослідницьку ідею. Вкажіть свій факультет, курс і тему, що вас цікавить.',
        subject: 'Студентський проєкт',
        linkLabel: 'Можливості →',
        to: ROUTES.OPPORTUNITIES,
      },
      {
        title: 'Для дослідників',
        description:
          'Керуйте студентськими командами, проводьте спільні воркшопи або започаткуйте дослідницький проєкт із колегами з університетів-партнерів.',
        subject: 'Наукова співпраця',
        linkLabel: 'Напрями досліджень →',
        to: ROUTES.RESEARCH_AREAS,
      },
      {
        title: 'Для університетів-партнерів',
        description:
          'Залучайте своїх студентів до міжконтинентальних COIL-проєктів у межах Global Collaboration Framework.',
        subject: 'Партнерство університетів',
        linkLabel: 'Рамкова програма глобальної співпраці →',
        to: ROUTES.GLOBAL_COLLABORATION,
      },
    ],
  },
});

const mailtoWithSubject = (subject: string) =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;

export function ContactPage() {
  const content = useLocalized(CONTACT_CONTENT);
  const common = useCommonMessages();
  useSeo(content.documentTitle);

  return (
    <PageLayout
      intro={
        <PageIntro
          tone="glow"
          eyebrow={content.eyebrow}
          title={content.title}
          accent={content.accent}
          description={content.description}
          className="lg:pt-20 lg:pb-24"
        />
      }
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-5 pt-2 pb-[72px] lg:flex-row lg:items-start lg:gap-8 lg:px-[85px] lg:pt-6 lg:pb-[120px]">
        <section
          aria-labelledby="get-in-touch-title"
          className="flex flex-col gap-5 lg:w-[520px] lg:shrink-0"
        >
          <h2 id="get-in-touch-title" className={COLUMN_TITLE_CLASS}>
            {content.getInTouchTitle}
          </h2>

          <article className={CARD_CLASS}>
            <h3 className="text-[15px] leading-5 text-viratec-subtle">{content.emailTitle}</h3>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-[22px] font-medium break-all text-viratec-cyan hover:underline lg:text-[28px]"
            >
              {CONTACT_EMAIL}
            </a>
            <p className="text-base text-viratec-muted">{content.replyTime}</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={linkButtonClassName({
                className: 'mt-auto w-full lg:w-auto lg:self-start',
              })}
            >
              {content.writeToUs}
              <ButtonArrow />
            </a>
          </article>

          <article className={CARD_CLASS}>
            <h3 className="text-[15px] leading-5 text-viratec-subtle">{content.chairTitle}</h3>
            <div className="flex items-center gap-[18px]">
              <ResponsiveImage
                src={larysaPhoto}
                sizes="64px"
                alt=""
                width={64}
                height={64}
                loading="lazy"
                className="size-16 shrink-0 rounded-full object-cover"
              />
              <div className="flex flex-col gap-1">
                <p className="text-xl font-medium text-white lg:text-[22px]">{content.chairName}</p>
                <p className="text-[15px] leading-[22px] text-viratec-muted">{content.chairRole}</p>
              </div>
            </div>
          </article>

          <article className={CARD_CLASS}>
            <h3 className="text-[15px] leading-5 text-viratec-subtle">{content.locationTitle}</h3>
            <address className="text-lg leading-7 text-white not-italic">
              {common.university}
              <br />
              {common.kyivUkraine}
            </address>
            <ul className="mt-auto flex flex-wrap gap-x-6 gap-y-3 pt-4">
              {SOCIALS.map((social) => (
                <li key={social.key}>
                  <OptionalLink
                    href={social.href}
                    label={content.socialLabels[social.key]}
                    className="flex items-center gap-2.5 text-sm leading-5 text-viratec-soft transition-colors hover:text-white"
                    unavailableClassName="hover:text-viratec-soft"
                  >
                    <span className="flex size-8 items-center justify-center rounded-[10px] border border-white/14 bg-white/6">
                      {social.badge ? (
                        <span className="text-xs leading-[14px] font-medium text-white">
                          {social.badge}
                        </span>
                      ) : (
                        <img src={linkedinIcon} alt="" />
                      )}
                    </span>
                    {content.socialLabels[social.key]}
                  </OptionalLink>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section aria-labelledby="ways-title" className="flex flex-1 flex-col gap-5">
          <h2 id="ways-title" className={COLUMN_TITLE_CLASS}>
            {content.waysTitle}
          </h2>
          {content.ways.map((way) => (
            <article key={way.to} className={CARD_CLASS}>
              <h3 className="font-display text-xl leading-[26px] font-medium tracking-[-0.02em] text-white lg:text-2xl lg:leading-[30px]">
                {way.title}
              </h3>
              <p className="text-[15px] leading-[22px] text-viratec-muted lg:text-base lg:leading-6">
                {way.description}
              </p>
              <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <a
                  href={mailtoWithSubject(way.subject)}
                  className="text-sm text-viratec-subtle transition-colors hover:text-white"
                >
                  {content.subjectPrefix}: {way.subject}
                </a>
                <Link
                  to={way.to}
                  className="group/card rounded text-[15px] font-medium text-viratec-cyan focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
                >
                  <CardLinkLabel label={way.linkLabel} />
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </PageLayout>
  );
}

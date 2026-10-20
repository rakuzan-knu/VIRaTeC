import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/config/routes';
import { CONTACT_EMAIL, SOCIAL_LINKS } from '@/shared/config/navigation';
import { ButtonArrow, linkButtonClassName } from '@/shared/ui/link-button';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import larysaPhoto from '@/shared/assets/people/larysa-liashenko.webp';
import linkedinIcon from '@/shared/assets/icons/linkedin.svg';

const CARD_CLASS =
  'flex flex-col gap-4 rounded-[24px] border border-white/12 bg-white/5 p-6 lg:min-h-[266px] lg:p-8';

const COLUMN_TITLE_CLASS =
  'text-[28px] leading-[34px] tracking-[-0.56px] text-white lg:text-[36px] lg:leading-[42px] lg:tracking-[-0.72px]';

const WAYS = [
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
] as const;

const SOCIALS = [
  { label: 'VIRaTeC group', href: SOCIAL_LINKS.linkedinGroup, icon: 'linkedin' },
  { label: 'Project Chair', href: SOCIAL_LINKS.linkedinChair, icon: 'linkedin' },
  { label: 'ResearchGate', href: SOCIAL_LINKS.researchGate, icon: 'rg' },
] as const;

const mailtoWithSubject = (subject: string) =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;

export function ContactPage() {
  return (
    <PageLayout
      intro={
        <PageIntro
          tone="glow"
          eyebrow="Contact / Collaborate"
          title="Let’s build research"
          accent="together."
          description="Whether you are a student with an idea, a researcher looking for an international team or a university that wants to join the network — write to us and we will find the right format together."
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
            Get in touch
          </h2>

          <article className={CARD_CLASS}>
            <h3 className="text-[15px] leading-5 text-viratec-subtle">Email</h3>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-[22px] font-medium break-all text-viratec-cyan hover:underline lg:text-[28px]"
            >
              {CONTACT_EMAIL}
            </a>
            <p className="text-base text-viratec-muted">
              We usually reply within 2–3 working days.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={linkButtonClassName({
                className: 'mt-auto w-full lg:w-auto lg:self-start',
              })}
            >
              Write to us
              <ButtonArrow />
            </a>
          </article>

          <article className={CARD_CLASS}>
            <h3 className="text-[15px] leading-5 text-viratec-subtle">Project Chair</h3>
            <div className="flex items-center gap-[18px]">
              <img
                src={larysaPhoto}
                alt="Larysa Liashenko"
                width={64}
                height={64}
                loading="lazy"
                className="size-16 shrink-0 rounded-full object-cover"
              />
              <div className="flex flex-col gap-1">
                <p className="text-xl font-medium text-white lg:text-[22px]">Larysa Liashenko</p>
                <p className="text-[15px] leading-[22px] text-viratec-muted">
                  Associate Professor, Department of Foreign Languages for Mathematical Faculties,
                  Educational and Scientific Institute of Philology, KNU
                </p>
              </div>
            </div>
          </article>

          <article className={CARD_CLASS}>
            <h3 className="text-[15px] leading-5 text-viratec-subtle">Location</h3>
            <address className="text-lg leading-7 text-white not-italic">
              Taras Shevchenko National University of Kyiv
              <br />
              Kyiv, Ukraine
            </address>
            <ul className="mt-auto flex flex-wrap gap-x-6 gap-y-3 pt-4">
              {SOCIALS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    className="flex items-center gap-2.5 text-sm leading-5 text-viratec-soft transition-colors hover:text-white"
                  >
                    <span className="flex size-8 items-center justify-center rounded-[10px] border border-white/14 bg-white/6">
                      {social.icon === 'linkedin' ? (
                        <img src={linkedinIcon} alt="" />
                      ) : (
                        <span className="text-xs leading-[14px] font-medium text-white">RG</span>
                      )}
                    </span>
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section aria-labelledby="ways-title" className="flex flex-1 flex-col gap-5">
          <h2 id="ways-title" className={COLUMN_TITLE_CLASS}>
            Ways to collaborate
          </h2>
          {WAYS.map((way, index) => (
            <article
              key={way.title}
              className="flex flex-col gap-3 rounded-[24px] border border-white/12 bg-white/5 p-6 lg:min-h-[266px] lg:p-7"
            >
              <h3 className="flex items-center gap-3.5 font-medium">
                <span className="text-xl leading-7 tracking-[2px] text-viratec-cyan lg:text-2xl lg:tracking-[2.4px]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-xl text-white lg:text-[22px]">{way.title}</span>
              </h3>
              <p className="text-[15px] leading-[22px] text-viratec-muted lg:text-base lg:leading-6">
                {way.description}
              </p>
              <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <a
                  href={mailtoWithSubject(way.subject)}
                  className="text-sm text-viratec-subtle transition-colors hover:text-white"
                >
                  Subject: {way.subject}
                </a>
                <Link
                  to={way.to}
                  className="text-[15px] font-medium text-viratec-cyan hover:underline"
                >
                  {way.linkLabel}
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </PageLayout>
  );
}

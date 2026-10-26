import { Link } from 'react-router-dom';
import { CONTACT_EMAIL, SOCIAL_LINKS } from '@/shared/config/navigation';
import { useCommonMessages } from '@/shared/i18n';
import { OptionalLink } from '@/shared/ui/optional-link';
import { CardLinkLabel } from '@/shared/ui/card-link-label';
import { ResponsiveImage } from '@/shared/ui/responsive-image';
import { ButtonArrow, linkButtonClassName } from '@/shared/ui/link-button';
import { PageIntro } from '@/widgets/page-intro';
import { SiteHeader } from '@/widgets/site-header';
import { PageLayout } from '@/widgets/page-layout';
import { SiteFooter } from '@/widgets/site-footer';
import linkedinIcon from '@/shared/assets/icons/linkedin.svg';
import { useSeo } from '@/shared/lib';
import { useContactContent, type SocialKey } from '../model/content';

const CARD_CLASS =
  'flex flex-col gap-4 atlas-card rounded-[24px] border border-transparent p-6 lg:min-h-[266px] lg:rounded-[28px] lg:p-8';

const COLUMN_TITLE_CLASS =
  'font-display text-[30px] leading-[36px] font-medium tracking-[-0.025em] text-white lg:text-[40px] lg:leading-[46px]';

const SOCIALS: { key: SocialKey; href: string | null; badge: string | null }[] = [
  { key: 'group', href: SOCIAL_LINKS.linkedinGroup, badge: null },
  { key: 'chair', href: SOCIAL_LINKS.linkedinChair, badge: null },
  { key: 'orcid', href: SOCIAL_LINKS.orcid, badge: 'iD' },
  { key: 'scopus', href: SOCIAL_LINKS.scopus, badge: 'Sc' },
  { key: 'facebook', href: SOCIAL_LINKS.facebookGroup, badge: 'f' },
  { key: 'scholar', href: SOCIAL_LINKS.googleScholar, badge: 'GS' },
];

const mailtoWithSubject = (subject: string) =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;

export function ContactPage() {
  const content = useContactContent();
  const common = useCommonMessages();
  useSeo(content.documentTitle);

  return (
    <PageLayout
      footer={<SiteFooter />}
      intro={
        <PageIntro
          header={<SiteHeader />}
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
                src={content.chairPhoto}
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

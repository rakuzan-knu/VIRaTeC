import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib';
import { ROUTES } from '@/shared/config/routes';
import {
  CONTACT_EMAIL,
  SOCIAL_LINKS,
  useNavigation,
  type NavGroup,
} from '@/shared/config/navigation';
import {
  defineMessages,
  isLocale,
  useCommonMessages,
  useLocaleStore,
  useLocalized,
  type Locale,
} from '@/shared/i18n';
import { Logo } from '@/shared/ui/logo';
import { OptionalLink } from '@/shared/ui/optional-link';
import languageGlobe from '@/shared/assets/icons/language-globe.svg';
import chevronDown from '@/shared/assets/icons/chevron-down.svg';
import linkedinIcon from '@/shared/assets/icons/linkedin.svg';
import scholarIcon from '@/shared/assets/icons/google-scholar.svg';

const LANGUAGES: { value: Locale; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'uk', label: 'Українська' },
];

const FOOTER_MESSAGES = defineMessages({
  en: {
    tagline:
      'Virtual Innovative Research & Technology (VIRaTeC) Global Community at Taras Shevchenko National University of Kyiv.',
    language: 'Language',
    followUs: 'Follow us',
    contact: 'Contact',
    copyright: '© 2026 VIRaTeC KNU. All rights reserved.',
  },
  uk: {
    tagline:
      'Глобальна спільнота Virtual Innovative Research & Technology (VIRaTeC) при Київському національному університеті імені Тараса Шевченка.',
    language: 'Мова',
    followUs: 'Ми в соцмережах',
    contact: 'Контакти',
    copyright: '© 2026 VIRaTeC КНУ. Усі права захищено.',
  },
});

const CONTACT_SECTION_ID = 'contact';

const LABEL_CLASS = 'text-[13px] font-medium leading-[18px] text-white';
const LINK_CLASS =
  'rounded text-sm leading-5 text-viratec-muted transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime';
const ICON_LINK_CLASS =
  'flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/4 transition-colors hover:border-white/22 hover:bg-white/10';

function ContactLinks() {
  const common = useCommonMessages();

  return (
    <>
      <li>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-sm leading-5 text-viratec-cyan underline-offset-4 hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
      </li>
      <li className="w-[200px] text-sm leading-5 text-viratec-soft">
        {common.university}, {common.kyivUkraine}
      </li>
    </>
  );
}

function GroupLinks({ group }: { group: NavGroup }) {
  return group.items.map((item) => (
    <li key={item.to}>
      <Link to={item.to} className={LINK_CLASS}>
        {item.label}
      </Link>
    </li>
  ));
}

interface AccordionSectionProps {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  isLast?: boolean;
}

function AccordionSection({
  id,
  title,
  isOpen,
  onToggle,
  children,
  isLast,
}: AccordionSectionProps) {
  const panelId = `footer-${id}`;

  return (
    <div className={cn('border-t border-white/8', isLast && 'border-b')}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between py-5 text-base leading-[22px] font-medium text-white"
      >
        {title}
        <img
          src={chevronDown}
          alt=""
          className={cn('transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>
      {isOpen && (
        <ul id={panelId} className="flex flex-col gap-3 pb-[18px]">
          {children}
        </ul>
      )}
    </div>
  );
}

function LanguageSelect({ label }: { label: string }) {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  return (
    <div className="flex flex-col gap-2.5">
      <label htmlFor="footer-language" className={LABEL_CLASS}>
        {label}
      </label>
      <div className="relative w-full min-[800px]:w-60">
        <img
          src={languageGlobe}
          alt=""
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2"
        />
        <select
          id="footer-language"
          value={locale}
          onChange={(event) => {
            if (isLocale(event.target.value)) setLocale(event.target.value);
          }}
          className="w-full cursor-pointer appearance-none rounded-full border border-white/10 bg-white/4 py-[11px] pr-10 pl-10 text-sm leading-5 text-white transition-colors outline-none hover:border-white/22 focus-visible:border-viratec-lime"
        >
          {LANGUAGES.map((option) => (
            <option
              key={option.value}
              value={option.value}
              lang={option.value}
              className="bg-viratec-bg"
            >
              {option.label}
            </option>
          ))}
        </select>
        <img
          src={chevronDown}
          alt=""
          className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2"
        />
      </div>
    </div>
  );
}

export function SiteFooter() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const t = useLocalized(FOOTER_MESSAGES);
  const common = useCommonMessages();
  const navigation = useNavigation();

  const linkGroups = [navigation.about, navigation.research, navigation.explore];
  const legalLinks = [
    { label: common.termsOfService, to: ROUTES.TERMS },
    { label: common.privacyPolicy, to: ROUTES.PRIVACY },
    { label: common.cookiePolicy, to: ROUTES.COOKIES },
    { label: common.communityGuidelines, to: ROUTES.GUIDELINES },
  ];

  const toggleSection = (id: string) => setOpenSection((current) => (current === id ? null : id));

  return (
    <footer className="border-t border-white/8 bg-viratec-night font-viratec">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-5 pt-14 pb-8 min-[800px]:gap-16 min-[800px]:px-[85px] min-[800px]:pt-24 min-[800px]:pb-10">
        <div className="flex flex-col gap-8 min-[800px]:gap-14 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-5 min-[800px]:gap-6">
            <Link to={ROUTES.HOME} aria-label={common.homeAriaLabel} className="w-fit">
              <Logo className="w-[180px]" />
            </Link>
            <p className="max-w-80 text-sm leading-[22px] text-viratec-subtle">{t.tagline}</p>

            <LanguageSelect label={t.language} />

            <div className="flex flex-col gap-2.5">
              <p className={LABEL_CLASS}>{t.followUs}</p>
              <div className="flex gap-2.5">
                <OptionalLink
                  href={SOCIAL_LINKS.linkedinGroup}
                  label="LinkedIn"
                  className={ICON_LINK_CLASS}
                  unavailableClassName="hover:bg-white/6"
                >
                  <img src={linkedinIcon} alt="" />
                </OptionalLink>
                <OptionalLink
                  href={SOCIAL_LINKS.orcid}
                  label="ORCID"
                  className={cn(ICON_LINK_CLASS, 'text-[13px] leading-4 font-medium text-white')}
                  unavailableClassName="hover:bg-white/6"
                >
                  iD
                </OptionalLink>
                <OptionalLink
                  href={SOCIAL_LINKS.researchGate}
                  label="ResearchGate"
                  className={cn(ICON_LINK_CLASS, 'text-[13px] leading-4 font-medium text-white')}
                  unavailableClassName="hover:bg-white/6"
                >
                  RG
                </OptionalLink>
                <OptionalLink
                  href={SOCIAL_LINKS.googleScholar}
                  label="Google Scholar"
                  className={ICON_LINK_CLASS}
                  unavailableClassName="hover:bg-white/6"
                >
                  <img src={scholarIcon} alt="" />
                </OptionalLink>
              </div>
              <p className="text-xs text-viratec-subtle">{common.unavailable('ResearchGate')}</p>
            </div>
          </div>

          <div className="hidden grid-cols-2 gap-x-16 gap-y-10 min-[800px]:grid min-[1400px]:flex min-[1400px]:gap-16">
            {linkGroups.map((group) => (
              <div key={group.id} className="flex flex-col gap-4 whitespace-nowrap">
                <p className={LABEL_CLASS}>{group.label}</p>
                <ul className="flex flex-col gap-3">
                  <GroupLinks group={group} />
                </ul>
              </div>
            ))}
            <div className="flex flex-col gap-4">
              <p className={LABEL_CLASS}>{t.contact}</p>
              <ul className="flex flex-col gap-3">
                <ContactLinks />
              </ul>
            </div>
          </div>

          <div className="min-[800px]:hidden">
            {linkGroups.map((group) => (
              <AccordionSection
                key={group.id}
                id={group.id}
                title={group.label}
                isOpen={openSection === group.id}
                onToggle={() => toggleSection(group.id)}
              >
                <GroupLinks group={group} />
              </AccordionSection>
            ))}
            <AccordionSection
              id={CONTACT_SECTION_ID}
              title={t.contact}
              isOpen={openSection === CONTACT_SECTION_ID}
              onToggle={() => toggleSection(CONTACT_SECTION_ID)}
              isLast
            >
              <ContactLinks />
            </AccordionSection>
          </div>
        </div>

        <div className="h-px w-full bg-white/8" />

        <div className="flex flex-col gap-2.5 text-[13px] leading-[18px] text-viratec-subtle min-[800px]:flex-row min-[800px]:justify-between">
          <p>{t.copyright}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

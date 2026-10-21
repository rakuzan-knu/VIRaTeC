import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib';
import { ROUTES } from '@/shared/config/routes';
import {
  ABOUT_NAV,
  CONTACT_EMAIL,
  EXPLORE_NAV,
  RESEARCH_NAV,
  NOT_AVAILABLE_YET,
  SOCIAL_LINKS,
  type NavGroup,
} from '@/shared/config/navigation';
import { Logo } from '@/shared/ui/logo';
import { OptionalLink } from '@/shared/ui/optional-link';
import languageGlobe from '@/shared/assets/icons/language-globe.svg';
import chevronDown from '@/shared/assets/icons/chevron-down.svg';
import linkedinIcon from '@/shared/assets/icons/linkedin.svg';
import scholarIcon from '@/shared/assets/icons/google-scholar.svg';

const LINK_GROUPS: NavGroup[] = [ABOUT_NAV, RESEARCH_NAV, EXPLORE_NAV];

const LEGAL_LINKS = [
  { label: 'Terms of Service', to: ROUTES.TERMS },
  { label: 'Privacy Policy', to: ROUTES.PRIVACY },
  { label: 'Cookie Settings', to: ROUTES.COOKIES },
] as const;

const LANGUAGES = [
  { value: 'en', label: 'English', isAvailable: true },
  { value: 'uk', label: 'Українська', isAvailable: false },
] as const;

const LABEL_CLASS = 'text-[13px] font-medium leading-[18px] text-white';
const LINK_CLASS =
  'rounded text-sm leading-5 text-viratec-muted transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime';
const ICON_LINK_CLASS =
  'flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/4 transition-colors hover:border-white/22 hover:bg-white/10';

function ContactLinks() {
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
        Taras Shevchenko National University of Kyiv, Kyiv, Ukraine
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
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  isLast?: boolean;
}

function AccordionSection({ title, isOpen, onToggle, children, isLast }: AccordionSectionProps) {
  const panelId = `footer-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`;

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

export function SiteFooter() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (title: string) =>
    setOpenSection((current) => (current === title ? null : title));

  return (
    <footer className="border-t border-white/8 bg-viratec-night font-viratec">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-5 pt-14 pb-8 min-[800px]:gap-16 min-[800px]:px-[85px] min-[800px]:pt-24 min-[800px]:pb-10">
        <div className="flex flex-col gap-8 min-[800px]:gap-14 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-5 min-[800px]:gap-6">
            <Link to={ROUTES.HOME} aria-label="VIRaTeC home" className="w-fit">
              <Logo className="w-[180px]" />
            </Link>
            <p className="max-w-80 text-sm leading-[22px] text-viratec-subtle">
              Virtual Innovative Research &amp; Technology (VIRaTeC) Global Community at Taras
              Shevchenko National University of Kyiv.
            </p>

            <div className="flex flex-col gap-2.5">
              <label htmlFor="footer-language" className={LABEL_CLASS}>
                Language
              </label>
              <div className="relative w-full min-[800px]:w-60">
                <img
                  src={languageGlobe}
                  alt=""
                  className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2"
                />
                <select
                  id="footer-language"
                  defaultValue="en"
                  className="w-full cursor-pointer appearance-none rounded-full border border-white/10 bg-white/4 py-[11px] pr-10 pl-10 text-sm leading-5 text-white transition-colors outline-none hover:border-white/22 focus-visible:border-viratec-lime"
                >
                  {LANGUAGES.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={!option.isAvailable}
                      className="bg-viratec-bg"
                    >
                      {option.isAvailable ? option.label : `${option.label} — ${NOT_AVAILABLE_YET}`}
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

            <div className="flex flex-col gap-2.5">
              <p className={LABEL_CLASS}>Follow us</p>
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
              <p className="text-xs text-viratec-subtle">ResearchGate: {NOT_AVAILABLE_YET}</p>
            </div>
          </div>

          <div className="hidden grid-cols-2 gap-x-16 gap-y-10 min-[800px]:grid min-[1400px]:flex min-[1400px]:gap-16">
            {LINK_GROUPS.map((group) => (
              <div key={group.label} className="flex flex-col gap-4 whitespace-nowrap">
                <p className={LABEL_CLASS}>{group.label}</p>
                <ul className="flex flex-col gap-3">
                  <GroupLinks group={group} />
                </ul>
              </div>
            ))}
            <div className="flex flex-col gap-4">
              <p className={LABEL_CLASS}>Contact</p>
              <ul className="flex flex-col gap-3">
                <ContactLinks />
              </ul>
            </div>
          </div>

          <div className="min-[800px]:hidden">
            {LINK_GROUPS.map((group) => (
              <AccordionSection
                key={group.label}
                title={group.label}
                isOpen={openSection === group.label}
                onToggle={() => toggleSection(group.label)}
              >
                <GroupLinks group={group} />
              </AccordionSection>
            ))}
            <AccordionSection
              title="Contact"
              isOpen={openSection === 'Contact'}
              onToggle={() => toggleSection('Contact')}
              isLast
            >
              <ContactLinks />
            </AccordionSection>
          </div>
        </div>

        <div className="h-px w-full bg-white/8" />

        <div className="flex flex-col gap-2.5 text-[13px] leading-[18px] text-viratec-subtle min-[800px]:flex-row min-[800px]:justify-between">
          <p>© 2026 VIRaTeC KNU. All rights reserved.</p>
          <ul className="flex gap-6">
            {LEGAL_LINKS.map((link) => (
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

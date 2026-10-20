import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn, useDismiss } from '@/shared/lib';
import { ROUTES } from '@/shared/config/routes';
import { MAIN_NAV } from '@/shared/config/navigation';
import { Logo } from '@/shared/ui/logo';
import burgerIcon from '@/shared/assets/icons/burger.svg';
import { DesktopNavDropdown } from './DesktopNavDropdown';
import { MobileMenu } from './MobileMenu';

interface SiteHeaderProps {
  className?: string;
}

export function SiteHeader({ className }: SiteHeaderProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const closeDropdown = useCallback(() => setOpenDropdown(null), []);
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  useDismiss(navRef, openDropdown !== null, closeDropdown);

  return (
    <header
      className={cn(
        'flex items-center justify-between px-5 py-3.5 font-viratec xl:h-[140px] xl:pt-[29px] xl:pr-[60px] xl:pb-0 xl:pl-[50px]',
        className,
      )}
    >
      <Link to={ROUTES.HOME} aria-label="VIRaTeC home" className="shrink-0">
        <Logo className="w-[141px] xl:w-[252px]" />
      </Link>

      <nav ref={navRef} aria-label="Main" className="hidden xl:block">
        <ul className="flex items-center gap-7">
          {MAIN_NAV.map((entry) =>
            entry.type === 'link' ? (
              <li key={entry.link.to}>
                <Link
                  to={entry.link.to}
                  className="text-base text-viratec-light transition-opacity hover:opacity-80"
                >
                  {entry.link.label}
                </Link>
              </li>
            ) : (
              <li key={entry.group.label}>
                <DesktopNavDropdown
                  group={entry.group}
                  isOpen={openDropdown === entry.group.label}
                  onOpen={() => setOpenDropdown(entry.group.label)}
                  onClose={closeDropdown}
                  onToggle={() =>
                    setOpenDropdown((current) =>
                      current === entry.group.label ? null : entry.group.label,
                    )
                  }
                />
              </li>
            ),
          )}
        </ul>
      </nav>

      <div className="hidden items-center gap-[22px] xl:flex">
        <Link
          to={ROUTES.LOGIN}
          className="text-base text-viratec-light transition-opacity hover:opacity-80"
        >
          Log in
        </Link>
        <Link
          to={ROUTES.CONTACT}
          className="rounded-[14px] bg-viratec-lime px-5 py-3 text-base font-medium text-viratec-ink transition-colors hover:bg-viratec-lime-hover"
        >
          Contact / Collaborate
        </Link>
      </div>

      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-menu"
        onClick={() => setIsMobileMenuOpen(true)}
        className="cursor-pointer xl:hidden"
      >
        <img src={burgerIcon} alt="" />
      </button>

      {isMobileMenuOpen && <MobileMenu onClose={closeMobileMenu} />}
    </header>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { cn, useDismiss } from '@/shared/lib';
import { ROUTES } from '@/shared/config/routes';
import { MAIN_NAV } from '@/shared/config/navigation';
import { Logo } from '@/shared/ui/logo';
import { linkButtonClassName } from '@/shared/ui/link-button';
import burgerIcon from '@/shared/assets/icons/burger.svg';
import { DesktopNavDropdown } from './DesktopNavDropdown';
import { MobileMenu } from './MobileMenu';

interface SiteHeaderProps {
  className?: string;
}

const SCROLL_THRESHOLD = 12;
const NAV_LINK_CLASS =
  'rounded-full px-3.5 py-2 text-[15px] transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime';

function useIsScrolled() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const update = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return isScrolled;
}

export function SiteHeader({ className }: SiteHeaderProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const isScrolled = useIsScrolled();

  const closeDropdown = useCallback(() => setOpenDropdown(null), []);
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  useDismiss(navRef, openDropdown !== null, closeDropdown);

  return (
    <>
      <div aria-hidden="true" className="h-16 xl:h-[88px]" />
      <header className={cn('fixed inset-x-0 top-0 z-40 font-viratec', className)}>
        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-0 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ease-apple',
            isScrolled
              ? 'border-white/8 bg-viratec-bg/72 backdrop-blur-xl backdrop-saturate-150'
              : 'border-transparent bg-transparent',
          )}
        />
        <div
          className={cn(
            'relative mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 transition-[height] duration-300 ease-apple xl:px-[60px]',
            isScrolled ? 'xl:h-[68px]' : 'xl:h-[88px]',
          )}
        >
          <Link
            to={ROUTES.HOME}
            aria-label="VIRaTeC home"
            className="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-viratec-lime"
          >
            <Logo
              className={cn(
                'w-[132px] transition-[width] duration-300 ease-apple',
                isScrolled ? 'xl:w-[164px]' : 'xl:w-[196px]',
              )}
            />
          </Link>

          <nav ref={navRef} aria-label="Main" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {MAIN_NAV.map((entry) =>
                entry.type === 'link' ? (
                  <li key={entry.link.to}>
                    <NavLink
                      to={entry.link.to}
                      className={({ isActive }) =>
                        cn(NAV_LINK_CLASS, isActive ? 'text-white' : 'text-viratec-light/72')
                      }
                    >
                      {entry.link.label}
                    </NavLink>
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

          <div className="hidden items-center gap-2 xl:flex">
            <Link to={ROUTES.LOGIN} className={cn(NAV_LINK_CLASS, 'text-viratec-light/72')}>
              Log in
            </Link>
            <Link
              to={ROUTES.CONTACT}
              className={linkButtonClassName({
                size: 'md',
                className: 'px-[18px] py-2.5 text-[15px]',
              })}
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
            className="-mr-2 flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-viratec-lime xl:hidden"
          >
            <img src={burgerIcon} alt="" />
          </button>
        </div>
      </header>

      {isMobileMenuOpen && <MobileMenu onClose={closeMobileMenu} />}
    </>
  );
}

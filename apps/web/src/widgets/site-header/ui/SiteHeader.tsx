import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useIsAuthenticated } from '@/entities/session';
import { cn, useDismiss } from '@/shared/lib';
import { ROUTES } from '@/shared/config/routes';
import { useNavigation } from '@/shared/config/navigation';
import { useCommonMessages, useLocalized, defineMessages } from '@/shared/i18n';
import { Logo } from '@/shared/ui/logo';
import { linkButtonClassName } from '@/shared/ui/link-button';
import { Tooltip } from '@/shared/ui/Tooltip';
import burgerIcon from '@/shared/assets/icons/burger.svg';
import { DesktopNavDropdown } from './DesktopNavDropdown';
import { MobileMenu } from './MobileMenu';
import { AccountMenu } from './AccountMenu';

interface SiteHeaderProps {
  className?: string;
}

const HEADER_MESSAGES = defineMessages({
  en: { mainNav: 'Main', openMenu: 'Open menu' },
  uk: { mainNav: 'Головна навігація', openMenu: 'Відкрити меню' },
});

const SCROLL_THRESHOLD = 12;
const HIDE_OFFSET = 160;
const HIDE_DELTA = 6;
const NAV_LINK_CLASS =
  'rounded-full px-3.5 py-2 text-[15px] transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime';

function useHeaderScroll() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;

    const update = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      setIsScrolled(y > SCROLL_THRESHOLD);
      if (y < HIDE_OFFSET || delta < -HIDE_DELTA) setIsHidden(false);
      else if (delta > HIDE_DELTA) setIsHidden(true);
      if (Math.abs(delta) > HIDE_DELTA) lastY = y;
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return { isScrolled, isHidden };
}

export function SiteHeader({ className }: SiteHeaderProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const { isScrolled, isHidden } = useHeaderScroll();
  const { main: mainNav } = useNavigation();
  const common = useCommonMessages();
  const t = useLocalized(HEADER_MESSAGES);
  const isAuthenticated = useIsAuthenticated();

  const closeDropdown = useCallback(() => setOpenDropdown(null), []);
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  useDismiss(navRef, openDropdown !== null, closeDropdown);

  return (
    <>
      <div aria-hidden="true" className="h-16 xl:h-[88px]" />
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 font-viratec transition-transform duration-500 ease-apple [view-transition-name:site-header] focus-within:translate-y-0 motion-reduce:transition-none',
          isHidden && openDropdown === null && !isMobileMenuOpen && '-translate-y-full',
          className,
        )}
      >
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
            aria-label={common.homeAriaLabel}
            className="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-viratec-lime"
          >
            <Logo
              className={cn(
                'w-[132px] transition-[width] duration-300 ease-apple',
                isScrolled ? 'xl:w-[164px]' : 'xl:w-[196px]',
              )}
            />
          </Link>

          <nav ref={navRef} aria-label={t.mainNav} className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((entry) =>
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
                  <li key={entry.group.id}>
                    <DesktopNavDropdown
                      group={entry.group}
                      isOpen={openDropdown === entry.group.id}
                      onOpen={() => setOpenDropdown(entry.group.id)}
                      onClose={closeDropdown}
                      onToggle={() =>
                        setOpenDropdown((current) =>
                          current === entry.group.id ? null : entry.group.id,
                        )
                      }
                    />
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="hidden items-center gap-2 xl:flex">
            {isAuthenticated ? (
              <AccountMenu />
            ) : (
              <Link to={ROUTES.LOGIN} className={cn(NAV_LINK_CLASS, 'text-viratec-light/72')}>
                {common.logIn}
              </Link>
            )}
            <Link
              to={ROUTES.CONTACT}
              className={linkButtonClassName({
                size: 'md',
                className: 'px-[18px] py-2.5 text-[15px]',
              })}
            >
              {common.contactCollaborate}
            </Link>
          </div>

          <Tooltip text={t.openMenu} placement="bottom" className="-mr-2 xl:hidden">
            <button
              type="button"
              aria-label={t.openMenu}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-viratec-lime"
            >
              <img src={burgerIcon} alt="" />
            </button>
          </Tooltip>
        </div>
      </header>

      {isMobileMenuOpen && <MobileMenu onClose={closeMobileMenu} />}
    </>
  );
}

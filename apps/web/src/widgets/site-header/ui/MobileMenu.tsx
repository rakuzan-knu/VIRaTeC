import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, ChevronDown } from 'lucide-react';
import { UserAvatar, useIsAuthenticated } from '@/entities/session';
import { cn, useBodyScrollLock, useFocusTrap } from '@/shared/lib';
import { ROUTES } from '@/shared/config/routes';
import { useNavigation } from '@/shared/config/navigation';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { Logo } from '@/shared/ui/logo';
import { LinkButton, linkButtonClassName } from '@/shared/ui/link-button';
import closeIcon from '@/shared/assets/icons/close.svg';
import menuChevron from '@/shared/assets/icons/menu-chevron.svg';
import { useAccountMenu } from '../model/accountMenu';
import { AccountSwitchList } from './AccountSwitchList';

interface MobileMenuProps {
  onClose: () => void;
}

const MOBILE_MENU_MESSAGES = defineMessages({
  en: { mainMenu: 'Main menu', mainNav: 'Main', closeMenu: 'Close menu' },
  uk: { mainMenu: 'Головне меню', mainNav: 'Головна навігація', closeMenu: 'Закрити меню' },
});

const ROW_CLASS =
  'flex w-full items-center justify-between border-b border-white/8 py-5 text-left font-display text-[26px] leading-8 font-medium tracking-[-0.02em] text-white';

export function MobileMenu({ onClose }: MobileMenuProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const { main: mainNav } = useNavigation();
  const common = useCommonMessages();
  const t = useLocalized(MOBILE_MENU_MESSAGES);
  const isAuthenticated = useIsAuthenticated();

  useBodyScrollLock(true);
  useFocusTrap(dialogRef, true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={dialogRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label={t.mainMenu}
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-viratec-bg font-viratec xl:hidden"
    >
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        <Link to={ROUTES.HOME} onClick={onClose} aria-label={common.homeAriaLabel}>
          <Logo className="w-[132px]" />
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.closeMenu}
          className="-mr-2 flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/8"
        >
          <img src={closeIcon} alt="" />
        </button>
      </div>

      <nav aria-label={t.mainNav} className="px-5 pt-3">
        <ul>
          {mainNav.map((entry, index) => {
            const isLast = index === mainNav.length - 1;

            if (entry.type === 'link') {
              return (
                <li key={entry.link.to}>
                  <Link
                    to={entry.link.to}
                    onClick={onClose}
                    className={cn(ROW_CLASS, isLast && 'border-b-0')}
                  >
                    {entry.link.label}
                  </Link>
                </li>
              );
            }

            const { group } = entry;
            const isOpen = openGroup === group.id;
            const panelId = `mobile-submenu-${index}`;

            return (
              <li key={group.id}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenGroup(isOpen ? null : group.id)}
                  className={cn(ROW_CLASS, 'cursor-pointer')}
                >
                  {group.label}
                  <img
                    src={menuChevron}
                    alt=""
                    className={cn('transition-transform duration-200', isOpen && 'rotate-180')}
                  />
                </button>
                {isOpen && (
                  <ul id={panelId} className="flex flex-col gap-4 py-4 pl-4">
                    {group.items.map((item) => (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          onClick={onClose}
                          className="text-[17px] leading-6 text-viratec-muted transition-colors hover:text-white"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto flex flex-col gap-3 px-5 pt-8 pb-8">
        <LinkButton to={ROUTES.CONTACT} onClick={onClose} className="w-full">
          {common.contactCollaborate}
        </LinkButton>
        {isAuthenticated ? (
          <MobileAccountPanel onClose={onClose} />
        ) : (
          <Link
            to={ROUTES.LOGIN}
            onClick={onClose}
            className={linkButtonClassName({ variant: 'secondary', className: 'w-full' })}
          >
            {common.logIn}
          </Link>
        )}
      </div>
    </div>
  );
}

function MobileAccountPanel({ onClose }: MobileMenuProps) {
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const menu = useAccountMenu();
  const { t, user, links, signOut, isSigningOut, signOutIcon: SignOutIcon } = menu;
  const switcherId = 'mobile-account-switcher';

  return (
    <div className="flex flex-col gap-1 rounded-[24px] border border-white/10 bg-white/4 p-2">
      {user && (
        <div className="flex items-center gap-3 px-3 pt-2 pb-3">
          <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className="size-11" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-base font-medium text-white">{user.name}</span>
            <span className="truncate text-sm text-viratec-subtle">{user.email}</span>
          </div>
        </div>
      )}
      <ul aria-label={t.accountMenu} className="grid grid-cols-2 gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-[16px] px-3 py-3 text-[15px] font-medium text-white transition-colors hover:bg-white/7"
            >
              <Icon aria-hidden="true" className="size-[18px] shrink-0 text-viratec-muted" />
              <span className="truncate">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <button
        type="button"
        aria-expanded={isSwitcherOpen}
        aria-controls={switcherId}
        onClick={() => setIsSwitcherOpen((value) => !value)}
        className="flex cursor-pointer items-center gap-2.5 rounded-[16px] px-3 py-3 text-[15px] font-medium text-white transition-colors hover:bg-white/7"
      >
        <ArrowLeftRight aria-hidden="true" className="size-[18px] shrink-0 text-viratec-muted" />
        <span className="flex-1 text-left">{t.switchAccount}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'size-4 text-viratec-muted transition-transform duration-200',
            isSwitcherOpen && 'rotate-180',
          )}
        />
      </button>
      {isSwitcherOpen && <AccountSwitchList id={switcherId} menu={menu} onNavigate={onClose} />}
      <button
        type="button"
        onClick={() => {
          onClose();
          signOut();
        }}
        disabled={isSigningOut}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-[16px] border border-white/14 px-3 py-3 text-[15px] font-medium text-white transition-colors hover:bg-white/7 disabled:opacity-50"
      >
        <SignOutIcon aria-hidden="true" className="size-[18px]" />
        {t.signOut}
      </button>
    </div>
  );
}

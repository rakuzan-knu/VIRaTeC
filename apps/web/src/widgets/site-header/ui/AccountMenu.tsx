import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, ChevronDown } from 'lucide-react';
import { UserAvatar } from '@/entities/session';
import { cn, useDismiss } from '@/shared/lib';
import navChevron from '@/shared/assets/icons/nav-chevron.svg';
import { useAccountMenu } from '../model/accountMenu';
import { AccountSwitchList } from './AccountSwitchList';

const ITEM_CLASS =
  'flex w-full items-center gap-3 rounded-[14px] px-3.5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-white/7 focus-visible:bg-white/7 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-viratec-lime';

export function AccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menu = useAccountMenu();
  const { t, user, links, signOut, isSigningOut, signOutIcon: SignOutIcon } = menu;
  const menuId = 'account-menu';
  const switcherId = 'account-menu-switcher';
  const name = user?.name ?? t.myAccount;

  const close = useCallback(() => {
    setIsOpen(false);
    setIsSwitcherOpen(false);
  }, []);

  useDismiss(rootRef, isOpen, close);

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isOpen) triggerRef.current?.focus();
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={t.openAccountMenu(name)}
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        className="flex cursor-pointer items-center gap-2 rounded-full py-1 pr-2.5 pl-1 text-[15px] text-white transition-colors hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
      >
        <UserAvatar name={name} avatarUrl={user?.avatarUrl} className="size-8 text-xs" />
        <span className="max-w-[140px] truncate">{user?.name.split(' ')[0] ?? t.myAccount}</span>
        <img
          src={navChevron}
          alt=""
          className={cn('transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>

      <div
        id={menuId}
        className={cn(
          'absolute top-full right-0 z-30 w-[320px] pt-3 transition-[opacity,translate] duration-200 ease-apple',
          isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
        )}
      >
        <div className="flex max-h-[calc(100svh-96px)] flex-col overflow-y-auto rounded-[24px] border border-white/10 bg-viratec-dropdown p-2 shadow-overlay">
          {user && (
            <div className="flex items-center gap-3 border-b border-white/8 px-3.5 pt-2 pb-3.5">
              <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className="size-10" />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[15px] font-medium text-white">{user.name}</span>
                <span className="truncate text-sm text-viratec-subtle">{user.email}</span>
              </div>
            </div>
          )}
          <ul aria-label={t.accountMenu} className="flex flex-col gap-0.5 pt-1.5">
            {links.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link to={to} onClick={close} className={ITEM_CLASS}>
                  <Icon aria-hidden="true" className="size-[18px] text-viratec-muted" />
                  {label}
                </Link>
              </li>
            ))}
            <li className="mt-1 border-t border-white/8 pt-1.5">
              <button
                type="button"
                aria-expanded={isSwitcherOpen}
                aria-controls={switcherId}
                onClick={() => setIsSwitcherOpen((value) => !value)}
                className={cn(ITEM_CLASS, 'cursor-pointer')}
              >
                <ArrowLeftRight aria-hidden="true" className="size-[18px] text-viratec-muted" />
                <span className="flex-1 text-left">{t.switchAccount}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    'size-4 text-viratec-muted transition-transform duration-200',
                    isSwitcherOpen && 'rotate-180',
                  )}
                />
              </button>
              {isSwitcherOpen && (
                <AccountSwitchList id={switcherId} menu={menu} onNavigate={close} />
              )}
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  close();
                  signOut();
                }}
                disabled={isSigningOut}
                className={cn(ITEM_CLASS, 'cursor-pointer disabled:opacity-50')}
              >
                <SignOutIcon aria-hidden="true" className="size-[18px] text-viratec-muted" />
                {t.signOut}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

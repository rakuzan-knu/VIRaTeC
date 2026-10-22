import { useMemo } from 'react';
import { Bookmark, Eye, LayoutDashboard, LogOut, UserRound } from 'lucide-react';
import { StaffRole } from '@viratec/contracts';
import { useKnownAccounts, useSessionStore } from '@/entities/session';
import { useLogout } from '@/features/logout';
import { ROUTES, buildAccountPath, buildPersonPath } from '@/shared/config/routes';
import { defineMessages, useLocalized } from '@/shared/i18n';

const ACCOUNT_MENU_MESSAGES = defineMessages({
  en: {
    accountMenu: 'Account menu',
    openAccountMenu: (name: string) => `Account menu for ${name}`,
    myAccount: 'My account',
    profile: 'Edit profile',
    publicProfile: 'My public profile',
    saved: 'Saved',
    adminPanel: 'Admin panel',
    switchAccount: 'Switch account',
    accountsOnDevice: 'Accounts on this device',
    current: 'Current',
    switchTo: (name: string) => `Switch to ${name}`,
    addAccount: 'Add another account',
    manageAccounts: 'Manage accounts',
    signOut: 'Sign out',
  },
  uk: {
    accountMenu: 'Меню облікового запису',
    openAccountMenu: (name: string) => `Меню облікового запису ${name}`,
    myAccount: 'Мій обліковий запис',
    profile: 'Редагувати профіль',
    publicProfile: 'Мій публічний профіль',
    saved: 'Збережене',
    adminPanel: 'Адмін-панель',
    switchAccount: 'Змінити обліковий запис',
    accountsOnDevice: 'Облікові записи на цьому пристрої',
    current: 'Поточний',
    switchTo: (name: string) => `Перейти до ${name}`,
    addAccount: 'Додати інший обліковий запис',
    manageAccounts: 'Керувати обліковими записами',
    signOut: 'Вийти',
  },
});

export interface AccountMenuLink {
  to: string;
  label: string;
  icon: typeof UserRound;
}

export function useAccountMenu() {
  const t = useLocalized(ACCOUNT_MENU_MESSAGES);
  const user = useSessionStore((state) => state.user);
  const knownAccounts = useKnownAccounts();
  const userId = user?.id ?? null;
  const isStaff = Boolean(user && user.staffRole !== StaffRole.NONE);
  const { mutate: logout, isPending: isSigningOut } = useLogout();

  const links = useMemo<AccountMenuLink[]>(
    () => [
      { to: ROUTES.ACCOUNT, label: t.profile, icon: UserRound },
      ...(userId ? [{ to: buildPersonPath(userId), label: t.publicProfile, icon: Eye }] : []),
      { to: buildAccountPath('saved'), label: t.saved, icon: Bookmark },
      ...(isStaff ? [{ to: ROUTES.ADMIN, label: t.adminPanel, icon: LayoutDashboard }] : []),
    ],
    [t, userId, isStaff],
  );

  const otherAccounts = useMemo(
    () => knownAccounts.filter((account) => account.email !== user?.email),
    [knownAccounts, user?.email],
  );

  return {
    t,
    user,
    links,
    otherAccounts,
    manageAccountsTo: buildAccountPath('accounts'),
    signOut: () => logout({ to: ROUTES.HOME }),
    switchTo: (email?: string) =>
      logout({ to: ROUTES.LOGIN, state: email ? { email } : undefined }),
    isSigningOut,
    signOutIcon: LogOut,
  };
}

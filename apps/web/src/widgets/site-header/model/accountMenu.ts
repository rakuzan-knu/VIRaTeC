import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bookmark, Eye, LayoutDashboard, LogOut, PencilRuler, UserRound } from 'lucide-react';
import { AdminPermission, StaffRole } from '@viratec/contracts';
import { useKnownAccounts, useSessionStore } from '@/entities/session';
import { useLogout } from '@/features/logout';
import {
  ROUTES,
  SITE_EDITOR_PATH,
  buildAccountPath,
  buildPersonPath,
} from '@/shared/config/routes';
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
    siteEditor: 'Edit site',
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
    siteEditor: 'Редагувати сайт',
    switchAccount: 'Змінити обліковий запис',
    accountsOnDevice: 'Облікові записи на цьому пристрої',
    current: 'Поточний',
    switchTo: (name: string) => `Перейти до ${name}`,
    addAccount: 'Додати інший обліковий запис',
    manageAccounts: 'Керувати обліковими записами',
    signOut: 'Вийти',
  },
  de: {
    accountMenu: 'Kontomenü',
    openAccountMenu: (name: string) => `Kontomenü für ${name}`,
    myAccount: 'Mein Konto',
    profile: 'Profil bearbeiten',
    publicProfile: 'Mein öffentliches Profil',
    saved: 'Gespeichert',
    adminPanel: 'Adminbereich',
    siteEditor: 'Website bearbeiten',
    switchAccount: 'Konto wechseln',
    accountsOnDevice: 'Konten auf diesem Gerät',
    current: 'Aktuell',
    switchTo: (name: string) => `Zu ${name} wechseln`,
    addAccount: 'Weiteres Konto hinzufügen',
    manageAccounts: 'Konten verwalten',
    signOut: 'Abmelden',
  },
  fr: {
    accountMenu: 'Menu du compte',
    openAccountMenu: (name: string) => `Menu du compte de ${name}`,
    myAccount: 'Mon compte',
    profile: 'Modifier le profil',
    publicProfile: 'Mon profil public',
    saved: 'Enregistrés',
    adminPanel: 'Administration',
    siteEditor: 'Modifier le site',
    switchAccount: 'Changer de compte',
    accountsOnDevice: 'Comptes sur cet appareil',
    current: 'Actuel',
    switchTo: (name: string) => `Passer à ${name}`,
    addAccount: 'Ajouter un autre compte',
    manageAccounts: 'Gérer les comptes',
    signOut: 'Se déconnecter',
  },
  ar: {
    accountMenu: 'قائمة الحساب',
    openAccountMenu: (name: string) => `قائمة حساب ${name}`,
    myAccount: 'حسابي',
    profile: 'تعديل الملف الشخصي',
    publicProfile: 'ملفي الشخصي العام',
    saved: 'المحفوظات',
    adminPanel: 'لوحة الإدارة',
    siteEditor: 'تعديل الموقع',
    switchAccount: 'تبديل الحساب',
    accountsOnDevice: 'الحسابات على هذا الجهاز',
    current: 'الحالي',
    switchTo: (name: string) => `التبديل إلى ${name}`,
    addAccount: 'إضافة حساب آخر',
    manageAccounts: 'إدارة الحسابات',
    signOut: 'تسجيل الخروج',
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
  const canEditSite = Boolean(user?.permissions.includes(AdminPermission.CONTENT_VIEW));
  const { mutate: logout, isPending: isSigningOut } = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  const links = useMemo<AccountMenuLink[]>(
    () => [
      { to: ROUTES.ACCOUNT, label: t.profile, icon: UserRound },
      ...(userId ? [{ to: buildPersonPath(userId), label: t.publicProfile, icon: Eye }] : []),
      { to: buildAccountPath('saved'), label: t.saved, icon: Bookmark },
      ...(isStaff ? [{ to: ROUTES.ADMIN, label: t.adminPanel, icon: LayoutDashboard }] : []),
      ...(canEditSite ? [{ to: SITE_EDITOR_PATH, label: t.siteEditor, icon: PencilRuler }] : []),
    ],
    [t, userId, isStaff, canEditSite],
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
      navigate(ROUTES.LOGIN, { state: { email, addAccount: true, from: location.pathname } }),
    isSigningOut,
    signOutIcon: LogOut,
  };
}

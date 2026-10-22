import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Bookmark,
  Eye,
  KeyRound,
  Lock,
  LogOut,
  ShieldCheck,
  SlidersHorizontal,
  TriangleAlert,
  UserRound,
  Users,
} from 'lucide-react';
import type { AccountDto } from '@viratec/contracts';
import { forgetAllAccounts, useAccountLabels, useSessionStore } from '@/entities/session';
import { ProfileForm } from '@/features/update-profile';
import { AvatarUploader } from '@/features/update-avatar';
import { ChangePasswordForm } from '@/features/change-password';
import { GoogleConnection } from '@/features/link-google';
import { TwoFactorSettings } from '@/features/manage-two-factor';
import { DeleteAccountForm } from '@/features/delete-account';
import { AccountSwitcher } from '@/features/switch-account';
import { useLogout, useLogoutAll } from '@/features/logout';
import { PrivacyForm } from '@/features/update-privacy';
import { ExportDataButton } from '@/features/export-data';
import { SessionsList } from '@/features/manage-sessions';
import { SavedList } from '@/features/save-item';
import { ACCOUNT_SECTION_PARAM, ROUTES, buildPersonPath } from '@/shared/config/routes';
import {
  INTL_LOCALE,
  LOCALES,
  defineMessages,
  useLocale,
  useLocaleStore,
  useLocalized,
  type Locale,
} from '@/shared/i18n';
import { cn, useSeo } from '@/shared/lib';
import { ChipGroup } from '@/shared/ui/chip';
import { GoogleIcon } from '@/shared/ui/google-icon';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { ACCOUNT_SECTIONS, isAccountSection, type AccountSection } from '../model/sections';
import { ProfileCompleteness } from './ProfileCompleteness';
import { DataControls } from './DataControls';

const ACCOUNT_MESSAGES = defineMessages({
  en: {
    seoTitle: 'Account',
    home: 'Home',
    title: 'Your account',
    memberSince: (date: string) => `Member since ${date}`,
    sectionsNav: 'Account sections',
    sections: {
      profile: 'Profile',
      saved: 'Saved',
      security: 'Security',
      privacy: 'Privacy',
      preferences: 'Preferences',
      accounts: 'Accounts',
      danger: 'Delete account',
    } satisfies Record<AccountSection, string>,
    descriptions: {
      profile: 'How you appear to researchers, mentors and partners across VIRaTeC.',
      saved: 'Publications and projects you bookmarked, synced across devices.',
      security: 'Manage your password, two-step verification and active sessions.',
      privacy: 'Control who sees your profile and get a copy of your data.',
      preferences: 'Personalise how VIRaTeC works for you on this device.',
      accounts: 'Switch between the accounts you use on this device.',
      danger: 'Permanently remove your VIRaTeC account.',
    } satisfies Record<AccountSection, string>,
    signOut: 'Sign out',
    signInMethods: 'Sign-in methods',
    methodPassword: 'Email and password',
    methodGoogle: 'Google',
    connected: 'Connected',
    notConnected: 'Not connected',
    passwordSet: 'Set',
    passwordNotSet: 'Not set — you can add one below',
    password: 'Password',
    twoFactor: 'Two-step verification',
    sessions: 'Active sessions',
    sessionsDescription:
      'Devices where you are signed in. Sign out any you don’t recognise — it takes effect immediately.',
    profileVisibility: 'Profile visibility',
    dataExport: 'Your data',
    dataDeletion: 'Delete specific data',
    viewPublicProfile: 'View public profile',
    signOutEverywhere: 'Sign out on all devices',
    sessionsError: 'Could not sign out of all devices. Please try again.',
    language: 'Interface language',
  },
  uk: {
    seoTitle: 'Обліковий запис',
    home: 'Головна',
    title: 'Ваш обліковий запис',
    memberSince: (date: string) => `У спільноті з ${date}`,
    sectionsNav: 'Розділи облікового запису',
    sections: {
      profile: 'Профіль',
      saved: 'Збережене',
      security: 'Безпека',
      privacy: 'Приватність',
      preferences: 'Налаштування',
      accounts: 'Облікові записи',
      danger: 'Видалення',
    },
    descriptions: {
      profile: 'Як вас бачать дослідники, ментори та партнери VIRaTeC.',
      saved: 'Публікації та проєкти, які ви зберегли, — синхронізуються між пристроями.',
      security: 'Керуйте паролем, двоетапною перевіркою та активними сеансами.',
      privacy: 'Керуйте тим, хто бачить ваш профіль, і отримайте копію своїх даних.',
      preferences: 'Налаштуйте VIRaTeC під себе на цьому пристрої.',
      accounts: 'Перемикайтеся між обліковими записами на цьому пристрої.',
      danger: 'Назавжди видалити обліковий запис VIRaTeC.',
    },
    signOut: 'Вийти',
    signInMethods: 'Способи входу',
    methodPassword: 'Електронна пошта та пароль',
    methodGoogle: 'Google',
    connected: 'Підключено',
    notConnected: 'Не підключено',
    passwordSet: 'Встановлено',
    passwordNotSet: 'Не встановлено — можна додати нижче',
    password: 'Пароль',
    twoFactor: 'Двоетапна перевірка',
    sessions: 'Активні сеанси',
    sessionsDescription:
      'Пристрої, на яких ви увійшли. Завершіть будь-який незнайомий сеанс — це спрацює одразу.',
    profileVisibility: 'Видимість профілю',
    dataExport: 'Ваші дані',
    dataDeletion: 'Видалити окремі дані',
    viewPublicProfile: 'Переглянути публічний профіль',
    signOutEverywhere: 'Вийти на всіх пристроях',
    sessionsError: 'Не вдалося вийти на всіх пристроях. Спробуйте ще раз.',
    language: 'Мова інтерфейсу',
  },
});

const LANGUAGE_LABELS: Record<Locale, string> = { en: 'English', uk: 'Українська' };

const SECTION_ICONS: Record<AccountSection, typeof UserRound> = {
  profile: UserRound,
  saved: Bookmark,
  security: ShieldCheck,
  privacy: Lock,
  preferences: SlidersHorizontal,
  accounts: Users,
  danger: TriangleAlert,
};

const CARD_CLASS = 'rounded-[28px] border border-white/10 bg-viratec-deep/80 p-6 lg:p-8';
const SUBHEADING_CLASS =
  'font-display text-[20px] leading-7 font-medium tracking-[-0.02em] text-white';

type AccountMessages = (typeof ACCOUNT_MESSAGES)['en'];

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={CARD_CLASS}>
      <h3 className={cn(SUBHEADING_CLASS, 'mb-5')}>{title}</h3>
      {children}
    </section>
  );
}

function SecuritySection({ account, t }: { account: AccountDto; t: AccountMessages }) {
  const { mutate: logoutAll, isPending, isError } = useLogoutAll();
  const methods = [
    {
      label: t.methodGoogle,
      icon: <GoogleIcon className="size-[18px]" />,
      isActive: account.hasGoogle,
      status: account.hasGoogle ? t.connected : t.notConnected,
      action: <GoogleConnection hasGoogle={account.hasGoogle} hasPassword={account.hasPassword} />,
    },
    {
      label: t.methodPassword,
      icon: <KeyRound aria-hidden="true" className="size-[18px] text-white" />,
      isActive: account.hasPassword,
      status: account.hasPassword ? t.passwordSet : t.passwordNotSet,
      action: null,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <section className={CARD_CLASS}>
        <h3 className={cn(SUBHEADING_CLASS, 'mb-4')}>{t.signInMethods}</h3>
        <ul className="flex flex-col divide-y divide-white/8">
          {methods.map(({ label, icon, isActive, status, action }) => (
            <li key={label} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/6">
                  {icon}
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="text-[15px] font-medium text-white">{label}</span>
                  <span
                    className={cn(
                      'text-sm',
                      isActive ? 'text-viratec-accent' : 'text-viratec-subtle',
                    )}
                  >
                    {status}
                  </span>
                </div>
              </div>
              {action && <div className="pl-[52px]">{action}</div>}
            </li>
          ))}
        </ul>
      </section>
      <SectionCard title={t.password}>
        <ChangePasswordForm hasPassword={account.hasPassword} />
      </SectionCard>
      <SectionCard title={t.twoFactor}>
        <TwoFactorSettings account={account} />
      </SectionCard>
      <SectionCard title={t.sessions}>
        <p className="mb-5 text-[15px] leading-6 text-viratec-muted">{t.sessionsDescription}</p>
        <SessionsList />
        <button
          type="button"
          onClick={() => logoutAll()}
          disabled={isPending}
          className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-control border border-border-strong bg-bg-input px-5 py-3 text-control-md font-medium text-white transition-colors hover:border-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut aria-hidden="true" className="size-[18px]" />
          {t.signOutEverywhere}
        </button>
        {isError && (
          <p role="alert" className="mt-3 text-sm text-state-error">
            {t.sessionsError}
          </p>
        )}
      </SectionCard>
    </div>
  );
}

function PreferencesSection({ t }: { t: AccountMessages }) {
  const locale = useLocale();
  const setLocale = useLocaleStore((state) => state.setLocale);
  const options = useMemo(
    () => LOCALES.map((value) => ({ value, label: LANGUAGE_LABELS[value] })),
    [],
  );

  return (
    <SectionCard title={t.language}>
      <ChipGroup label={t.language} options={options} value={locale} onChange={setLocale} />
    </SectionCard>
  );
}

export function AccountPage() {
  const t = useLocalized(ACCOUNT_MESSAGES);
  const locale = useLocale();
  const labels = useAccountLabels();
  const account = useSessionStore((state) => state.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  useSeo(t.seoTitle, { noindex: true });

  const requested = searchParams.get(ACCOUNT_SECTION_PARAM);
  const active: AccountSection = isAccountSection(requested) ? requested : 'profile';
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const tab = activeTabRef.current;
    const list = tab?.closest('ul');
    if (!tab || !list || list.scrollWidth <= list.clientWidth) return;
    const offset = tab.getBoundingClientRect().left - list.getBoundingClientRect().left;
    list.scrollLeft += offset - 20;
  }, [active]);

  if (!account) return null;

  const memberSince = new Intl.DateTimeFormat(INTL_LOCALE[locale], { dateStyle: 'long' }).format(
    new Date(account.createdAt),
  );

  const selectSection = (section: AccountSection) =>
    setSearchParams(section === 'profile' ? {} : { [ACCOUNT_SECTION_PARAM]: section }, {
      replace: true,
      preventScrollReset: true,
      viewTransition: false,
    });

  const switchAccount = (email?: string) =>
    logout({ to: ROUTES.LOGIN, state: email ? { email } : undefined });

  return (
    <PageLayout
      intro={
        <PageIntro
          breadcrumb={[{ label: t.home, to: ROUTES.HOME }, t.seoTitle]}
          eyebrow={labels.role[account.role]}
          title={t.title}
          accent={account.name}
          description={`${account.email} · ${labels.faculty[account.faculty]} · ${t.memberSince(memberSince)}`}
          className="lg:pb-16"
        />
      }
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 pb-[72px] lg:flex-row lg:items-start lg:gap-10 lg:px-[85px] lg:pb-[120px]">
        <nav aria-label={t.sectionsNav} className="lg:sticky lg:top-28 lg:w-[280px] lg:shrink-0">
          <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
            {ACCOUNT_SECTIONS.map((section) => {
              const Icon = SECTION_ICONS[section];
              const isActive = section === active;
              return (
                <li key={section} className="shrink-0">
                  <button
                    type="button"
                    ref={isActive ? activeTabRef : undefined}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => selectSection(section)}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-3 rounded-full px-4 py-2.5 text-left text-[15px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime lg:rounded-[14px] lg:py-3',
                      isActive
                        ? 'bg-white text-viratec-ink'
                        : 'border border-white/14 bg-white/4 text-white hover:bg-white/10 lg:border-transparent lg:bg-transparent',
                      section === 'danger' && !isActive && 'text-state-error',
                    )}
                  >
                    <Icon aria-hidden="true" className="size-[18px] shrink-0" />
                    {t.sections[section]}
                  </button>
                </li>
              );
            })}
            <li className="shrink-0 lg:mt-3 lg:border-t lg:border-white/8 lg:pt-3">
              <button
                type="button"
                onClick={() => logout({ to: ROUTES.HOME })}
                disabled={isLoggingOut}
                className="flex w-full cursor-pointer items-center gap-3 rounded-full border border-white/14 bg-white/4 px-4 py-2.5 text-left text-[15px] font-medium whitespace-nowrap text-viratec-muted transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime disabled:opacity-50 lg:rounded-[14px] lg:border-transparent lg:bg-transparent lg:py-3"
              >
                <LogOut aria-hidden="true" className="size-[18px] shrink-0" />
                {t.signOut}
              </button>
            </li>
          </ul>
        </nav>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1.5">
              <h2 className="font-display text-[30px] leading-9 font-medium tracking-[-0.025em] text-white lg:text-[40px] lg:leading-[46px]">
                {t.sections[active]}
              </h2>
              <p className="text-[15px] leading-6 text-viratec-muted lg:text-base">
                {t.descriptions[active]}
              </p>
            </div>
            {(active === 'profile' || active === 'privacy') && (
              <Link
                to={buildPersonPath(account.id)}
                className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-white/22 bg-white/4 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime sm:self-auto"
              >
                <Eye aria-hidden="true" className="size-4" />
                {t.viewPublicProfile}
              </Link>
            )}
          </header>

          {active === 'profile' && <ProfileCompleteness account={account} />}
          {active === 'profile' && (
            <section className={CARD_CLASS}>
              <div className="mb-6 border-b border-white/8 pb-6">
                <AvatarUploader name={account.name} avatarUrl={account.avatarUrl} />
              </div>
              <ProfileForm key={account.id} account={account} />
            </section>
          )}
          {active === 'saved' && (
            <section className={CARD_CLASS}>
              <SavedList />
            </section>
          )}
          {active === 'security' && <SecuritySection account={account} t={t} />}
          {active === 'privacy' && (
            <div className="flex flex-col gap-4">
              <SectionCard title={t.profileVisibility}>
                <PrivacyForm key={account.id} account={account} />
              </SectionCard>
              <SectionCard title={t.dataExport}>
                <ExportDataButton />
              </SectionCard>
              <SectionCard title={t.dataDeletion}>
                <DataControls account={account} />
              </SectionCard>
            </div>
          )}
          {active === 'preferences' && <PreferencesSection t={t} />}
          {active === 'accounts' && (
            <section className={CARD_CLASS}>
              <AccountSwitcher
                currentEmail={account.email}
                isSwitching={isLoggingOut}
                onSwitch={switchAccount}
                onSignOut={() => logout({ to: ROUTES.HOME })}
                onSignOutAll={() => {
                  forgetAllAccounts();
                  logout({ to: ROUTES.LOGIN });
                }}
              />
            </section>
          )}
          {active === 'danger' && (
            <section className={cn(CARD_CLASS, 'border-state-error/30')}>
              <DeleteAccountForm email={account.email} hasPassword={account.hasPassword} />
            </section>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

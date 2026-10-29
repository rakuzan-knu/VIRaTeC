import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { forgetAllAccounts, useAccountLabels, useSessionStore } from '@/entities/session';
import { ProfileForm } from '@/features/update-profile';
import { AvatarUploader } from '@/features/update-avatar';
import { DeleteAccountForm } from '@/features/delete-account';
import { AccountSwitcher } from '@/features/switch-account';
import { useLogout } from '@/features/logout';
import { PrivacyForm } from '@/features/update-privacy';
import { ExportDataButton } from '@/features/export-data';
import { SavedList } from '@/features/save-item';
import { EmailVerificationNotice } from '@/features/verify-email';
import { ROUTES, buildPersonPath } from '@/shared/config/routes';
import { INTL_LOCALE, useLocale } from '@/shared/i18n';
import { cn, useSeo } from '@/shared/lib';
import { PageIntro } from '@/widgets/page-intro';
import { SiteHeader } from '@/widgets/site-header';
import { PageLayout } from '@/widgets/page-layout';
import { SiteFooter } from '@/widgets/site-footer';
import { useAccountMessages } from '../model/messages';
import { useAccountSection } from '../model/useAccountSection';
import { AccountNav } from './AccountNav';
import { DataControls } from './DataControls';
import { PreferencesSection } from './PreferencesSection';
import { ProfileCompleteness } from './ProfileCompleteness';
import { SectionCard } from './SectionCard';
import { SecuritySection } from './SecuritySection';
import { CARD_CLASS } from './styles';

export function AccountPage() {
  const t = useAccountMessages();
  const locale = useLocale();
  const labels = useAccountLabels();
  const account = useSessionStore((state) => state.user);
  const { active, select } = useAccountSection();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  useSeo(t.seoTitle, { noindex: true });

  if (!account) return null;

  const memberSince = new Intl.DateTimeFormat(INTL_LOCALE[locale], { dateStyle: 'long' }).format(
    new Date(account.createdAt),
  );

  const switchAccount = (email?: string) =>
    logout({ to: ROUTES.LOGIN, state: email ? { email } : undefined });

  return (
    <PageLayout
      footer={<SiteFooter />}
      intro={
        <PageIntro
          header={<SiteHeader />}
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
        <AccountNav
          active={active}
          isSigningOut={isLoggingOut}
          onSelect={select}
          onSignOut={() => logout({ to: ROUTES.HOME })}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {!account.emailVerified && <EmailVerificationNotice email={account.email} />}
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
          {active === 'security' && <SecuritySection account={account} />}
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
          {active === 'preferences' && <PreferencesSection />}
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

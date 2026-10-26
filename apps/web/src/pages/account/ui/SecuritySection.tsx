import { KeyRound, LogOut } from 'lucide-react';
import type { AccountDto } from '@viratec/contracts';
import { ChangePasswordForm } from '@/features/change-password';
import { GoogleConnection } from '@/features/link-google';
import { useLogoutAll } from '@/features/logout';
import { SessionsList } from '@/features/manage-sessions';
import { TwoFactorSettings } from '@/features/manage-two-factor';
import { cn } from '@/shared/lib';
import { GoogleIcon } from '@/shared/ui/google-icon';
import { useAccountMessages } from '../model/messages';
import { SectionCard } from './SectionCard';
import { CARD_CLASS, SUBHEADING_CLASS } from './styles';

export function SecuritySection({ account }: { account: AccountDto }) {
  const t = useAccountMessages();
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

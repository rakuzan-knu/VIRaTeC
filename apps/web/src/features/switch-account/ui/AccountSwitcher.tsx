import { useEffect, useState } from 'react';
import { LogOut, Plus, Undo2 } from 'lucide-react';
import {
  forgetAccount,
  rememberAccount,
  useKnownAccounts,
  UserAvatar,
  type KnownAccount,
} from '@/entities/session';
import { defineMessages, useLocalized } from '@/shared/i18n';

const UNDO_TIMEOUT_MS = 6000;

const ACCOUNT_SWITCHER_MESSAGES = defineMessages({
  en: {
    description:
      'Accounts used on this device. Only the current one is signed in — for the others we keep just the name and email, never passwords or tokens. Signing out of another account removes it from this device.',
    current: 'Signed in',
    switchTo: 'Switch',
    switchToLabel: (name: string) => `Switch to ${name}`,
    signOut: 'Sign out',
    signOutCurrentLabel: (name: string) => `Sign out of ${name}`,
    signOutOtherLabel: (name: string) => `Sign out of ${name} and remove it from this device`,
    removed: (name: string) => `${name} was removed from this device.`,
    undo: 'Undo',
    addAccount: 'Add another account',
    signOutAll: 'Sign out of all accounts on this device',
  },
  uk: {
    description:
      'Облікові записи, якими користувалися на цьому пристрої. Увійдено лише в поточний — для інших ми зберігаємо тільки ім’я та пошту, без паролів і токенів. Вихід з іншого запису прибирає його з пристрою.',
    current: 'Ви увійшли',
    switchTo: 'Перейти',
    switchToLabel: (name: string) => `Перейти до ${name}`,
    signOut: 'Вийти',
    signOutCurrentLabel: (name: string) => `Вийти з ${name}`,
    signOutOtherLabel: (name: string) => `Вийти з ${name} і прибрати з цього пристрою`,
    removed: (name: string) => `${name} прибрано з цього пристрою.`,
    undo: 'Скасувати',
    addAccount: 'Додати інший обліковий запис',
    signOutAll: 'Вийти з усіх облікових записів на цьому пристрої',
  },
});

const PILL_CLASS =
  'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime disabled:cursor-not-allowed disabled:opacity-50';
const SECONDARY_PILL = `${PILL_CLASS} border-white/22 text-white hover:border-white/40 hover:bg-white/10`;
const QUIET_PILL = `${PILL_CLASS} border-transparent text-viratec-muted hover:bg-white/8 hover:text-white`;
const FOOTER_ROW =
  'flex w-full cursor-pointer items-center gap-3 p-4 text-left text-[15px] font-medium transition-colors hover:bg-white/6 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-viratec-lime disabled:cursor-not-allowed disabled:opacity-50';

interface AccountSwitcherProps {
  currentEmail: string;
  isSwitching: boolean;
  onSwitch: (email?: string) => void;
  onSignOut: () => void;
  onSignOutAll: () => void;
}

export function AccountSwitcher({
  currentEmail,
  isSwitching,
  onSwitch,
  onSignOut,
  onSignOutAll,
}: AccountSwitcherProps) {
  const t = useLocalized(ACCOUNT_SWITCHER_MESSAGES);
  const accounts = useKnownAccounts();
  const [removed, setRemoved] = useState<KnownAccount | null>(null);

  useEffect(() => {
    if (!removed) return;
    const timer = window.setTimeout(() => setRemoved(null), UNDO_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [removed]);

  const ordered = [...accounts].sort(
    (a, b) => Number(b.email === currentEmail) - Number(a.email === currentEmail),
  );

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[15px] leading-6 text-viratec-muted">{t.description}</p>

      <ul className="flex flex-col divide-y divide-white/8 overflow-hidden rounded-[20px] border border-white/10 bg-white/4">
        {ordered.map((account) => {
          const isCurrent = account.email === currentEmail;
          return (
            <li key={account.email} className="flex flex-wrap items-center gap-3 p-4">
              <UserAvatar name={account.name} avatarUrl={account.avatarUrl} className="size-10" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-white">
                  <span className="truncate">{account.name}</span>
                  {isCurrent && (
                    <span className="rounded-full bg-viratec-lime/14 px-2.5 py-0.5 text-xs font-medium text-viratec-accent">
                      {t.current}
                    </span>
                  )}
                </span>
                <span className="truncate text-sm text-viratec-subtle">{account.email}</span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {!isCurrent && (
                  <button
                    type="button"
                    disabled={isSwitching}
                    aria-label={t.switchToLabel(account.name)}
                    onClick={() => onSwitch(account.email)}
                    className={SECONDARY_PILL}
                  >
                    {t.switchTo}
                  </button>
                )}
                <button
                  type="button"
                  disabled={isSwitching}
                  aria-label={
                    isCurrent
                      ? t.signOutCurrentLabel(account.name)
                      : t.signOutOtherLabel(account.name)
                  }
                  onClick={() => {
                    if (isCurrent) {
                      onSignOut();
                      return;
                    }
                    forgetAccount(account.email);
                    setRemoved(account);
                  }}
                  className={QUIET_PILL}
                >
                  <LogOut aria-hidden="true" className="size-4" />
                  {t.signOut}
                </button>
              </div>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            disabled={isSwitching}
            onClick={() => onSwitch()}
            className={`${FOOTER_ROW} text-white`}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-dashed border-white/30">
              <Plus aria-hidden="true" className="size-4" />
            </span>
            {t.addAccount}
          </button>
        </li>
        {accounts.length > 1 && (
          <li>
            <button
              type="button"
              disabled={isSwitching}
              onClick={onSignOutAll}
              className={`${FOOTER_ROW} text-state-error`}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-state-error/10">
                <LogOut aria-hidden="true" className="size-4" />
              </span>
              {t.signOutAll}
            </button>
          </li>
        )}
      </ul>

      <div role="status" className="min-h-6">
        {removed && (
          <p className="flex flex-wrap items-center gap-2 text-sm text-viratec-muted">
            {t.removed(removed.name)}
            <button
              type="button"
              onClick={() => {
                rememberAccount(removed);
                setRemoved(null);
              }}
              className="inline-flex cursor-pointer items-center gap-1 font-medium text-viratec-cyan hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
            >
              <Undo2 aria-hidden="true" className="size-3.5" />
              {t.undo}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

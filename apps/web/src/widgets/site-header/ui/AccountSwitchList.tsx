import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, Plus, Settings2 } from 'lucide-react';
import { UserAvatar, type KnownAccount } from '@/entities/session';
import { cn } from '@/shared/lib';
import type { useAccountMenu } from '../model/accountMenu';

type AccountMenu = ReturnType<typeof useAccountMenu>;

const ROW_CLASS =
  'flex w-full items-center gap-3 rounded-[12px] px-2.5 py-2 text-left text-sm text-white transition-colors hover:bg-white/7 focus-visible:bg-white/7 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-viratec-lime';

interface AccountSwitchListProps {
  id: string;
  menu: AccountMenu;
  onNavigate: () => void;
}

function AccountRow({ account, children }: { account: KnownAccount; children?: ReactNode }) {
  return (
    <>
      <UserAvatar name={account.name} avatarUrl={account.avatarUrl} className="size-8 text-xs" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium">{account.name}</span>
        <span className="truncate text-xs text-viratec-subtle">{account.email}</span>
      </span>
      {children}
    </>
  );
}

export function AccountSwitchList({ id, menu, onNavigate }: AccountSwitchListProps) {
  const { t, user, otherAccounts, switchTo, isSigningOut, manageAccountsTo } = menu;

  return (
    <div id={id} className="mx-1 mt-1 mb-1.5 flex flex-col gap-0.5 rounded-[16px] bg-white/4 p-1.5">
      <p className="px-2.5 pt-1 pb-1.5 text-[11px] font-medium tracking-[0.06em] text-viratec-subtle uppercase">
        {t.accountsOnDevice}
      </p>
      <ul className="flex flex-col gap-0.5">
        {user && (
          <li className={cn(ROW_CLASS, 'cursor-default hover:bg-transparent')}>
            <AccountRow
              account={{ email: user.email, name: user.name, avatarUrl: user.avatarUrl ?? null }}
            >
              <span className="flex items-center gap-1 text-xs text-viratec-accent">
                <Check aria-hidden="true" className="size-3.5" />
                {t.current}
              </span>
            </AccountRow>
          </li>
        )}
        {otherAccounts.map((account) => (
          <li key={account.email}>
            <button
              type="button"
              disabled={isSigningOut}
              aria-label={t.switchTo(account.name)}
              onClick={() => {
                onNavigate();
                switchTo(account.email);
              }}
              className={cn(ROW_CLASS, 'cursor-pointer disabled:opacity-50')}
            >
              <AccountRow account={account} />
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            disabled={isSigningOut}
            onClick={() => {
              onNavigate();
              switchTo();
            }}
            className={cn(ROW_CLASS, 'cursor-pointer disabled:opacity-50')}
          >
            <span className="flex size-8 items-center justify-center rounded-full border border-dashed border-white/30">
              <Plus aria-hidden="true" className="size-3.5" />
            </span>
            {t.addAccount}
          </button>
        </li>
        <li>
          <Link to={manageAccountsTo} onClick={onNavigate} className={ROW_CLASS}>
            <span className="flex size-8 items-center justify-center">
              <Settings2 aria-hidden="true" className="size-4 text-viratec-muted" />
            </span>
            <span className="text-viratec-muted">{t.manageAccounts}</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}

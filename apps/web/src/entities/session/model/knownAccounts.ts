import { create } from 'zustand';
import type { AccountDto } from '@viratec/contracts';
import { KNOWN_ACCOUNTS_STORAGE_KEY as STORAGE_KEY } from '@/shared/config/storageKeys';

const MAX_KNOWN_ACCOUNTS = 5;

export interface KnownAccount {
  email: string;
  name: string;
  avatarUrl: string | null;
}

const isKnownAccount = (value: unknown): value is KnownAccount => {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.email === 'string' &&
    typeof record.name === 'string' &&
    (record.avatarUrl === null || typeof record.avatarUrl === 'string')
  );
};

const readKnownAccounts = (): KnownAccount[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isKnownAccount) : [];
  } catch {
    return [];
  }
};

const writeKnownAccounts = (accounts: KnownAccount[]) => {
  try {
    if (accounts.length === 0) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    return;
  }
};

interface KnownAccountsState {
  accounts: KnownAccount[];
}

export const useKnownAccountsStore = create<KnownAccountsState>(() => ({
  accounts: readKnownAccounts(),
}));

const update = (accounts: KnownAccount[]) => {
  writeKnownAccounts(accounts);
  useKnownAccountsStore.setState({ accounts });
};

export const rememberAccount = (
  user: Pick<AccountDto, 'email' | 'name'> & { avatarUrl?: string | null },
) => {
  const entry: KnownAccount = {
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl ?? null,
  };
  const others = useKnownAccountsStore
    .getState()
    .accounts.filter((account) => account.email !== entry.email);
  update([entry, ...others].slice(0, MAX_KNOWN_ACCOUNTS));
};

export const forgetAccount = (email: string) => {
  update(useKnownAccountsStore.getState().accounts.filter((account) => account.email !== email));
};

export const forgetAllAccounts = () => update([]);

export const useKnownAccounts = () => useKnownAccountsStore((state) => state.accounts);

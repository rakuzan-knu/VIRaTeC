import { create } from 'zustand';
import type { AccountDto } from '@viratec/contracts';
import { rememberAccount } from './knownAccounts';

const SESSION_HINT_KEY = 'viratec_session';
const LEGACY_TOKEN_KEYS = ['viratec_token', 'viratec_refresh_token'];

const readStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    return;
  }
};

const hadLegacySession = LEGACY_TOKEN_KEYS.some((key) => readStorage(key) !== null);
LEGACY_TOKEN_KEYS.forEach((key) => writeStorage(key, null));

interface SessionState {
  user: AccountDto | null;
  hasSession: boolean;
  isRestoring: boolean;
  hasSignedOut: boolean;
  awaitingSecondFactor: boolean;
  setSession: (user: AccountDto) => void;
  setUser: (user: AccountDto) => void;
  requireSecondFactor: () => void;
  cancelSecondFactor: () => void;
  finishRestoring: () => void;
  acknowledgeSignOut: () => void;
  clearSession: (options?: { signedOut?: boolean }) => void;
}

const initialHasSession = readStorage(SESSION_HINT_KEY) === '1' || hadLegacySession;

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  hasSession: initialHasSession,
  isRestoring: initialHasSession,
  hasSignedOut: false,
  awaitingSecondFactor: false,
  setSession: (user) => {
    writeStorage(SESSION_HINT_KEY, '1');
    rememberAccount(user);
    set({
      user,
      hasSession: true,
      isRestoring: false,
      hasSignedOut: false,
      awaitingSecondFactor: false,
    });
  },
  setUser: (user) => {
    rememberAccount(user);
    set({ user });
  },
  requireSecondFactor: () => set({ awaitingSecondFactor: true }),
  cancelSecondFactor: () => set({ awaitingSecondFactor: false }),
  finishRestoring: () => set({ isRestoring: false }),
  acknowledgeSignOut: () => set({ hasSignedOut: false }),
  clearSession: ({ signedOut = false } = {}) => {
    writeStorage(SESSION_HINT_KEY, null);
    set({
      user: null,
      hasSession: false,
      isRestoring: false,
      hasSignedOut: signedOut,
      awaitingSecondFactor: false,
    });
  },
}));

export const useIsAuthenticated = () => useSessionStore((state) => state.hasSession);

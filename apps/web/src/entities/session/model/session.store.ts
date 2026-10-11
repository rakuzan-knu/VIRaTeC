import { create } from 'zustand';
import { UserDto } from '@viratec/contracts';

interface SessionState {
  user: UserDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  isInitialized: boolean;
  setSession: (payload: { user: UserDto; accessToken: string; refreshToken: string }) => void;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  clearSession: () => void;
  setInitialized: (initialized: boolean) => void;
}

const ACCESS_TOKEN_KEY = 'viratec_access_token';
const REFRESH_TOKEN_KEY = 'viratec_refresh_token';

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
  refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  isInitialized: false,

  setSession: ({ user, accessToken, refreshToken }) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    set({ user, accessToken, refreshToken, isInitialized: true });
  },

  setTokens: ({ accessToken, refreshToken }) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    set({ accessToken, refreshToken });
  },

  clearSession: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    set({ user: null, accessToken: null, refreshToken: null, isInitialized: true });
  },

  setInitialized: (initialized) => set({ isInitialized: initialized }),
}));

export const useIsAuthenticated = () =>
  useSessionStore((state) => Boolean(state.accessToken && state.user));

import { create } from 'zustand';
import type { UserDto } from '@viratec/contracts';

interface SessionState {
  user: UserDto | null;
  token: string | null;
  setSession: (user: UserDto, token: string) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  token: null,
  setSession: (user, token) => {
    localStorage.setItem('viratec_token', token);
    set({ user, token });
  },
  clearSession: () => {
    localStorage.removeItem('viratec_token');
    set({ user: null, token: null });
  },
}));

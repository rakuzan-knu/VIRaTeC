import { useEffect, type ReactNode } from 'react';
import { api } from '@/shared/api/apiClient';
import { fetchCurrentAccount, refreshSession, useSessionStore } from '@/entities/session';

api.setUnauthorizedHandler(refreshSession);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  useEffect(() => {
    const { hasSession, user, setUser, finishRestoring } = useSessionStore.getState();
    if (!hasSession || user) {
      finishRestoring();
      return;
    }

    let isActive = true;
    fetchCurrentAccount()
      .then((account) => {
        if (isActive) setUser(account);
      })
      .catch(() => undefined)
      .finally(() => {
        if (isActive) finishRestoring();
      });

    return () => {
      isActive = false;
    };
  }, []);

  return <>{children}</>;
}

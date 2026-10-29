import { useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/apiClient';
import { fetchCurrentAccount, refreshSession, useSessionStore } from '@/entities/session';

api.setUnauthorizedHandler(refreshSession);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const queryClient = useQueryClient();

  useEffect(
    () =>
      useSessionStore.subscribe((next, previous) => {
        if (next.user?.id !== previous.user?.id || (previous.hasSession && !next.hasSession)) {
          // Clear synchronously, before the next account can render cached private data.
          queryClient.clear();
        }
      }),
    [queryClient],
  );

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

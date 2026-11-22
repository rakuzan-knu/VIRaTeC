import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { AccountDto } from '@viratec/contracts';
import { useSessionStore } from './store';

export function useStartSession() {
  const queryClient = useQueryClient();
  const setSession = useSessionStore((state) => state.setSession);

  return useCallback(
    (user: AccountDto) => {
      const previousUserId = useSessionStore.getState().user?.id;
      if (previousUserId && previousUserId !== user.id) queryClient.clear();
      setSession(user);
    },
    [queryClient, setSession],
  );
}

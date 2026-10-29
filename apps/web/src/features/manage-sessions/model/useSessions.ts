import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SessionDto } from '@viratec/contracts';
import { useEndSession, useSessionStore } from '@/entities/session';
import { ROUTES } from '@/shared/config/routes';
import { eraseOtherSessionsRequest, fetchSessions, revokeSessionRequest } from '../api/sessions';

const sessionKeys = {
  all: ['sessions'] as const,
  account: (userId: string | undefined) => ['sessions', userId] as const,
};

export function useSessions() {
  const userId = useSessionStore((state) => state.user?.id);
  return useQuery({
    queryKey: sessionKeys.account(userId),
    queryFn: fetchSessions,
    enabled: Boolean(userId),
    staleTime: 15_000,
  });
}

export function useEraseOtherSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eraseOtherSessionsRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sessionKeys.all }),
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  const endSession = useEndSession();
  const userId = useSessionStore((state) => state.user?.id);

  return useMutation({
    mutationFn: (session: SessionDto) => revokeSessionRequest(session.id),
    onSuccess: (_data, session) => {
      if (useSessionStore.getState().user?.id !== userId) return;
      if (session.isCurrent) {
        endSession({ to: ROUTES.LOGIN });
        return;
      }
      queryClient.setQueryData<SessionDto[]>(sessionKeys.account(userId), (sessions) =>
        sessions?.filter((item) => item.id !== session.id),
      );
    },
  });
}

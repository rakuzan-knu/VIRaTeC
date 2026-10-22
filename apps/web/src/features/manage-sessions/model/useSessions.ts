import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SessionDto } from '@viratec/contracts';
import { useEndSession } from '@/entities/session';
import { ROUTES } from '@/shared/config/routes';
import { eraseOtherSessionsRequest, fetchSessions, revokeSessionRequest } from '../api/sessions';

const sessionKeys = { all: ['sessions'] as const };

export function useSessions() {
  return useQuery({ queryKey: sessionKeys.all, queryFn: fetchSessions, staleTime: 15_000 });
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

  return useMutation({
    mutationFn: (session: SessionDto) => revokeSessionRequest(session.id),
    onSuccess: (_data, session) => {
      if (session.isCurrent) {
        endSession({ to: ROUTES.LOGIN });
        return;
      }
      queryClient.setQueryData<SessionDto[]>(sessionKeys.all, (sessions) =>
        sessions?.filter((item) => item.id !== session.id),
      );
    },
  });
}

import { useMutation } from '@tanstack/react-query';
import { logoutRequest, useEndSession, type EndSessionTarget } from '@/entities/session';
import { ROUTES } from '@/shared/config/routes';
import { logoutAllRequest } from '../api/logoutAll';

export function useLogout() {
  const endSession = useEndSession();

  return useMutation({
    mutationFn: async (_target: EndSessionTarget) => {
      await logoutRequest().catch(() => undefined);
    },
    onSuccess: (_data, target) => endSession(target),
  });
}

export function useLogoutAll() {
  const endSession = useEndSession();

  return useMutation({
    mutationFn: logoutAllRequest,
    onSuccess: () => endSession({ to: ROUTES.LOGIN }),
  });
}

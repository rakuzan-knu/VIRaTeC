import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventKeys, useEventAccess } from '@/entities/event';
import { useSessionStore } from '@/entities/session';
import { getApiErrorCode } from '@/shared/api/apiClient';
import { useLocale } from '@/shared/i18n';
import { registerForEventRequest, unregisterFromEventRequest } from '../api/eventRegistration';

export function useEventRegistration(eventId: string) {
  const queryClient = useQueryClient();
  const locale = useLocale();
  const userId = useSessionStore((state) => state.user?.id ?? null);
  const emailVerified = useSessionStore((state) => state.user?.emailVerified ?? false);
  const { data: access } = useEventAccess(eventId, userId);

  const toggle = useMutation({
    mutationFn: (register: boolean) =>
      register
        ? registerForEventRequest(eventId, {
            locale,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          })
        : unregisterFromEventRequest(eventId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: eventKeys.access(eventId, userId) }),
        queryClient.invalidateQueries({ queryKey: eventKeys.mine(userId) }),
      ]),
  });

  return {
    access,
    emailVerified,
    isSignedIn: userId !== null,
    toggle: () => toggle.mutate(!access?.registered),
    isToggling: toggle.isPending,
    errorCode: toggle.isError ? (getApiErrorCode(toggle.error) ?? 'UNKNOWN') : null,
  };
}

import { useMutation } from '@tanstack/react-query';
import { useEventAccess } from '@/entities/event';
import { useSessionStore } from '@/entities/session';
import { recordAttendanceRequest } from '../api/attendance';
import { useCountdown } from './useCountdown';

export function useJoinEvent(eventId: string) {
  const userId = useSessionStore((state) => state.user?.id ?? null);
  const { data: access } = useEventAccess(eventId, userId);
  const remainingMs = useCountdown(access?.state === 'NOT_YET' ? access.opensAt : null);
  const { mutate: recordAttendance } = useMutation({
    mutationFn: () => recordAttendanceRequest(eventId),
  });

  return {
    access,
    remainingMs,
    onJoin: () => {
      if (userId) recordAttendance();
    },
  };
}

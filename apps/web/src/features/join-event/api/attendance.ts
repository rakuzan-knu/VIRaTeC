import { api } from '@/shared/api/apiClient';

export const recordAttendanceRequest = (eventId: string) =>
  api.post<{ success: boolean }>(`/events/${encodeURIComponent(eventId)}/attendance`, undefined);

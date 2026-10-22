import { api } from '@/shared/api/apiClient';
import type { SessionDto } from '@viratec/contracts';

export const fetchSessions = (): Promise<SessionDto[]> => api.get<SessionDto[]>('/auth/sessions');

export const eraseOtherSessionsRequest = (): Promise<{ removed: number }> =>
  api.delete<{ removed: number }>('/auth/sessions');

export const revokeSessionRequest = (sessionId: string): Promise<{ success: boolean }> =>
  api.delete<{ success: boolean }>(`/auth/sessions/${encodeURIComponent(sessionId)}`);

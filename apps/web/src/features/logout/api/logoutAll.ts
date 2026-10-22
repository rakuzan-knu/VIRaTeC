import { api } from '@/shared/api/apiClient';

export const logoutAllRequest = (): Promise<{ success: boolean }> =>
  api.post<{ success: boolean }>('/auth/logout-all', {});

import { api } from '@/shared/api/apiClient';

export const exportDataRequest = (): Promise<unknown> => api.get<unknown>('/users/me/export');

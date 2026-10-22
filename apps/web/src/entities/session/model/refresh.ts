import { ApiError, NETWORK_ERROR_STATUS } from '@/shared/api/apiClient';
import { refreshSessionRequest } from '../api/sessionApi';
import { useSessionStore } from './store';

let pendingRefresh: Promise<boolean> | null = null;

const performRefresh = async (): Promise<boolean> => {
  const { hasSession, setSession, clearSession } = useSessionStore.getState();
  if (!hasSession) return false;

  try {
    const { user } = await refreshSessionRequest();
    setSession(user);
    return true;
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== NETWORK_ERROR_STATUS) clearSession();
    return false;
  }
};

export const refreshSession = (): Promise<boolean> => {
  pendingRefresh ??= performRefresh().finally(() => {
    pendingRefresh = null;
  });
  return pendingRefresh;
};

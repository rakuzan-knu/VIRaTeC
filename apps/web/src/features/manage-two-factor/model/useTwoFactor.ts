import { useMutation } from '@tanstack/react-query';
import { fetchCurrentAccount, useSessionStore } from '@/entities/session';
import {
  beginTwoFactorSetup,
  disableTwoFactor,
  enableTwoFactor,
  regenerateBackupCodes,
  stepUp,
} from '../api/twoFactorApi';

function useRefreshAccount() {
  const setUser = useSessionStore((state) => state.setUser);
  return async () => setUser(await fetchCurrentAccount());
}

export const useBeginTwoFactorSetup = () => useMutation({ mutationFn: beginTwoFactorSetup });

export function useEnableTwoFactor() {
  const refreshAccount = useRefreshAccount();
  return useMutation({ mutationFn: enableTwoFactor, onSuccess: refreshAccount });
}

export function useDisableTwoFactor() {
  const refreshAccount = useRefreshAccount();
  return useMutation({ mutationFn: disableTwoFactor, onSuccess: refreshAccount });
}

export const useRegenerateBackupCodes = () => useMutation({ mutationFn: regenerateBackupCodes });

export const useStepUp = () => useMutation({ mutationFn: stepUp });

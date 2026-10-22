import { useMutation } from '@tanstack/react-query';
import { useSessionStore } from '@/entities/session';
import { linkGoogleRequest, unlinkGoogleRequest } from '../api/googleLink';

export function useLinkGoogle() {
  const setUser = useSessionStore((state) => state.setUser);

  return useMutation({
    mutationFn: (credential: string) => linkGoogleRequest({ credential }),
    onSuccess: (account) => setUser(account),
  });
}

export function useUnlinkGoogle() {
  const setUser = useSessionStore((state) => state.setUser);

  return useMutation({
    mutationFn: unlinkGoogleRequest,
    onSuccess: (account) => setUser(account),
  });
}

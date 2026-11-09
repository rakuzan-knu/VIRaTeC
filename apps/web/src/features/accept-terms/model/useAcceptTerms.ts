import { useMutation } from '@tanstack/react-query';
import { TERMS_VERSION } from '@viratec/contracts';
import { useSessionStore } from '@/entities/session';
import { acceptTermsRequest } from '../api/acceptTerms';

export function useAcceptTerms() {
  const setUser = useSessionStore((state) => state.setUser);

  return useMutation({
    mutationFn: () => acceptTermsRequest({ version: TERMS_VERSION }),
    onSuccess: setUser,
  });
}

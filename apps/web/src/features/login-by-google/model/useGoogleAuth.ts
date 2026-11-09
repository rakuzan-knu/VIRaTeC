import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useCompleteSignIn } from '@/entities/session';
import { ApiError } from '@/shared/api/apiClient';
import { googleAuthRequest } from '../api/googleAuth';

export function useGoogleAuth() {
  const completeSignIn = useCompleteSignIn();
  const [credentialAwaitingTerms, setCredentialAwaitingTerms] = useState<string | null>(null);
  const [hasAgreed, setHasAgreed] = useState(false);

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: googleAuthRequest,
    onSuccess: (response) => completeSignIn(response),
    onError: (requestError, { credential, acceptTerms }) => {
      const needsTerms =
        !acceptTerms && requestError instanceof ApiError && requestError.status === 400;
      setCredentialAwaitingTerms(needsTerms ? credential : null);
      setHasAgreed(false);
    },
  });

  return {
    authenticate: (credential: string) => mutate({ credential }),
    acceptTerms: () => {
      if (credentialAwaitingTerms && hasAgreed) {
        mutate({ credential: credentialAwaitingTerms, acceptTerms: true });
      }
    },
    cancelTerms: () => {
      setCredentialAwaitingTerms(null);
      setHasAgreed(false);
      reset();
    },
    isAwaitingTerms: credentialAwaitingTerms !== null,
    hasAgreed,
    setHasAgreed,
    isPending,
    error,
  };
}

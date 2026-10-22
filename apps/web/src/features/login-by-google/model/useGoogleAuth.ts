import { useMutation } from '@tanstack/react-query';
import { useCompleteSignIn } from '@/entities/session';
import { googleAuthRequest } from '../api/googleAuth';

export function useGoogleAuth() {
  const completeSignIn = useCompleteSignIn();

  return useMutation({
    mutationFn: (credential: string) => googleAuthRequest({ credential }),
    onSuccess: completeSignIn,
  });
}

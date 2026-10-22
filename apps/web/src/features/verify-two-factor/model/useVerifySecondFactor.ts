import { useMutation } from '@tanstack/react-query';
import { useCompleteSignIn, verifySecondFactorRequest } from '@/entities/session';

export function useVerifySecondFactor() {
  const completeSignIn = useCompleteSignIn();

  return useMutation({
    mutationFn: (code: string) => verifySecondFactorRequest({ code }),
    onSuccess: completeSignIn,
  });
}

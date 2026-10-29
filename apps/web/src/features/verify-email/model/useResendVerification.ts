import { useMutation } from '@tanstack/react-query';
import { resendVerificationRequest } from '../api/emailVerification';

export function useResendVerification() {
  return useMutation({ mutationFn: resendVerificationRequest });
}

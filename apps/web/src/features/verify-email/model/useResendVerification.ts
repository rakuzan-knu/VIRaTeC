import { useMutation } from '@tanstack/react-query';
import { ApiError, NETWORK_ERROR_STATUS } from '@/shared/api/apiClient';
import { useCommonMessages } from '@/shared/i18n';
import { resendVerificationRequest } from '../api/emailVerification';
import { useVerifyEmailMessages } from './messages';

export function useResendVerification() {
  const t = useVerifyEmailMessages();
  const common = useCommonMessages();
  const mutation = useMutation({ mutationFn: resendVerificationRequest });
  const { error } = mutation;

  const errorMessage = !error
    ? null
    : error instanceof ApiError && error.status === 429
      ? t.errors.tooMany
      : error instanceof ApiError && error.status === 503
        ? t.errors.unavailable
        : error instanceof ApiError && error.status === NETWORK_ERROR_STATUS
          ? common.networkError
          : t.errors.unexpected;

  return { ...mutation, errorMessage };
}

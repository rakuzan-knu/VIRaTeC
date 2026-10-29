import { api } from '@/shared/api/apiClient';
import type { VerifyEmailRequestDto } from '@viratec/contracts';

export const verifyEmailRequest = (dto: VerifyEmailRequestDto): Promise<{ success: boolean }> =>
  api.post<{ success: boolean }>('/auth/email/verify', dto, { retryOnUnauthorized: false });

export const resendVerificationRequest = (): Promise<{ success: boolean }> =>
  api.post<{ success: boolean }>('/auth/email/resend', undefined);

import { api } from '@/shared/api/apiClient';
import type { ForgotPasswordRequestDto, ResetPasswordRequestDto } from '@viratec/contracts';

export const forgotPasswordRequest = (
  dto: ForgotPasswordRequestDto,
): Promise<{ success: boolean }> =>
  api.post<{ success: boolean }>('/auth/password/forgot', dto, { retryOnUnauthorized: false });

export const resetPasswordRequest = (dto: ResetPasswordRequestDto): Promise<{ success: boolean }> =>
  api.post<{ success: boolean }>('/auth/password/reset', dto, { retryOnUnauthorized: false });

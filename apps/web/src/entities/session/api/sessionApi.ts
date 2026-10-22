import { api } from '@/shared/api/apiClient';
import type {
  AccountDto,
  AuthResponseDto,
  SignInResponseDto,
  TwoFactorCodeRequestDto,
} from '@viratec/contracts';

export const fetchCurrentAccount = (): Promise<AccountDto> => api.get<AccountDto>('/auth/me');

export const refreshSessionRequest = (): Promise<AuthResponseDto> =>
  api.post<AuthResponseDto>('/auth/refresh', undefined, { retryOnUnauthorized: false });

export const logoutRequest = (): Promise<{ success: boolean }> =>
  api.post<{ success: boolean }>('/auth/logout', undefined, { retryOnUnauthorized: false });

export const verifySecondFactorRequest = (
  dto: TwoFactorCodeRequestDto,
): Promise<SignInResponseDto> =>
  api.post<SignInResponseDto>('/auth/2fa/verify', dto, { retryOnUnauthorized: false });

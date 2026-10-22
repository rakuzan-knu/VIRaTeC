import { api } from '@/shared/api/apiClient';
import type { LoginRequestDto, SignInResponseDto } from '@viratec/contracts';

export const loginRequest = async (dto: LoginRequestDto): Promise<SignInResponseDto> => {
  return api.post<SignInResponseDto>('/auth/login', dto, { retryOnUnauthorized: false });
};

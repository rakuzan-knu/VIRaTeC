import { api } from '@/shared/api/apiClient';
import type { GoogleAuthRequestDto, SignInResponseDto } from '@viratec/contracts';

export const googleAuthRequest = async (dto: GoogleAuthRequestDto): Promise<SignInResponseDto> => {
  return api.post<SignInResponseDto>('/auth/google', dto, { retryOnUnauthorized: false });
};

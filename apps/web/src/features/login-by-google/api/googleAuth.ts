import { api } from '@/shared/api/apiClient';
import type { AuthResponseDto, GoogleAuthRequestDto } from '@viratec/contracts';

export const googleAuthRequest = async (dto: GoogleAuthRequestDto): Promise<AuthResponseDto> => {
  return api.post<AuthResponseDto>('/auth/google', dto);
};

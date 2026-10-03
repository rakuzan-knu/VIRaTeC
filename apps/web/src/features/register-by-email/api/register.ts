import { api } from '@/shared/api/apiClient';
import type { RegisterRequestDto, AuthResponseDto } from '@viratec/contracts';

export const registerRequest = async (dto: RegisterRequestDto): Promise<AuthResponseDto> => {
  return api.post<AuthResponseDto>('/api/v1/auth/register', dto);
};

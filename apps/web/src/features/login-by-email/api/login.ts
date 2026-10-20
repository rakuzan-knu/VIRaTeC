import { api } from '@/shared/api/apiClient';
import type { AuthResponseDto, LoginRequestDto } from '@viratec/contracts';

export const loginRequest = async (dto: LoginRequestDto): Promise<AuthResponseDto> => {
  return api.post<AuthResponseDto>('/auth/login', dto);
};

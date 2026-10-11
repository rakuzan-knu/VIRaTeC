import { LoginRequestDto, AuthResponseDto } from '@viratec/contracts';
import { apiClient } from '@/shared';

export interface LoginResponse {
  data: AuthResponseDto;
}

export async function loginRequest(dto: LoginRequestDto): Promise<AuthResponseDto> {
  const response = await apiClient<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  return response.data;
}

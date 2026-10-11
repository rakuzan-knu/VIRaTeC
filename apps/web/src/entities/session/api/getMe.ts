import { UserDto } from '@viratec/contracts';
import { apiClient } from '@/shared';

export interface GetMeResponse {
  data: UserDto;
}

export async function getMe(): Promise<UserDto> {
  const response = await apiClient<GetMeResponse>('/auth/me');
  return response.data;
}

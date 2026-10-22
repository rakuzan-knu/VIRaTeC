import { api } from '@/shared/api/apiClient';
import type { AuthResponseDto, ChangePasswordRequestDto } from '@viratec/contracts';

export const changePasswordRequest = (dto: ChangePasswordRequestDto): Promise<AuthResponseDto> =>
  api.post<AuthResponseDto>('/auth/change-password', dto);

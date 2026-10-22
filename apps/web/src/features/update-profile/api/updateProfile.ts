import { api } from '@/shared/api/apiClient';
import type { AccountDto, UpdateProfileRequestDto } from '@viratec/contracts';

export const updateProfileRequest = (dto: UpdateProfileRequestDto): Promise<AccountDto> =>
  api.patch<AccountDto>('/users/me', dto);

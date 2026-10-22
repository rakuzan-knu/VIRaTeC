import { api } from '@/shared/api/apiClient';
import type { AccountDto, UploadAvatarRequestDto } from '@viratec/contracts';

export const uploadAvatarRequest = (dto: UploadAvatarRequestDto): Promise<AccountDto> =>
  api.put<AccountDto>('/users/me/avatar', dto);

export const deleteAvatarRequest = (): Promise<AccountDto> =>
  api.delete<AccountDto>('/users/me/avatar');

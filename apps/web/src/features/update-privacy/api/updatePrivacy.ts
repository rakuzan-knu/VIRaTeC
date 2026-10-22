import { api } from '@/shared/api/apiClient';
import type { AccountDto, PrivacySettingsDto } from '@viratec/contracts';

export const updatePrivacyRequest = (dto: PrivacySettingsDto): Promise<AccountDto> =>
  api.patch<AccountDto>('/users/me/privacy', dto);

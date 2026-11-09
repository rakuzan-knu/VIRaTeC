import { api } from '@/shared/api/apiClient';
import type { AccountDto, RequestEmailChangeDto } from '@viratec/contracts';

export const requestEmailChange = (dto: RequestEmailChangeDto): Promise<AccountDto> =>
  api.post<AccountDto>('/auth/email/change', dto);

export const cancelEmailChange = (): Promise<AccountDto> =>
  api.delete<AccountDto>('/auth/email/change');

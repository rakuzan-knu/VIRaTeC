import { api } from '@/shared/api/apiClient';
import type { AcceptTermsRequestDto, AccountDto } from '@viratec/contracts';

export const acceptTermsRequest = (dto: AcceptTermsRequestDto): Promise<AccountDto> =>
  api.post<AccountDto>('/auth/terms/accept', dto);

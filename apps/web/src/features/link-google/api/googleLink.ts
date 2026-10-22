import { api } from '@/shared/api/apiClient';
import type { AccountDto, GoogleAuthRequestDto } from '@viratec/contracts';

export const linkGoogleRequest = (dto: GoogleAuthRequestDto): Promise<AccountDto> =>
  api.post<AccountDto>('/auth/google/link', dto);

export const unlinkGoogleRequest = (): Promise<AccountDto> =>
  api.delete<AccountDto>('/auth/google/link');

import { api } from '@/shared/api/apiClient';
import type { DeleteAccountRequestDto } from '@viratec/contracts';

export const deleteAccountRequest = (dto: DeleteAccountRequestDto): Promise<{ success: boolean }> =>
  api.delete<{ success: boolean }>('/users/me', dto);

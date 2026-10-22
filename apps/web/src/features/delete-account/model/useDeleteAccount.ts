import { useMutation } from '@tanstack/react-query';
import type { DeleteAccountRequestDto } from '@viratec/contracts';
import { forgetAccount, useEndSession } from '@/entities/session';
import { ROUTES } from '@/shared/config/routes';
import { deleteAccountRequest } from '../api/deleteAccount';

export function useDeleteAccount(email: string) {
  const endSession = useEndSession();

  return useMutation({
    mutationFn: (dto: DeleteAccountRequestDto) => deleteAccountRequest(dto),
    onSuccess: () => {
      forgetAccount(email);
      endSession({ to: ROUTES.HOME });
    },
  });
}

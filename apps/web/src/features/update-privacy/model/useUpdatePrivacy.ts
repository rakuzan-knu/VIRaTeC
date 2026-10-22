import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PrivacySettingsDto } from '@viratec/contracts';
import { personKeys } from '@/entities/person';
import { useSessionStore } from '@/entities/session';
import { updatePrivacyRequest } from '../api/updatePrivacy';

export function useUpdatePrivacy() {
  const setUser = useSessionStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: PrivacySettingsDto) => updatePrivacyRequest(dto),
    onSuccess: (account) => {
      setUser(account);
      void queryClient.invalidateQueries({ queryKey: personKeys.all });
    },
  });
}

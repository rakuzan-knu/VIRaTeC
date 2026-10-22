import { useMutation } from '@tanstack/react-query';
import { useSessionStore } from '@/entities/session';
import { changePasswordRequest } from '../api/changePassword';
import type { ChangePasswordFormValues } from './schema';

export function useChangePassword() {
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: ChangePasswordFormValues) =>
      changePasswordRequest({ currentPassword: currentPassword || undefined, newPassword }),
    onSuccess: ({ user }) => setSession(user),
  });
}

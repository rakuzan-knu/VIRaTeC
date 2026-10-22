import { useMutation } from '@tanstack/react-query';
import { useSessionStore } from '@/entities/session';
import { deleteAvatarRequest, uploadAvatarRequest } from '../api/avatar';
import { prepareAvatar } from '../lib/prepareAvatar';

export function useUploadAvatar() {
  const setUser = useSessionStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (file: File) => uploadAvatarRequest({ image: await prepareAvatar(file) }),
    onSuccess: (account) => setUser(account),
  });
}

export function useDeleteAvatar() {
  const setUser = useSessionStore((state) => state.setUser);

  return useMutation({
    mutationFn: deleteAvatarRequest,
    onSuccess: (account) => setUser(account),
  });
}

import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '@/entities/session';
import { ROUTES } from '@/shared/config/routes';
import { googleAuthRequest } from '../api/googleAuth';

export function useGoogleAuth() {
  const navigate = useNavigate();
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: (credential: string) => googleAuthRequest({ credential }),
    onSuccess: (data) => {
      setSession(data.user, data.accessToken);
      navigate(ROUTES.HOME, { replace: true });
    },
  });
}

import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '@/entities/session';
import { ROUTES } from '@/shared/config/routes';
import { loginRequest } from '../api/login';
import type { LoginFormValues } from './schema';

export function useLogin() {
  const navigate = useNavigate();
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: (values: LoginFormValues) => loginRequest(values),
    onSuccess: (data) => {
      setSession(data.user, data.accessToken);
      navigate(ROUTES.HOME, { replace: true });
    },
  });
}

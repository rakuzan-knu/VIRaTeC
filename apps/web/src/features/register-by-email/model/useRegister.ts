import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { registerRequest } from '../api/register';
import { useSessionStore } from '@/entities/session';
import { ROUTES } from '@/shared/config/routes';
import { UserRole, FacultyDivision } from '@viratec/contracts';
import type { RegisterFormValues } from './schema';

export function useRegister() {
  const navigate = useNavigate();
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: (values: RegisterFormValues) => {
      return registerRequest({
        name: values.name,
        email: values.email,
        password: values.password,
        role: UserRole.STUDENT,
        faculty: FacultyDivision.FIT,
      });
    },
    onSuccess: (data) => {
      setSession(data.user, data.accessToken);
      navigate(ROUTES.HOME, { replace: true });
    },
  });
}

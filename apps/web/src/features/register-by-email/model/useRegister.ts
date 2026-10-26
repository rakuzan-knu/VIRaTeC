import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { registerRequest } from '../api/register';
import { readAuthNavigationState, useSessionStore } from '@/entities/session';
import { ROUTES } from '@/shared/config/routes';
import { UserRole, FacultyDivision } from '@viratec/contracts';
import type { RegisterFormValues } from './schema';

export function useRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: (values: RegisterFormValues) => {
      return registerRequest({
        name: values.name,
        email: values.email,
        password: values.password,
        role: UserRole.STUDENT,
        faculty: FacultyDivision.FIT,
        acceptTerms: true,
      });
    },
    onSuccess: (data) => {
      setSession(data.user);
      navigate(readAuthNavigationState(location.state).from ?? ROUTES.HOME, { replace: true });
    },
  });
}

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import type { AccountDto } from '@viratec/contracts';
import { registerRequest } from '../api/register';
import { readAuthNavigationState, useStartSession } from '@/entities/session';
import { ROUTES } from '@/shared/config/routes';
import { FacultyDivision } from '@viratec/contracts';
import type { RegisterFormValues } from './schema';

interface UseRegisterOptions {
  holdUnverified?: boolean;
}

export function useRegister({ holdUnverified = false }: UseRegisterOptions = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const startSession = useStartSession();
  const [unverifiedUser, setUnverifiedUser] = useState<AccountDto | null>(null);

  const finish = (user: AccountDto) => {
    startSession(user);
    navigate(readAuthNavigationState(location.state).from ?? ROUTES.HOME, { replace: true });
  };

  const mutation = useMutation({
    mutationFn: (values: RegisterFormValues) => {
      return registerRequest({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        faculty: FacultyDivision.FIT,
        acceptTerms: true,
      });
    },
    onSuccess: (data) => {
      if (holdUnverified && !data.user.emailVerified) setUnverifiedUser(data.user);
      else finish(data.user);
    },
  });

  const continueAfterVerification = () => {
    if (unverifiedUser) finish(unverifiedUser);
  };

  return { ...mutation, unverifiedUser, continueAfterVerification };
}

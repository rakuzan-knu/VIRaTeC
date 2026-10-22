import { useMutation } from '@tanstack/react-query';
import { useCompleteSignIn } from '@/entities/session';
import { loginRequest } from '../api/login';
import type { LoginFormValues } from './schema';

export function useLogin() {
  const completeSignIn = useCompleteSignIn();

  return useMutation({
    mutationFn: (values: LoginFormValues) => loginRequest(values),
    onSuccess: completeSignIn,
  });
}

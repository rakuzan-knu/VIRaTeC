import { useMutation } from '@tanstack/react-query';
import { LoginRequestDto, AuthResponseDto } from '@viratec/contracts';
import { ApiError } from '@/shared';
import { useSessionStore } from '@/entities/session';
import { loginRequest } from '../api/login';

export function useLogin() {
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation<AuthResponseDto, ApiError, LoginRequestDto>({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setSession({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    },
  });
}

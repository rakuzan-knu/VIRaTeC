import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { fetchCurrentAccount, useSessionStore } from '@/entities/session';
import { verifyEmailRequest } from '../api/emailVerification';

const TOKEN_PARAM = 'token';

export type VerifyEmailStatus = 'missing' | 'pending' | 'success' | 'error';

export function useVerifyEmailToken() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [token] = useState(() => searchParams.get(TOKEN_PARAM));
  const hasStarted = useRef(false);
  const isSignedIn = useSessionStore((state) => state.user !== null);
  const setUser = useSessionStore((state) => state.setUser);

  const { mutate, isSuccess, isError, error } = useMutation({
    mutationFn: (value: string) => verifyEmailRequest({ token: value }),
    onSuccess: async () => {
      if (!isSignedIn) return;
      try {
        setUser(await fetchCurrentAccount());
      } catch {
        return;
      }
    },
  });

  useEffect(() => {
    if (!token || hasStarted.current) return;
    hasStarted.current = true;
    setSearchParams({}, { replace: true });
    mutate(token);
  }, [token, mutate, setSearchParams]);

  const status: VerifyEmailStatus = !token
    ? 'missing'
    : isSuccess
      ? 'success'
      : isError
        ? 'error'
        : 'pending';

  const retry = () => {
    if (token) mutate(token);
  };

  return { status, error, isSignedIn, retry };
}

import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { fetchCurrentAccount, forgetAccount, useSessionStore } from '@/entities/session';
import { confirmEmailChangeRequest, verifyEmailRequest } from '../api/emailVerification';

const TOKEN_PARAM = 'token';
const TYPE_PARAM = 'type';
const EMAIL_CHANGE_TYPE = 'email-change';

export type VerifyEmailStatus = 'missing' | 'pending' | 'success' | 'error';

export function useVerifyEmailToken() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [token] = useState(() => searchParams.get(TOKEN_PARAM));
  const [isEmailChange] = useState(() => searchParams.get(TYPE_PARAM) === EMAIL_CHANGE_TYPE);
  const hasStarted = useRef(false);
  const signedInEmail = useSessionStore((state) => state.user?.email ?? null);
  const isSignedIn = signedInEmail !== null;
  const setUser = useSessionStore((state) => state.setUser);

  const { mutate, isSuccess, isError, error } = useMutation({
    mutationFn: (value: string) =>
      isEmailChange
        ? confirmEmailChangeRequest({ token: value })
        : verifyEmailRequest({ token: value }),
    onSuccess: async () => {
      if (!isSignedIn) return;
      try {
        const account = await fetchCurrentAccount();
        if (signedInEmail !== account.email) forgetAccount(signedInEmail);
        setUser(account);
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

  return { status, error, isSignedIn, isEmailChange, retry };
}

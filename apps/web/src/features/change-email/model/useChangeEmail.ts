import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import type { AccountDto } from '@viratec/contracts';
import { useSessionStore } from '@/entities/session';
import { ApiError, getApiErrorCode, NETWORK_ERROR_STATUS } from '@/shared/api/apiClient';
import { useCommonMessages } from '@/shared/i18n';
import { cancelEmailChange, requestEmailChange } from '../api/changeEmail';
import { useChangeEmailMessages, type ChangeEmailMessages } from './messages';
import { createChangeEmailSchema, type ChangeEmailFormValues } from './schema';

const EMPTY_FORM: ChangeEmailFormValues = { newEmail: '', password: '', code: '' };

const getServerError = (
  error: Error | null,
  errors: ChangeEmailMessages['errors'],
  networkError: string,
) => {
  if (!error) return null;
  switch (getApiErrorCode(error)) {
    case 'EMAIL_UNCHANGED':
      return errors.unchanged;
    case 'EMAIL_TAKEN':
      return errors.taken;
    case 'PASSWORD_INCORRECT':
      return errors.wrongPassword;
    case 'TWO_FACTOR_REQUIRED':
    case 'TWO_FACTOR_INVALID':
      return errors.wrongCode;
    case 'GOOGLE_REAUTH_REQUIRED':
      return errors.googleRetry;
    case 'EMAIL_UNAVAILABLE':
      return errors.unavailable;
  }
  if (!(error instanceof ApiError)) return errors.unexpected;
  if (error.status === 429) return errors.tooMany;
  if (error.status === NETWORK_ERROR_STATUS) return networkError;
  return errors.unexpected;
};

export function useChangeEmail(account: AccountDto) {
  const t = useChangeEmailMessages();
  const common = useCommonMessages();
  const setUser = useSessionStore((state) => state.setUser);
  const [googleCredential, setGoogleCredential] = useState<string | null>(null);
  const [isGoogleMissing, setIsGoogleMissing] = useState(false);
  const { hasPassword, twoFactorEnabled } = account;
  const schema = useMemo(
    () => createChangeEmailSchema(t.validation, { hasPassword, twoFactorEnabled }),
    [t, hasPassword, twoFactorEnabled],
  );

  const form = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_FORM,
  });

  const request = useMutation({
    mutationFn: requestEmailChange,
    onSuccess: (updated) => {
      setUser(updated);
      setGoogleCredential(null);
      form.reset(EMPTY_FORM);
    },
    onError: () => setGoogleCredential(null),
  });

  const cancel = useMutation({
    mutationFn: cancelEmailChange,
    onSuccess: setUser,
  });

  const submit = form.handleSubmit(({ newEmail, password, code }) => {
    if (!hasPassword && !googleCredential) {
      setIsGoogleMissing(true);
      return;
    }
    request.mutate({
      newEmail,
      password: hasPassword ? password : undefined,
      code: twoFactorEnabled ? code : undefined,
      googleCredential: googleCredential ?? undefined,
    });
  });

  const confirmWithGoogle = (credential: string) => {
    setIsGoogleMissing(false);
    setGoogleCredential(credential);
  };

  const serverError =
    (isGoogleMissing ? t.errors.googleRequired : null) ??
    getServerError(request.error ?? cancel.error, t.errors, common.networkError);

  return {
    register: form.register,
    errors: form.formState.errors,
    submit,
    confirmWithGoogle,
    isGoogleConfirmed: googleCredential !== null,
    isSubmitting: request.isPending,
    cancelChange: () => cancel.mutate(),
    isCancelling: cancel.isPending,
    serverError,
  };
}

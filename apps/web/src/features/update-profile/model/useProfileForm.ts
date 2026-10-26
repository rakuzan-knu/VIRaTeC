import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AccountDto } from '@viratec/contracts';
import { ApiError, NETWORK_ERROR_STATUS } from '@/shared/api/apiClient';
import { useCommonMessages } from '@/shared/i18n';
import { useProfileFormMessages } from './messages';
import {
  createProfileFormSchema,
  toProfileFormValues,
  toUpdateProfileRequest,
  type ProfileFormValues,
} from './schema';
import { useUpdateProfile } from './useUpdateProfile';

export function useProfileForm(account: AccountDto) {
  const t = useProfileFormMessages();
  const common = useCommonMessages();
  const schema = useMemo(() => createProfileFormSchema(t.validation), [t]);
  const { mutate: save, isPending, isSuccess, error, reset: resetMutation } = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toProfileFormValues(account),
  });

  const serverError =
    error instanceof ApiError && error.status === NETWORK_ERROR_STATUS
      ? common.networkError
      : error
        ? t.unexpectedError
        : null;

  const submit = form.handleSubmit((values) =>
    save(toUpdateProfileRequest(values), {
      onSuccess: (updated) => form.reset(toProfileFormValues(updated)),
    }),
  );

  const clearSuccess = () => {
    if (isSuccess) resetMutation();
  };

  return {
    control: form.control,
    register: form.register,
    isDirty: form.formState.isDirty,
    errors: form.formState.errors,
    submit,
    clearSuccess,
    serverError,
    isPending,
    isSuccess,
  };
}

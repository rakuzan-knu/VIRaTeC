import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { ApiError, NETWORK_ERROR_STATUS } from '@/shared/api/apiClient';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { Input } from '@/shared/ui/Input';
import { useDeleteAccount } from '../model/useDeleteAccount';

const DELETE_ACCOUNT_MESSAGES = defineMessages({
  en: {
    description:
      'This permanently removes your profile together with the projects, papers and community posts you created. This cannot be undone.',
    start: 'Delete account…',
    confirmLabel: (email: string) => `Type ${email} to confirm`,
    password: 'Your password',
    submit: 'Delete permanently',
    cancel: 'Cancel',
    wrongPassword: 'The password is incorrect.',
    mismatch: 'The email does not match your account.',
    unexpectedError: 'Could not delete the account. Please try again.',
  },
  uk: {
    description:
      'Це назавжди видалить ваш профіль разом зі створеними проєктами, публікаціями та дописами в спільноті. Цю дію неможливо скасувати.',
    start: 'Видалити обліковий запис…',
    confirmLabel: (email: string) => `Введіть ${email} для підтвердження`,
    password: 'Ваш пароль',
    submit: 'Видалити назавжди',
    cancel: 'Скасувати',
    wrongPassword: 'Неправильний пароль.',
    mismatch: 'Адреса не збігається з вашим обліковим записом.',
    unexpectedError: 'Не вдалося видалити обліковий запис. Спробуйте ще раз.',
  },
});

const DANGER_BUTTON_CLASS =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-control border border-state-error/60 px-5 py-3 text-control-md font-medium text-state-error transition-colors hover:bg-state-error/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-state-error disabled:cursor-not-allowed disabled:opacity-50';

interface DeleteAccountFormProps {
  email: string;
  hasPassword: boolean;
}

export function DeleteAccountForm({ email, hasPassword }: DeleteAccountFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [password, setPassword] = useState('');
  const t = useLocalized(DELETE_ACCOUNT_MESSAGES);
  const common = useCommonMessages();
  const { mutate: deleteAccount, isPending, error, reset } = useDeleteAccount(email);

  const isConfirmed = confirmation.trim().toLowerCase() === email.toLowerCase();
  const canSubmit = isConfirmed && (!hasPassword || password !== '') && !isPending;

  const serverError = !error
    ? null
    : error instanceof ApiError && error.status === 403
      ? t.wrongPassword
      : error instanceof ApiError && error.status === 400
        ? t.mismatch
        : error instanceof ApiError && error.status === NETWORK_ERROR_STATUS
          ? common.networkError
          : t.unexpectedError;

  const close = () => {
    setIsOpen(false);
    setConfirmation('');
    setPassword('');
    reset();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    deleteAccount({
      confirmation: confirmation.trim(),
      password: hasPassword ? password : undefined,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[15px] leading-6 text-viratec-muted">{t.description}</p>

      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(DANGER_BUTTON_CLASS, 'self-start')}
        >
          <Trash2 aria-hidden="true" className="size-[18px]" />
          {t.start}
        </button>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <Input
            label={t.confirmLabel(email)}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            autoFocus
          />
          {hasPassword && (
            <Input
              label={t.password}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          )}

          {serverError && (
            <p role="alert" className="text-sm text-state-error">
              {serverError}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={!canSubmit}
              aria-busy={isPending || undefined}
              className={DANGER_BUTTON_CLASS}
            >
              <Trash2 aria-hidden="true" className="size-[18px]" />
              {t.submit}
            </button>
            <button
              type="button"
              onClick={close}
              className="cursor-pointer rounded-control px-5 py-3 text-control-md font-medium text-viratec-muted transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

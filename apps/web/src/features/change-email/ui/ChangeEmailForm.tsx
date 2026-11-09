import type { AccountDto } from '@viratec/contracts';
import { Button } from '@/shared/ui/Button';
import { GoogleReauth } from '@/shared/ui/google-reauth';
import { Input } from '@/shared/ui/Input';
import { useChangeEmailMessages } from '../model/messages';
import { useChangeEmail } from '../model/useChangeEmail';

interface ChangeEmailFormProps {
  account: AccountDto;
}

export function ChangeEmailForm({ account }: ChangeEmailFormProps) {
  const t = useChangeEmailMessages();
  const {
    register,
    errors,
    submit,
    confirmWithGoogle,
    isGoogleConfirmed,
    isSubmitting,
    cancelChange,
    isCancelling,
    serverError,
  } = useChangeEmail(account);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[15px] leading-6 break-all text-viratec-muted">
        {t.current(account.email)}
      </p>
      {account.pendingEmail && (
        <div className="flex flex-col gap-3 rounded-[18px] border border-white/10 bg-white/3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p role="status" className="min-w-0 text-sm leading-5 break-words text-viratec-soft">
            {t.pending(account.pendingEmail)}
          </p>
          <button
            type="button"
            onClick={cancelChange}
            disabled={isCancelling}
            className="shrink-0 cursor-pointer self-start text-sm font-medium text-viratec-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
          >
            {t.cancel}
          </button>
        </div>
      )}
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <Input
          label={t.newEmail}
          type="email"
          autoComplete="email"
          error={errors.newEmail?.message}
          {...register('newEmail')}
        />
        {account.hasPassword ? (
          <Input
            label={t.password}
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
        ) : (
          <GoogleReauth
            label={t.googleLabel}
            confirmedLabel={t.googleConfirmed}
            unavailableLabel={t.googleUnavailable}
            isConfirmed={isGoogleConfirmed}
            onCredential={confirmWithGoogle}
          />
        )}
        {account.twoFactorEnabled && (
          <Input
            label={t.code}
            autoComplete="one-time-code"
            spellCheck={false}
            error={errors.code?.message}
            {...register('code')}
          />
        )}
        {serverError && (
          <p role="alert" className="text-sm text-state-error">
            {serverError}
          </p>
        )}
        <Button type="submit" label={t.submit} loading={isSubmitting} className="sm:self-start" />
      </form>
    </div>
  );
}

import { useId, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { ApiError, NETWORK_ERROR_STATUS } from '@/shared/api/apiClient';
import { useSessionStore } from '@/entities/session';
import { Input } from '@/shared/ui/auth-input';
import { Button } from '@/shared/ui/auth-button';
import { useVerifySecondFactor } from '../model/useVerifySecondFactor';

const MESSAGES = defineMessages({
  en: {
    title: 'Two-step verification',
    subtitle: 'Enter the 6-digit code from Google Authenticator or your authenticator app.',
    backupSubtitle:
      'Enter one of the backup codes you saved when you enabled two-step verification.',
    codeLabel: 'Verification code',
    backupLabel: 'Backup code',
    submit: 'Verify and sign in',
    useBackup: 'Use a backup code instead',
    useApp: 'Use the authenticator app instead',
    back: 'Back to sign in',
    invalid: 'The code is incorrect or has expired. Try the newest code.',
    tooMany: 'Too many attempts. Wait a few minutes and sign in again.',
    expired: 'This sign-in attempt has expired. Sign in again.',
    unexpected: 'Something went wrong. Please try again.',
  },
  uk: {
    title: 'Двоетапна перевірка',
    subtitle:
      'Введіть 6-значний код із Google Authenticator або іншого застосунку-автентифікатора.',
    backupSubtitle:
      'Введіть один із резервних кодів, які ви зберегли під час увімкнення двоетапної перевірки.',
    codeLabel: 'Код підтвердження',
    backupLabel: 'Резервний код',
    submit: 'Підтвердити та увійти',
    useBackup: 'Використати резервний код',
    useApp: 'Використати застосунок-автентифікатор',
    back: 'Повернутися до входу',
    invalid: 'Код неправильний або застарів. Спробуйте найновіший код.',
    tooMany: 'Забагато спроб. Зачекайте кілька хвилин і увійдіть знову.',
    expired: 'Ця спроба входу застаріла. Увійдіть знову.',
    unexpected: 'Щось пішло не так. Спробуйте ще раз.',
  },
});

type Messages = (typeof MESSAGES)['en'];

const getErrorMessage = (error: Error | null, t: Messages, networkError: string) => {
  if (!error) return null;
  if (!(error instanceof ApiError)) return t.unexpected;
  if (error.status === NETWORK_ERROR_STATUS) return networkError;
  if (error.status === 429) return t.tooMany;
  if (error.status === 401) return /expired/i.test(error.message) ? t.expired : t.invalid;
  return error.message || t.unexpected;
};

export function TwoFactorChallenge() {
  const t = useLocalized(MESSAGES);
  const common = useCommonMessages();
  const inputId = useId();
  const errorId = useId();
  const [code, setCode] = useState('');
  const [useBackup, setUseBackup] = useState(false);
  const cancelSecondFactor = useSessionStore((state) => state.cancelSecondFactor);
  const { mutate: verify, isPending, error, reset } = useVerifySecondFactor();
  const errorMessage = getErrorMessage(error, t, common.networkError);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.trim()) verify(code.trim());
  };

  const switchMode = () => {
    setUseBackup((value) => !value);
    setCode('');
    reset();
  };

  return (
    <div className="w-full space-y-5">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-auth-navy/8 text-auth-navy">
        <ShieldCheck aria-hidden="true" className="size-7" />
      </span>

      <div className="space-y-2">
        <h2 className="text-[34px] leading-[1.05] font-medium tracking-[-0.045em] text-auth-heading lg:text-[clamp(32px,5svh,44px)]">
          {t.title}
        </h2>
        <p className="text-sm text-auth-muted">{useBackup ? t.backupSubtitle : t.subtitle}</p>
      </div>

      {errorMessage && (
        <div
          id={errorId}
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-auth-error"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        <div className="space-y-1.5">
          <label htmlFor={inputId} className="text-xs font-medium text-auth-label">
            {useBackup ? t.backupLabel : t.codeLabel}
          </label>
          <Input
            id={inputId}
            value={code}
            onChange={(event) =>
              setCode(
                useBackup
                  ? event.target.value.toUpperCase().slice(0, 11)
                  : event.target.value.replace(/\D/g, '').slice(0, 6),
              )
            }
            inputMode={useBackup ? 'text' : 'numeric'}
            autoComplete="one-time-code"
            autoFocus
            spellCheck={false}
            placeholder={useBackup ? 'XXXXX-XXXXX' : '000000'}
            error={Boolean(errorMessage)}
            aria-describedby={errorMessage ? errorId : undefined}
            className="h-[58px] text-center font-mono text-2xl tracking-[0.4em]"
          />
        </div>

        <Button
          type="submit"
          isLoading={isPending}
          disabled={isPending || (useBackup ? code.length < 10 : code.length !== 6)}
          className="h-[58px] justify-between rounded-[9px] bg-auth-navy px-5 hover:bg-auth-navy-hover"
        >
          {t.submit}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </form>

      <div className="flex flex-col items-start gap-3 text-xs">
        <button
          type="button"
          onClick={switchMode}
          className="font-medium text-auth-navy hover:underline"
        >
          {useBackup ? t.useApp : t.useBackup}
        </button>
        <button
          type="button"
          onClick={cancelSecondFactor}
          className="inline-flex items-center gap-1.5 text-auth-muted hover:text-auth-navy"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          {t.back}
        </button>
      </div>
    </div>
  );
}

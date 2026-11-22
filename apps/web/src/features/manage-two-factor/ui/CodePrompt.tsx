import { useState, type FormEvent } from 'react';
import { ApiError, NETWORK_ERROR_STATUS } from '@/shared/api/apiClient';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

const MESSAGES = defineMessages({
  en: {
    label: 'Code from your authenticator app or a backup code',
    invalid: 'The code is incorrect or has expired.',
    tooMany: 'Too many attempts. Wait a few minutes and try again.',
    unexpected: 'Something went wrong. Please try again.',
    cancel: 'Cancel',
  },
  uk: {
    label: 'Код із застосунку-автентифікатора або резервний код',
    invalid: 'Код неправильний або застарів.',
    tooMany: 'Забагато спроб. Зачекайте кілька хвилин і спробуйте знову.',
    unexpected: 'Щось пішло не так. Спробуйте ще раз.',
    cancel: 'Скасувати',
  },
  de: {
    label: 'Code aus Ihrer Authenticator-App oder ein Backup-Code',
    invalid: 'Der Code ist falsch oder abgelaufen.',
    tooMany: 'Zu viele Versuche. Warten Sie einige Minuten und versuchen Sie es erneut.',
    unexpected: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    cancel: 'Abbrechen',
  },
  fr: {
    label: 'Code de votre application d’authentification ou code de secours',
    invalid: 'Le code est incorrect ou a expiré.',
    tooMany: 'Trop de tentatives. Attendez quelques minutes et réessayez.',
    unexpected: 'Une erreur s’est produite. Veuillez réessayer.',
    cancel: 'Annuler',
  },
  ar: {
    label: 'الرمز من تطبيق المصادقة أو رمز احتياطي',
    invalid: 'الرمز غير صحيح أو انتهت صلاحيته.',
    tooMany: 'محاولات كثيرة جدًا. انتظر بضع دقائق ثم حاول مرة أخرى.',
    unexpected: 'حدث خطأ ما. يُرجى المحاولة مرة أخرى.',
    cancel: 'إلغاء',
  },
});

export function useCodeErrorMessage(error: Error | null) {
  const t = useLocalized(MESSAGES);
  const common = useCommonMessages();
  if (!error) return undefined;
  if (!(error instanceof ApiError)) return t.unexpected;
  if (error.status === NETWORK_ERROR_STATUS) return common.networkError;
  if (error.status === 429) return t.tooMany;
  if (error.status === 400 || error.status === 401) return t.invalid;
  return error.message || t.unexpected;
}

interface CodePromptProps {
  submitLabel: string;
  onSubmit: (code: string) => void;
  onCancel?: () => void;
  isPending: boolean;
  error: Error | null;
  label?: string;
  numericOnly?: boolean;
}

export function CodePrompt({
  submitLabel,
  onSubmit,
  onCancel,
  isPending,
  error,
  label,
  numericOnly = false,
}: CodePromptProps) {
  const t = useLocalized(MESSAGES);
  const [code, setCode] = useState('');
  const errorMessage = useCodeErrorMessage(error);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.trim()) onSubmit(code.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label={label ?? t.label}
        value={code}
        onChange={(event) =>
          setCode(
            numericOnly
              ? event.target.value.replace(/\D/g, '').slice(0, 6)
              : event.target.value.slice(0, 11),
          )
        }
        inputMode={numericOnly ? 'numeric' : 'text'}
        autoComplete="one-time-code"
        autoFocus
        data-autofocus
        spellCheck={false}
        placeholder={numericOnly ? '000000' : '000000 / XXXXX-XXXXX'}
        error={errorMessage}
        className="font-mono text-lg tracking-[0.2em]"
      />
      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          label={submitLabel}
          loading={isPending}
          disabled={numericOnly ? code.length !== 6 : code.length < 6}
        />
        {onCancel && <Button variant="secondary" label={t.cancel} onClick={onCancel} />}
      </div>
    </form>
  );
}

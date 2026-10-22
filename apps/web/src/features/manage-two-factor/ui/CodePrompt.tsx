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

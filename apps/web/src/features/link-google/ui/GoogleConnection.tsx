import { useRef } from 'react';
import { ApiError, NETWORK_ERROR_STATUS } from '@/shared/api/apiClient';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { useGoogleButton } from '@/shared/lib/googleIdentity';
import { useLinkGoogle, useUnlinkGoogle } from '../model/useGoogleLink';

const GOOGLE_CONNECTION_MESSAGES = defineMessages({
  en: {
    connectHint: 'Connect Google to sign in with one click. Your email sign-in keeps working.',
    disconnect: 'Disconnect',
    disconnectBlocked: 'Set a password below before disconnecting Google.',
    connected: 'Google account connected.',
    disconnected: 'Google account disconnected.',
    alreadyUsed: 'This Google account is already connected to another VIRaTeC account.',
    invalidCredential: 'We could not verify your Google account. Please try again.',
    unavailable: 'Connecting Google is temporarily unavailable.',
    loadFailed: 'Google could not be loaded. Please try again later.',
    unexpectedError: 'Something went wrong. Please try again.',
  },
  uk: {
    connectHint:
      'Підключіть Google, щоб входити в один клік. Вхід за електронною поштою продовжить працювати.',
    disconnect: 'Відключити',
    disconnectBlocked: 'Щоб відключити Google, спершу встановіть пароль нижче.',
    connected: 'Обліковий запис Google підключено.',
    disconnected: 'Обліковий запис Google відключено.',
    alreadyUsed: 'Цей обліковий запис Google уже підключено до іншого облікового запису VIRaTeC.',
    invalidCredential: 'Не вдалося підтвердити ваш обліковий запис Google. Спробуйте ще раз.',
    unavailable: 'Підключення Google тимчасово недоступне.',
    loadFailed: 'Не вдалося завантажити Google. Спробуйте пізніше.',
    unexpectedError: 'Щось пішло не так. Спробуйте ще раз.',
  },
});

type GoogleConnectionMessages = (typeof GOOGLE_CONNECTION_MESSAGES)['en'];

const getErrorMessage = (
  error: Error | null,
  t: GoogleConnectionMessages,
  networkError: string,
  invalidRequestMessage: string,
): string | null => {
  if (!error) return null;
  if (!(error instanceof ApiError)) return t.unexpectedError;
  if (error.status === NETWORK_ERROR_STATUS) return networkError;
  if (error.status === 409) return t.alreadyUsed;
  if (error.status === 400) return invalidRequestMessage;
  if (error.status === 503) return t.unavailable;
  return t.unexpectedError;
};

interface GoogleConnectionProps {
  hasGoogle: boolean;
  hasPassword: boolean;
}

export function GoogleConnection({ hasGoogle, hasPassword }: GoogleConnectionProps) {
  const t = useLocalized(GOOGLE_CONNECTION_MESSAGES);
  const common = useCommonMessages();
  const link = useLinkGoogle();
  const unlink = useUnlinkGoogle();
  const errorMessage =
    getErrorMessage(link.error, t, common.networkError, t.invalidCredential) ??
    getErrorMessage(unlink.error, t, common.networkError, t.disconnectBlocked);
  const status =
    link.isSuccess && hasGoogle
      ? t.connected
      : unlink.isSuccess && !hasGoogle
        ? t.disconnected
        : '';

  return (
    <div className="flex flex-col gap-3">
      {hasGoogle ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <button
            type="button"
            onClick={() => {
              link.reset();
              unlink.mutate();
            }}
            disabled={!hasPassword || unlink.isPending}
            className="cursor-pointer self-start rounded-full border border-white/22 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.disconnect}
          </button>
          {!hasPassword && <p className="text-sm text-viratec-subtle">{t.disconnectBlocked}</p>}
        </div>
      ) : (
        <GoogleConnectButton
          hint={t.connectHint}
          loadFailedMessage={t.loadFailed}
          unavailableMessage={t.unavailable}
          isPending={link.isPending}
          onCredential={(credential) => {
            unlink.reset();
            link.mutate(credential);
          }}
        />
      )}
      {errorMessage && (
        <p role="alert" className="text-sm text-state-error">
          {errorMessage}
        </p>
      )}
      <p role="status" className="text-sm text-viratec-accent empty:hidden">
        {status}
      </p>
    </div>
  );
}

interface GoogleConnectButtonProps {
  hint: string;
  loadFailedMessage: string;
  unavailableMessage: string;
  isPending: boolean;
  onCredential: (credential: string) => void;
}

function GoogleConnectButton({
  hint,
  loadFailedMessage,
  unavailableMessage,
  isPending,
  onCredential,
}: GoogleConnectButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isConfigured, loadFailed } = useGoogleButton(containerRef, {
    text: 'continue_with',
    onCredential,
  });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm leading-5 text-viratec-muted">{hint}</p>
      {isConfigured ? (
        <div
          aria-busy={isPending || undefined}
          className={cn(
            'w-full max-w-[320px] transition-opacity',
            isPending && 'pointer-events-none opacity-60',
          )}
        >
          <div ref={containerRef} className="flex min-h-10 w-full" />
        </div>
      ) : (
        <p className="text-sm text-viratec-subtle">{unavailableMessage}</p>
      )}
      {loadFailed && <p className="text-sm text-state-error">{loadFailedMessage}</p>}
    </div>
  );
}

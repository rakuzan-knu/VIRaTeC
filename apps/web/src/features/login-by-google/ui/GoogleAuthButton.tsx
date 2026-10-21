import { useEffect, useRef, useState } from 'react';
import { ENV } from '@/shared/config/env';
import { ApiError } from '@/shared/api/apiClient';
import { cn } from '@/shared/lib';
import {
  defineMessages,
  INTL_LOCALE,
  useCommonMessages,
  useLocale,
  useLocalized,
} from '@/shared/i18n';
import { Button } from '@/shared/ui/auth-button';
import { GoogleIcon } from '@/shared/ui/google-icon';
import { loadGoogleIdentity, type GoogleButtonText } from '../lib/googleIdentity';
import { useGoogleAuth } from '../model/useGoogleAuth';

const GOOGLE_BUTTON_MAX_WIDTH = 400;

const GOOGLE_AUTH_MESSAGES = defineMessages({
  en: {
    loadFailed: 'Google sign-in could not be loaded. Please try again later.',
    invalidCredential: 'We could not verify your Google account. Please try again.',
    notConfigured: 'Google sign-in is temporarily unavailable.',
    unexpectedError: 'An unexpected error occurred. Please try again later.',
  },
  uk: {
    loadFailed: 'Не вдалося завантажити вхід через Google. Спробуйте пізніше.',
    invalidCredential: 'Не вдалося підтвердити ваш обліковий запис Google. Спробуйте ще раз.',
    notConfigured: 'Вхід через Google тимчасово недоступний.',
    unexpectedError: 'Сталася неочікувана помилка. Спробуйте пізніше.',
  },
});

type GoogleAuthMessages = (typeof GOOGLE_AUTH_MESSAGES)['en'];

const getErrorMessage = (error: Error | null, t: GoogleAuthMessages) => {
  if (!error) return null;
  if (error instanceof ApiError && error.status === 401) return t.invalidCredential;
  if (error instanceof ApiError && error.status === 503) return t.notConfigured;
  return error.message || t.unexpectedError;
};

interface GoogleAuthButtonProps {
  text: GoogleButtonText;
  className?: string;
}

export function GoogleAuthButton({ text, className }: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const { mutate: authenticate, isPending, error } = useGoogleAuth();
  const authenticateRef = useRef(authenticate);
  const locale = useLocale();
  const t = useLocalized(GOOGLE_AUTH_MESSAGES);
  const common = useCommonMessages();

  useEffect(() => {
    authenticateRef.current = authenticate;
  }, [authenticate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!ENV.GOOGLE_CLIENT_ID || !container) return;
    let cancelled = false;

    loadGoogleIdentity()
      .then((googleId) => {
        if (cancelled) return;
        googleId.initialize({
          client_id: ENV.GOOGLE_CLIENT_ID,
          callback: ({ credential }) => authenticateRef.current(credential),
          ux_mode: 'popup',
          context: text === 'signup_with' ? 'signup' : 'signin',
        });
        container.replaceChildren();
        googleId.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          logo_alignment: 'center',
          text,
          width: Math.min(container.clientWidth, GOOGLE_BUTTON_MAX_WIDTH),
          locale: INTL_LOCALE[locale],
        });
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [text, locale]);

  if (!ENV.GOOGLE_CLIENT_ID) {
    return (
      <Button
        variant="outline"
        type="button"
        disabled
        title={common.unavailable(common.googleSignIn)}
        className={cn('font-medium text-auth-navy', className)}
      >
        <GoogleIcon className="mr-1" />
        {common.continueWithGoogle}
        <span className="text-xs font-normal text-auth-muted">· {common.notAvailableYet}</span>
      </Button>
    );
  }

  const errorMessage = loadFailed ? t.loadFailed : getErrorMessage(error, t);

  return (
    <div className="space-y-2">
      <div
        aria-busy={isPending || undefined}
        className={cn(
          'flex w-full items-center justify-center transition-opacity',
          isPending && 'pointer-events-none opacity-60',
          className,
        )}
      >
        <div ref={containerRef} className="flex w-full justify-center" />
      </div>
      {errorMessage && (
        <p role="alert" className="text-center text-xs text-auth-error">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

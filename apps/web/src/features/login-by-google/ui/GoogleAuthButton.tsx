import { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { readAuthNavigationState } from '@/entities/session';
import { ApiError, getApiErrorCode, NETWORK_ERROR_STATUS } from '@/shared/api/apiClient';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { Button } from '@/shared/ui/auth-button';
import { GoogleIcon } from '@/shared/ui/google-icon';
import { useGoogleButton, type GoogleButtonText } from '@/shared/lib/googleIdentity';
import { useGoogleAuth } from '../model/useGoogleAuth';

const GOOGLE_AUTH_MESSAGES = defineMessages({
  en: {
    loadFailed: 'Google sign-in could not be loaded. Check your connection and try again.',
    loading: 'Loading Google sign-in…',
    signingIn: 'Signing in…',
    accountExists:
      'An account with this email already exists. Log in with your password, then connect Google in your account settings.',
    blocked: 'This account is blocked. Contact the VIRaTeC team for help.',
    sessionExpired:
      'Your sign-in session could not be verified. Allow site cookies, reload this page and try again.',
    rateLimited: 'Too many attempts. Please wait a moment and try again.',
    resetPassword: 'Reset password',
    invalidCredential: 'We could not verify your Google account. Please try again.',
    notConfigured: 'Google sign-in is temporarily unavailable.',
    unexpectedError: 'An unexpected error occurred. Please try again later.',
  },
  uk: {
    loadFailed:
      'Не вдалося завантажити вхід через Google. Перевірте з’єднання та спробуйте ще раз.',
    loading: 'Завантаження входу через Google…',
    signingIn: 'Входимо…',
    accountExists:
      'Обліковий запис із цією поштою вже існує. Увійдіть із паролем, а потім підключіть Google у налаштуваннях облікового запису.',
    blocked: 'Цей обліковий запис заблоковано. Зверніться до команди VIRaTeC по допомогу.',
    sessionExpired:
      'Не вдалося перевірити сеанс входу. Дозвольте cookie сайту, оновіть сторінку та спробуйте ще раз.',
    rateLimited: 'Забагато спроб. Зачекайте трохи та спробуйте ще раз.',
    resetPassword: 'Відновити пароль',
    invalidCredential: 'Не вдалося підтвердити ваш обліковий запис Google. Спробуйте ще раз.',
    notConfigured: 'Вхід через Google тимчасово недоступний.',
    unexpectedError: 'Сталася неочікувана помилка. Спробуйте пізніше.',
  },
});

type GoogleAuthMessages = (typeof GOOGLE_AUTH_MESSAGES)['en'];

const getErrorMessage = (error: Error | null, t: GoogleAuthMessages, networkError: string) => {
  if (!error) return null;
  if (error instanceof ApiError && error.status === NETWORK_ERROR_STATUS) return networkError;
  if (error instanceof ApiError && error.status === 401) return t.invalidCredential;
  if (error instanceof ApiError && error.status === 409) return t.accountExists;
  if (getApiErrorCode(error) === 'CSRF_INVALID') return t.sessionExpired;
  if (error instanceof ApiError && error.status === 403) return t.blocked;
  if (error instanceof ApiError && error.status === 429) return t.rateLimited;
  if (error instanceof ApiError && error.status === 503) return t.notConfigured;
  return t.unexpectedError;
};

interface GoogleAuthButtonProps {
  text: GoogleButtonText;
  className?: string;
}

export function GoogleAuthButton({ text, className }: GoogleAuthButtonProps) {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const { mutate: authenticate, isPending, error } = useGoogleAuth();
  const t = useLocalized(GOOGLE_AUTH_MESSAGES);
  const common = useCommonMessages();
  const { isConfigured, loadFailed, isLoading, retry } = useGoogleButton(containerRef, {
    text,
    onCredential: authenticate,
    disabled: isPending,
  });

  if (!isConfigured) {
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

  const errorMessage = loadFailed ? t.loadFailed : getErrorMessage(error, t, common.networkError);

  return (
    <div className="space-y-2">
      <div
        aria-busy={isPending || undefined}
        inert={isPending}
        className={cn(
          'flex w-full items-center justify-center transition-opacity',
          isPending && 'pointer-events-none opacity-60',
          className,
        )}
      >
        <div ref={containerRef} className="flex min-h-10 w-full justify-center" />
      </div>
      {(isLoading || isPending) && (
        <p role="status" className="text-center text-xs text-auth-muted">
          {isPending ? t.signingIn : t.loading}
        </p>
      )}
      {errorMessage && (
        <p role="alert" className="text-center text-xs text-auth-error">
          {errorMessage}
        </p>
      )}
      {loadFailed && (
        <Button variant="outline" type="button" onClick={retry}>
          {common.tryAgain}
        </Button>
      )}
      {!loadFailed && error instanceof ApiError && error.status === 409 && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-medium text-auth-navy">
          {location.pathname !== ROUTES.LOGIN && (
            <Link
              to={ROUTES.LOGIN}
              state={readAuthNavigationState(location.state)}
              className="underline"
            >
              {common.logIn}
            </Link>
          )}
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            state={readAuthNavigationState(location.state)}
            className="underline"
          >
            {t.resetPassword}
          </Link>
        </div>
      )}
    </div>
  );
}

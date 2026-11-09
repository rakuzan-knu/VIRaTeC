import { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { readAuthNavigationState } from '@/entities/session';
import { ApiError, getApiErrorCode, NETWORK_ERROR_STATUS } from '@/shared/api/apiClient';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { Button } from '@/shared/ui/auth-button';
import { Checkbox } from '@/shared/ui/checkbox';
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
    termsIntro:
      'This Google account is not linked to VIRaTeC yet. To create an account, accept the terms below.',
    agreePrefix: 'I am at least 16 or have a guardian’s consent, and I agree to the',
    agreeAnd: 'and',
    termsLink: 'Terms of Service',
    privacyLink: 'Privacy Policy',
    createAccount: 'Create account',
    back: 'Back',
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
    termsIntro:
      'Цей обліковий запис Google ще не пов’язаний із VIRaTeC. Щоб створити обліковий запис, прийміть умови нижче.',
    agreePrefix: 'Мені виповнилося 16 років або я маю згоду батьків чи опікуна, і я погоджуюся з',
    agreeAnd: 'та',
    termsLink: 'Умовами використання',
    privacyLink: 'Політикою конфіденційності',
    createAccount: 'Створити обліковий запис',
    back: 'Назад',
  },
  de: {
    loadFailed:
      'Die Google-Anmeldung konnte nicht geladen werden. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
    loading: 'Google-Anmeldung wird geladen…',
    signingIn: 'Anmeldung läuft…',
    accountExists:
      'Ein Konto mit dieser E-Mail existiert bereits. Melden Sie sich mit Ihrem Passwort an und verbinden Sie Google dann in Ihren Kontoeinstellungen.',
    blocked: 'Dieses Konto ist gesperrt. Wenden Sie sich an das VIRaTeC-Team.',
    sessionExpired:
      'Ihre Anmeldesitzung konnte nicht überprüft werden. Erlauben Sie Website-Cookies, laden Sie die Seite neu und versuchen Sie es erneut.',
    rateLimited: 'Zu viele Versuche. Bitte warten Sie einen Moment und versuchen Sie es erneut.',
    resetPassword: 'Passwort zurücksetzen',
    invalidCredential:
      'Wir konnten Ihr Google-Konto nicht verifizieren. Bitte versuchen Sie es erneut.',
    notConfigured: 'Die Google-Anmeldung ist vorübergehend nicht verfügbar.',
    unexpectedError:
      'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
    termsIntro:
      'Dieses Google-Konto ist noch nicht mit VIRaTeC verbunden. Um ein Konto zu erstellen, akzeptieren Sie bitte die folgenden Bedingungen.',
    agreePrefix:
      'Ich bin mindestens 16 Jahre alt oder habe die Zustimmung eines Erziehungsberechtigten und akzeptiere die',
    agreeAnd: 'und die',
    termsLink: 'Nutzungsbedingungen',
    privacyLink: 'Datenschutzerklärung',
    createAccount: 'Konto erstellen',
    back: 'Zurück',
  },
  fr: {
    loadFailed: 'La connexion Google n’a pas pu se charger. Vérifiez votre connexion et réessayez.',
    loading: 'Chargement de la connexion Google…',
    signingIn: 'Connexion…',
    accountExists:
      'Un compte avec cet e-mail existe déjà. Connectez-vous avec votre mot de passe, puis associez Google dans les paramètres de votre compte.',
    blocked: 'Ce compte est bloqué. Contactez l’équipe VIRaTeC pour obtenir de l’aide.',
    sessionExpired:
      'Votre session de connexion n’a pas pu être vérifiée. Autorisez les cookies du site, rechargez la page et réessayez.',
    rateLimited: 'Trop de tentatives. Patientez un instant et réessayez.',
    resetPassword: 'Réinitialiser le mot de passe',
    invalidCredential: 'Nous n’avons pas pu vérifier votre compte Google. Veuillez réessayer.',
    notConfigured: 'La connexion Google est temporairement indisponible.',
    unexpectedError: 'Une erreur inattendue s’est produite. Veuillez réessayer plus tard.',
    termsIntro:
      'Ce compte Google n’est pas encore associé à VIRaTeC. Pour créer un compte, acceptez les conditions ci-dessous.',
    agreePrefix: 'J’ai au moins 16 ans ou l’accord d’un parent ou tuteur, et j’accepte les',
    agreeAnd: 'et la',
    termsLink: 'Conditions d’utilisation',
    privacyLink: 'Politique de confidentialité',
    createAccount: 'Créer un compte',
    back: 'Retour',
  },
  ar: {
    loadFailed: 'تعذّر تحميل تسجيل الدخول عبر Google. تحقّق من اتصالك وحاول مرة أخرى.',
    loading: 'جارٍ تحميل تسجيل الدخول عبر Google…',
    signingIn: 'جارٍ تسجيل الدخول…',
    accountExists:
      'يوجد حساب بهذا البريد الإلكتروني بالفعل. سجّل الدخول بكلمة المرور، ثم اربط Google من إعدادات حسابك.',
    blocked: 'هذا الحساب محظور. تواصل مع فريق VIRaTeC للمساعدة.',
    sessionExpired:
      'تعذّر التحقق من جلسة تسجيل الدخول. اسمح بملفات تعريف الارتباط للموقع، وأعد تحميل الصفحة، ثم حاول مرة أخرى.',
    rateLimited: 'محاولات كثيرة جدًا. يُرجى الانتظار لحظة ثم المحاولة مرة أخرى.',
    resetPassword: 'إعادة تعيين كلمة المرور',
    invalidCredential: 'تعذّر علينا التحقق من حساب Google. يُرجى المحاولة مرة أخرى.',
    notConfigured: 'تسجيل الدخول عبر Google غير متاح مؤقتًا.',
    unexpectedError: 'حدث خطأ غير متوقع. يُرجى المحاولة لاحقًا.',
    termsIntro: 'حساب Google هذا غير مرتبط بـ VIRaTeC بعد. لإنشاء حساب، يُرجى قبول الشروط أدناه.',
    agreePrefix: 'عمري 16 عامًا على الأقل أو لدي موافقة ولي الأمر، وأوافق على',
    agreeAnd: 'و',
    termsLink: 'شروط الخدمة',
    privacyLink: 'سياسة الخصوصية',
    createAccount: 'إنشاء حساب',
    back: 'رجوع',
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
  const {
    authenticate,
    acceptTerms,
    cancelTerms,
    isAwaitingTerms,
    hasAgreed,
    setHasAgreed,
    isPending,
    error,
  } = useGoogleAuth();
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
        <GoogleIcon className="me-1" />
        {common.continueWithGoogle}
        <span className="text-xs font-normal text-auth-muted">· {common.notAvailableYet}</span>
      </Button>
    );
  }

  const errorMessage = loadFailed
    ? t.loadFailed
    : isAwaitingTerms
      ? null
      : getErrorMessage(error, t, common.networkError);

  return (
    <div className="space-y-2">
      <div
        aria-busy={isPending || undefined}
        inert={isPending}
        className={cn(
          'flex w-full items-center justify-center transition-opacity',
          isPending && 'pointer-events-none opacity-60',
          className,
          isAwaitingTerms && 'hidden',
        )}
      >
        <div ref={containerRef} className="flex min-h-10 w-full justify-center" />
      </div>
      {isAwaitingTerms && (
        <div className="space-y-3 rounded-lg border border-auth-border p-4">
          <p className="text-sm text-auth-muted">{t.termsIntro}</p>
          <label className="flex cursor-pointer items-start gap-2.5">
            <Checkbox
              checked={hasAgreed}
              onChange={(event) => setHasAgreed(event.target.checked)}
              autoFocus
              className="mt-px"
            />
            <span className="text-xs leading-5 text-auth-muted">
              {t.agreePrefix}{' '}
              <Link
                to={ROUTES.TERMS}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-auth-navy underline"
              >
                {t.termsLink}
              </Link>{' '}
              {t.agreeAnd}{' '}
              <Link
                to={ROUTES.PRIVACY}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-auth-navy underline"
              >
                {t.privacyLink}
              </Link>
              .
            </span>
          </label>
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button
              type="button"
              onClick={acceptTerms}
              disabled={!hasAgreed}
              isLoading={isPending}
              className="sm:w-auto sm:flex-1"
            >
              {t.createAccount}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={cancelTerms}
              disabled={isPending}
              className="sm:w-auto"
            >
              {t.back}
            </Button>
          </div>
        </div>
      )}
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

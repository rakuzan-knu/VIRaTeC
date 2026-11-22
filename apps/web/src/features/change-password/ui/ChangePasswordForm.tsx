import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { PROFILE_LIMITS } from '@viratec/contracts';
import { ApiError, NETWORK_ERROR_STATUS } from '@/shared/api/apiClient';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { createChangePasswordSchema, type ChangePasswordFormValues } from '../model/schema';
import { useChangePassword } from '../model/useChangePassword';

const CHANGE_PASSWORD_MESSAGES = defineMessages({
  en: {
    currentPassword: 'Current password',
    newPassword: 'New password',
    confirmPassword: 'Repeat new password',
    newPasswordHelper: `At least ${PROFILE_LIMITS.passwordMin} characters.`,
    setPasswordHint:
      'Your account uses Google sign-in. Set a password to also sign in with your email.',
    submitChange: 'Update password',
    submitSet: 'Set password',
    success: 'Password updated. Other devices have been signed out.',
    wrongPassword: 'The current password is incorrect.',
    tooMany: 'Too many attempts. Wait 15 minutes and try again.',
    unexpectedError: 'Could not update the password. Please try again.',
    validation: {
      currentRequired: 'Enter your current password',
      passwordMin: `Password must be at least ${PROFILE_LIMITS.passwordMin} characters`,
      passwordsMismatch: 'Passwords do not match',
      sameAsCurrent: 'The new password must differ from the current one',
    },
  },
  uk: {
    currentPassword: 'Поточний пароль',
    newPassword: 'Новий пароль',
    confirmPassword: 'Повторіть новий пароль',
    newPasswordHelper: `Щонайменше ${PROFILE_LIMITS.passwordMin} символів.`,
    setPasswordHint:
      'Ваш обліковий запис використовує вхід через Google. Встановіть пароль, щоб також входити за електронною поштою.',
    submitChange: 'Оновити пароль',
    submitSet: 'Встановити пароль',
    success: 'Пароль оновлено. На інших пристроях виконано вихід.',
    wrongPassword: 'Поточний пароль неправильний.',
    tooMany: 'Забагато спроб. Зачекайте 15 хвилин і спробуйте ще раз.',
    unexpectedError: 'Не вдалося оновити пароль. Спробуйте ще раз.',
    validation: {
      currentRequired: 'Введіть поточний пароль',
      passwordMin: `Пароль має містити щонайменше ${PROFILE_LIMITS.passwordMin} символів`,
      passwordsMismatch: 'Паролі не збігаються',
      sameAsCurrent: 'Новий пароль має відрізнятися від поточного',
    },
  },
  de: {
    currentPassword: 'Aktuelles Passwort',
    newPassword: 'Neues Passwort',
    confirmPassword: 'Neues Passwort wiederholen',
    newPasswordHelper: `Mindestens ${PROFILE_LIMITS.passwordMin} Zeichen.`,
    setPasswordHint:
      'Ihr Konto verwendet die Google-Anmeldung. Legen Sie ein Passwort fest, um sich auch mit Ihrer E-Mail anzumelden.',
    submitChange: 'Passwort aktualisieren',
    submitSet: 'Passwort festlegen',
    success: 'Passwort aktualisiert. Andere Geräte wurden abgemeldet.',
    wrongPassword: 'Das aktuelle Passwort ist falsch.',
    tooMany: 'Zu viele Versuche. Warten Sie 15 Minuten und versuchen Sie es erneut.',
    unexpectedError:
      'Das Passwort konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.',
    validation: {
      currentRequired: 'Geben Sie Ihr aktuelles Passwort ein',
      passwordMin: `Das Passwort muss mindestens ${PROFILE_LIMITS.passwordMin} Zeichen lang sein`,
      passwordsMismatch: 'Die Passwörter stimmen nicht überein',
      sameAsCurrent: 'Das neue Passwort muss sich vom aktuellen unterscheiden',
    },
  },
  fr: {
    currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Répétez le nouveau mot de passe',
    newPasswordHelper: `Au moins ${PROFILE_LIMITS.passwordMin} caractères.`,
    setPasswordHint:
      'Votre compte utilise la connexion Google. Définissez un mot de passe pour pouvoir aussi vous connecter avec votre e-mail.',
    submitChange: 'Mettre à jour le mot de passe',
    submitSet: 'Définir le mot de passe',
    success: 'Mot de passe mis à jour. Les autres appareils ont été déconnectés.',
    wrongPassword: 'Le mot de passe actuel est incorrect.',
    tooMany: 'Trop de tentatives. Attendez 15 minutes et réessayez.',
    unexpectedError: 'Impossible de mettre à jour le mot de passe. Veuillez réessayer.',
    validation: {
      currentRequired: 'Saisissez votre mot de passe actuel',
      passwordMin: `Le mot de passe doit comporter au moins ${PROFILE_LIMITS.passwordMin} caractères`,
      passwordsMismatch: 'Les mots de passe ne correspondent pas',
      sameAsCurrent: 'Le nouveau mot de passe doit être différent de l’actuel',
    },
  },
  ar: {
    currentPassword: 'كلمة المرور الحالية',
    newPassword: 'كلمة المرور الجديدة',
    confirmPassword: 'أعد إدخال كلمة المرور الجديدة',
    newPasswordHelper: `${PROFILE_LIMITS.passwordMin} أحرف على الأقل.`,
    setPasswordHint:
      'يستخدم حسابك تسجيل الدخول عبر Google. عيّن كلمة مرور لتتمكن أيضًا من تسجيل الدخول ببريدك الإلكتروني.',
    submitChange: 'تحديث كلمة المرور',
    submitSet: 'تعيين كلمة المرور',
    success: 'تم تحديث كلمة المرور. تم تسجيل الخروج من الأجهزة الأخرى.',
    wrongPassword: 'كلمة المرور الحالية غير صحيحة.',
    tooMany: 'محاولات كثيرة جدًا. انتظر 15 دقيقة ثم حاول مرة أخرى.',
    unexpectedError: 'تعذّر تحديث كلمة المرور. يُرجى المحاولة مرة أخرى.',
    validation: {
      currentRequired: 'أدخل كلمة المرور الحالية',
      passwordMin: `يجب ألا تقل كلمة المرور عن ${PROFILE_LIMITS.passwordMin} أحرف`,
      passwordsMismatch: 'كلمتا المرور غير متطابقتين',
      sameAsCurrent: 'يجب أن تختلف كلمة المرور الجديدة عن الحالية',
    },
  },
});

interface ChangePasswordFormProps {
  hasPassword: boolean;
}

export function ChangePasswordForm({ hasPassword }: ChangePasswordFormProps) {
  const [showPasswords, setShowPasswords] = useState(false);
  const t = useLocalized(CHANGE_PASSWORD_MESSAGES);
  const common = useCommonMessages();
  const schema = useMemo(
    () => createChangePasswordSchema(t.validation, hasPassword),
    [t, hasPassword],
  );
  const { mutate: changePassword, isPending, isSuccess, error } = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const serverError = !error
    ? null
    : error instanceof ApiError && error.status === 403
      ? t.wrongPassword
      : error instanceof ApiError && error.status === 429
        ? t.tooMany
        : error instanceof ApiError && error.status === NETWORK_ERROR_STATUS
          ? common.networkError
          : t.unexpectedError;

  const inputType = showPasswords ? 'text' : 'password';

  return (
    <form
      onSubmit={handleSubmit((values) => changePassword(values, { onSuccess: () => reset() }))}
      noValidate
      className="flex flex-col gap-5"
    >
      {!hasPassword && (
        <p className="text-[15px] leading-6 text-viratec-muted">{t.setPasswordHint}</p>
      )}

      {hasPassword && (
        <Input
          label={t.currentPassword}
          type={inputType}
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />
      )}
      <Input
        label={t.newPassword}
        type={inputType}
        autoComplete="new-password"
        helperText={t.newPasswordHelper}
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      <Input
        label={t.confirmPassword}
        type={inputType}
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <button
        type="button"
        onClick={() => setShowPasswords((value) => !value)}
        className="inline-flex cursor-pointer items-center gap-2 self-start rounded-md text-sm text-viratec-muted transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
      >
        {showPasswords ? (
          <EyeOff aria-hidden="true" className="size-4" />
        ) : (
          <Eye aria-hidden="true" className="size-4" />
        )}
        {showPasswords ? common.hidePassword : common.showPassword}
      </button>

      {serverError && (
        <p role="alert" className="text-sm text-state-error">
          {serverError}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          label={hasPassword ? t.submitChange : t.submitSet}
          loading={isPending}
          className="sm:self-start"
        />
        <p role="status" className="text-sm text-viratec-accent">
          {isSuccess ? t.success : ''}
        </p>
      </div>
    </form>
  );
}

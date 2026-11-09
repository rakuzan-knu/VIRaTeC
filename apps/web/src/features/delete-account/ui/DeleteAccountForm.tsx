import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { ApiError, getApiErrorCode, NETWORK_ERROR_STATUS } from '@/shared/api/apiClient';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { GoogleReauth } from '@/shared/ui/google-reauth';
import { Input } from '@/shared/ui/Input';
import { useDeleteAccount } from '../model/useDeleteAccount';

const DELETE_ACCOUNT_MESSAGES = defineMessages({
  en: {
    description:
      'This permanently removes your profile together with your papers and community posts. Projects you lead stay on the site without your name. This cannot be undone.',
    start: 'Delete account…',
    confirmLabel: (email: string) => `Type ${email} to confirm`,
    password: 'Your password',
    code: 'Two-step verification code',
    googleLabel: 'Confirm with Google',
    googleConfirmed: 'Google account confirmed.',
    googleUnavailable: 'Google confirmation is unavailable right now. Please try again later.',
    submit: 'Delete permanently',
    cancel: 'Cancel',
    wrongPassword: 'The password is incorrect.',
    wrongCode: 'The code is incorrect or expired.',
    googleRetry: 'Confirm with Google again.',
    lastOwner: 'You are the only owner. Transfer ownership before deleting this account.',
    tooMany: 'Too many attempts. Wait 15 minutes and try again.',
    mismatch: 'The email does not match your account.',
    unexpectedError: 'Could not delete the account. Please try again.',
  },
  uk: {
    description:
      'Це назавжди видалить ваш профіль разом із публікаціями та дописами в спільноті. Проєкти, які ви очолюєте, залишаться на сайті без вашого імені. Цю дію неможливо скасувати.',
    start: 'Видалити обліковий запис…',
    confirmLabel: (email: string) => `Введіть ${email} для підтвердження`,
    password: 'Ваш пароль',
    code: 'Код двоетапної перевірки',
    googleLabel: 'Підтвердьте через Google',
    googleConfirmed: 'Обліковий запис Google підтверджено.',
    googleUnavailable: 'Підтвердження через Google зараз недоступне. Спробуйте пізніше.',
    submit: 'Видалити назавжди',
    cancel: 'Скасувати',
    wrongPassword: 'Неправильний пароль.',
    wrongCode: 'Код неправильний або застарів.',
    googleRetry: 'Підтвердьте через Google ще раз.',
    lastOwner: 'Ви єдиний власник. Передайте права власника перед видаленням облікового запису.',
    tooMany: 'Забагато спроб. Зачекайте 15 хвилин і спробуйте ще раз.',
    mismatch: 'Адреса не збігається з вашим обліковим записом.',
    unexpectedError: 'Не вдалося видалити обліковий запис. Спробуйте ще раз.',
  },
  de: {
    description:
      'Dadurch werden Ihr Profil sowie Ihre Arbeiten und Community-Beiträge dauerhaft entfernt. Von Ihnen geleitete Projekte bleiben ohne Ihren Namen auf der Website. Dies kann nicht rückgängig gemacht werden.',
    start: 'Konto löschen…',
    confirmLabel: (email: string) => `Geben Sie ${email} zur Bestätigung ein`,
    password: 'Ihr Passwort',
    code: 'Code der zweistufigen Bestätigung',
    googleLabel: 'Mit Google bestätigen',
    googleConfirmed: 'Google-Konto bestätigt.',
    googleUnavailable:
      'Die Bestätigung mit Google ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut.',
    submit: 'Endgültig löschen',
    cancel: 'Abbrechen',
    wrongPassword: 'Das Passwort ist falsch.',
    wrongCode: 'Der Code ist falsch oder abgelaufen.',
    googleRetry: 'Bestätigen Sie erneut mit Google.',
    lastOwner: 'Sie sind der einzige Inhaber. Übertragen Sie die Inhaberschaft vor dem Löschen.',
    tooMany: 'Zu viele Versuche. Warten Sie 15 Minuten und versuchen Sie es erneut.',
    mismatch: 'Die E-Mail stimmt nicht mit Ihrem Konto überein.',
    unexpectedError: 'Das Konto konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.',
  },
  fr: {
    description:
      'Cette action supprime définitivement votre profil ainsi que vos articles et publications de la communauté. Les projets que vous dirigez restent sur le site sans votre nom. Elle est irréversible.',
    start: 'Supprimer le compte…',
    confirmLabel: (email: string) => `Saisissez ${email} pour confirmer`,
    password: 'Votre mot de passe',
    code: 'Code de vérification en deux étapes',
    googleLabel: 'Confirmer avec Google',
    googleConfirmed: 'Compte Google confirmé.',
    googleUnavailable:
      'La confirmation avec Google est indisponible pour le moment. Veuillez réessayer plus tard.',
    submit: 'Supprimer définitivement',
    cancel: 'Annuler',
    wrongPassword: 'Le mot de passe est incorrect.',
    wrongCode: 'Le code est incorrect ou expiré.',
    googleRetry: 'Confirmez de nouveau avec Google.',
    lastOwner:
      'Vous êtes le seul propriétaire. Transférez la propriété avant de supprimer ce compte.',
    tooMany: 'Trop de tentatives. Attendez 15 minutes et réessayez.',
    mismatch: 'L’e-mail ne correspond pas à votre compte.',
    unexpectedError: 'Impossible de supprimer le compte. Veuillez réessayer.',
  },
  ar: {
    description:
      'يؤدي هذا إلى إزالة ملفك الشخصي نهائيًا مع أوراقك ومنشوراتك في المجتمع. تبقى المشاريع التي تقودها على الموقع دون اسمك. لا يمكن التراجع عن ذلك.',
    start: 'حذف الحساب…',
    confirmLabel: (email: string) => `اكتب ${email} للتأكيد`,
    password: 'كلمة المرور',
    code: 'رمز التحقق بخطوتين',
    googleLabel: 'التأكيد عبر Google',
    googleConfirmed: 'تم تأكيد حساب Google.',
    googleUnavailable: 'التأكيد عبر Google غير متاح حاليًا. يُرجى المحاولة لاحقًا.',
    submit: 'حذف نهائي',
    cancel: 'إلغاء',
    wrongPassword: 'كلمة المرور غير صحيحة.',
    wrongCode: 'الرمز غير صحيح أو منتهي الصلاحية.',
    googleRetry: 'أكّد عبر Google مرة أخرى.',
    lastOwner: 'أنت المالك الوحيد. انقل الملكية قبل حذف هذا الحساب.',
    tooMany: 'محاولات كثيرة جدًا. انتظر 15 دقيقة ثم حاول مرة أخرى.',
    mismatch: 'البريد الإلكتروني لا يطابق حسابك.',
    unexpectedError: 'تعذّر حذف الحساب. يُرجى المحاولة مرة أخرى.',
  },
});

type DeleteAccountMessages = (typeof DELETE_ACCOUNT_MESSAGES)['en'];

const CODE_MIN_LENGTH = 6;

const DANGER_BUTTON_CLASS =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-control border border-state-error/60 px-5 py-3 text-control-md font-medium text-state-error transition-colors hover:bg-state-error/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-state-error disabled:cursor-not-allowed disabled:opacity-50';

const getServerError = (error: Error | null, t: DeleteAccountMessages, networkError: string) => {
  if (!error) return null;
  switch (getApiErrorCode(error)) {
    case 'PASSWORD_INCORRECT':
      return t.wrongPassword;
    case 'TWO_FACTOR_REQUIRED':
    case 'TWO_FACTOR_INVALID':
      return t.wrongCode;
    case 'GOOGLE_REAUTH_REQUIRED':
      return t.googleRetry;
    case 'LAST_OWNER':
      return t.lastOwner;
  }
  if (!(error instanceof ApiError)) return t.unexpectedError;
  if (error.status === 429) return t.tooMany;
  if (error.status === 400) return t.mismatch;
  if (error.status === NETWORK_ERROR_STATUS) return networkError;
  return t.unexpectedError;
};

interface DeleteAccountFormProps {
  email: string;
  hasPassword: boolean;
  twoFactorEnabled: boolean;
}

export function DeleteAccountForm({
  email,
  hasPassword,
  twoFactorEnabled,
}: DeleteAccountFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [googleCredential, setGoogleCredential] = useState<string | null>(null);
  const t = useLocalized(DELETE_ACCOUNT_MESSAGES);
  const common = useCommonMessages();
  const { mutate: deleteAccount, isPending, error, reset } = useDeleteAccount(email);

  const isConfirmed = confirmation.trim().toLowerCase() === email.toLowerCase();
  const hasIdentityProof = hasPassword ? password !== '' : googleCredential !== null;
  const hasCode = !twoFactorEnabled || code.trim().length >= CODE_MIN_LENGTH;
  const canSubmit = isConfirmed && hasIdentityProof && hasCode && !isPending;
  const serverError = getServerError(error, t, common.networkError);

  const close = () => {
    setIsOpen(false);
    setConfirmation('');
    setPassword('');
    setCode('');
    setGoogleCredential(null);
    reset();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    deleteAccount(
      {
        confirmation: confirmation.trim(),
        password: hasPassword ? password : undefined,
        code: twoFactorEnabled ? code.trim() : undefined,
        googleCredential: googleCredential ?? undefined,
      },
      { onError: () => setGoogleCredential(null) },
    );
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
          {hasPassword ? (
            <Input
              label={t.password}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          ) : (
            <GoogleReauth
              label={t.googleLabel}
              confirmedLabel={t.googleConfirmed}
              unavailableLabel={t.googleUnavailable}
              isConfirmed={googleCredential !== null}
              onCredential={setGoogleCredential}
            />
          )}
          {twoFactorEnabled && (
            <Input
              label={t.code}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoComplete="one-time-code"
              spellCheck={false}
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

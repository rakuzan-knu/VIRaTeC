import { useEffect, useId, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TERMS_VERSION } from '@viratec/contracts';
import { useSessionStore } from '@/entities/session';
import { ROUTES, stripEnglishPrefix } from '@/shared/config/routes';
import { defineMessages, useLocalized } from '@/shared/i18n';
import { useBodyScrollLock } from '@/shared/lib';
import { Button } from '@/shared/ui/Button';
import { useAcceptTerms } from '../model/useAcceptTerms';

const TERMS_UPDATE_MESSAGES = defineMessages({
  en: {
    title: 'Our terms have changed',
    description: 'To keep using your account, please read and accept the current documents.',
    termsLink: 'Terms of Service',
    privacyLink: 'Privacy Policy',
    accept: 'I accept',
    signOut: 'Sign out',
    error: 'Could not save your choice. Reload the page and try again.',
  },
  uk: {
    title: 'Наші умови змінилися',
    description:
      'Щоб і надалі користуватися обліковим записом, ознайомтеся з чинними документами та прийміть їх.',
    termsLink: 'Умови використання',
    privacyLink: 'Політика конфіденційності',
    accept: 'Приймаю',
    signOut: 'Вийти',
    error: 'Не вдалося зберегти ваш вибір. Оновіть сторінку та спробуйте ще раз.',
  },
  de: {
    title: 'Unsere Bedingungen haben sich geändert',
    description:
      'Um Ihr Konto weiter zu nutzen, lesen und akzeptieren Sie bitte die aktuellen Dokumente.',
    termsLink: 'Nutzungsbedingungen',
    privacyLink: 'Datenschutzerklärung',
    accept: 'Ich akzeptiere',
    signOut: 'Abmelden',
    error:
      'Ihre Auswahl konnte nicht gespeichert werden. Laden Sie die Seite neu und versuchen Sie es erneut.',
  },
  fr: {
    title: 'Nos conditions ont changé',
    description:
      'Pour continuer à utiliser votre compte, veuillez lire et accepter les documents en vigueur.',
    termsLink: 'Conditions d’utilisation',
    privacyLink: 'Politique de confidentialité',
    accept: 'J’accepte',
    signOut: 'Se déconnecter',
    error: 'Impossible d’enregistrer votre choix. Rechargez la page et réessayez.',
  },
  ar: {
    title: 'لقد تغيّرت شروطنا',
    description: 'لمواصلة استخدام حسابك، يُرجى قراءة المستندات الحالية وقبولها.',
    termsLink: 'شروط الخدمة',
    privacyLink: 'سياسة الخصوصية',
    accept: 'أوافق',
    signOut: 'تسجيل الخروج',
    error: 'تعذّر حفظ اختيارك. أعد تحميل الصفحة وحاول مرة أخرى.',
  },
});

const LEGAL_PATHS: readonly string[] = [
  ROUTES.TERMS,
  ROUTES.PRIVACY,
  ROUTES.COOKIES,
  ROUTES.GUIDELINES,
];

const LINK_CLASS =
  'font-medium text-viratec-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime';

interface TermsUpdateDialogProps {
  isSigningOut: boolean;
  onSignOut: () => void;
}

export function TermsUpdateDialog({ isSigningOut, onSignOut }: TermsUpdateDialogProps) {
  const t = useLocalized(TERMS_UPDATE_MESSAGES);
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const { pathname } = useLocation();
  const needsAcceptance = useSessionStore(
    (state) => state.user !== null && state.user.termsVersion !== TERMS_VERSION,
  );
  const isOpen = needsAcceptance && !LEGAL_PATHS.includes(stripEnglishPrefix(pathname));
  const { mutate: accept, isPending, isError } = useAcceptTerms();

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen && ref.current && !ref.current.open) ref.current.showModal();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => event.preventDefault()}
      className="m-auto max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[520px] overflow-y-auto rounded-[28px] border border-white/12 bg-viratec-surface p-0 text-white outline-none backdrop:bg-black/70"
    >
      <div className="flex flex-col gap-5 p-6 lg:p-8">
        <div className="flex flex-col gap-1.5">
          <h2
            id={titleId}
            className="font-display text-2xl leading-8 font-medium tracking-[-0.02em]"
          >
            {t.title}
          </h2>
          <p id={descriptionId} className="text-[15px] leading-6 text-viratec-muted">
            {t.description}
          </p>
        </div>
        <ul className="flex flex-col gap-2 text-[15px]">
          <li>
            <Link
              to={ROUTES.TERMS}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK_CLASS}
            >
              {t.termsLink}
            </Link>
          </li>
          <li>
            <Link
              to={ROUTES.PRIVACY}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK_CLASS}
            >
              {t.privacyLink}
            </Link>
          </li>
        </ul>
        {isError && (
          <p role="alert" className="text-sm text-state-error">
            {t.error}
          </p>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="button" label={t.accept} loading={isPending} onClick={() => accept()} />
          <button
            type="button"
            onClick={onSignOut}
            disabled={isSigningOut}
            className="cursor-pointer rounded-control px-5 py-3 text-control-md font-medium text-viratec-muted transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.signOut}
          </button>
        </div>
      </div>
    </dialog>
  );
}

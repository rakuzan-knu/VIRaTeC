import { Download, LoaderCircle } from 'lucide-react';
import { ApiError, NETWORK_ERROR_STATUS } from '@/shared/api/apiClient';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { useExportData } from '../model/useExportData';

const EXPORT_MESSAGES = defineMessages({
  en: {
    description:
      'Download a copy of everything VIRaTeC stores about you: profile, photo, projects, papers, posts, saved items and active sessions. Passwords and sign-in tokens are never included.',
    action: 'Download my data (JSON)',
    done: 'Your data has been downloaded.',
    error: 'Could not prepare the export. Please try again.',
  },
  uk: {
    description:
      'Завантажте копію всього, що VIRaTeC зберігає про вас: профіль, фото, проєкти, публікації, дописи, збережене та активні сеанси. Паролі й токени входу не включаються.',
    action: 'Завантажити мої дані (JSON)',
    done: 'Ваші дані завантажено.',
    error: 'Не вдалося підготувати експорт. Спробуйте ще раз.',
  },
  de: {
    description:
      'Laden Sie eine Kopie aller Daten herunter, die VIRaTeC über Sie speichert: Profil, Foto, Projekte, Arbeiten, Beiträge, gespeicherte Elemente und aktive Sitzungen. Passwörter und Anmelde-Tokens sind nie enthalten.',
    action: 'Meine Daten herunterladen (JSON)',
    done: 'Ihre Daten wurden heruntergeladen.',
    error: 'Der Export konnte nicht vorbereitet werden. Bitte versuchen Sie es erneut.',
  },
  fr: {
    description:
      'Téléchargez une copie de tout ce que VIRaTeC conserve à votre sujet : profil, photo, projets, articles, publications, éléments enregistrés et sessions actives. Les mots de passe et jetons de connexion ne sont jamais inclus.',
    action: 'Télécharger mes données (JSON)',
    done: 'Vos données ont été téléchargées.',
    error: 'Impossible de préparer l’export. Veuillez réessayer.',
  },
  ar: {
    description:
      'نزّل نسخة من كل ما تخزّنه VIRaTeC عنك: الملف الشخصي والصورة والمشاريع والأوراق والمنشورات والعناصر المحفوظة والجلسات النشطة. لا تُضمَّن كلمات المرور ورموز تسجيل الدخول أبدًا.',
    action: 'تنزيل بياناتي (JSON)',
    done: 'تم تنزيل بياناتك.',
    error: 'تعذّر تجهيز التصدير. يُرجى المحاولة مرة أخرى.',
  },
});

export function ExportDataButton() {
  const t = useLocalized(EXPORT_MESSAGES);
  const common = useCommonMessages();
  const { mutate, isPending, isSuccess, error } = useExportData();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[15px] leading-6 text-viratec-muted">{t.description}</p>
      <button
        type="button"
        onClick={() => mutate()}
        disabled={isPending}
        aria-busy={isPending || undefined}
        className="inline-flex cursor-pointer items-center gap-2 self-start rounded-control border border-border-strong bg-bg-input px-5 py-3 text-control-md font-medium text-white transition-colors hover:border-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-wait disabled:opacity-60"
      >
        {isPending ? (
          <LoaderCircle aria-hidden="true" className="size-[18px] animate-spin" />
        ) : (
          <Download aria-hidden="true" className="size-[18px]" />
        )}
        {t.action}
      </button>
      {error && (
        <p role="alert" className="text-sm text-state-error">
          {error instanceof ApiError && error.status === NETWORK_ERROR_STATUS
            ? common.networkError
            : t.error}
        </p>
      )}
      <p role="status" className="text-sm text-viratec-accent empty:hidden">
        {isSuccess ? t.done : ''}
      </p>
    </div>
  );
}

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

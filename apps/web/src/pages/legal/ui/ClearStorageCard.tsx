import { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { useSessionStore } from '@/entities/session';
import { clearStoredLocale, defineMessages, useLocalized } from '@/shared/i18n';

const CLEAR_STORAGE_MESSAGES = defineMessages({
  en: {
    title: 'Clear what we store on this device',
    description:
      'Removes your language preference and sign-in from this browser. You will be signed out; the language resets on your next visit.',
    action: 'Clear site data',
    done: 'Done. Nothing from VIRaTeC is stored in this browser any more.',
  },
  uk: {
    title: 'Очистити дані, збережені на цьому пристрої',
    description:
      'Видаляє з цього браузера налаштування мови та дані входу. Ви вийдете з облікового запису, а мова повернеться до типової під час наступного візиту.',
    action: 'Очистити дані сайту',
    done: 'Готово. У цьому браузері більше немає даних VIRaTeC.',
  },
});

export function ClearStorageCard() {
  const t = useLocalized(CLEAR_STORAGE_MESSAGES);
  const clearSession = useSessionStore((state) => state.clearSession);
  const [isCleared, setIsCleared] = useState(false);

  const handleClear = () => {
    clearSession();
    clearStoredLocale();
    setIsCleared(true);
  };

  return (
    <div className="mt-4 flex flex-col gap-5 rounded-[28px] border border-white/10 bg-viratec-deep p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:p-8">
      <div className="flex max-w-[560px] flex-col gap-2">
        <h2 className="font-display text-[22px] leading-7 font-medium tracking-[-0.02em] text-white">
          {t.title}
        </h2>
        <p className="text-[15px] leading-6 text-viratec-muted">{t.description}</p>
      </div>
      <div className="flex flex-col gap-3 lg:items-end">
        <button
          type="button"
          onClick={handleClear}
          disabled={isCleared}
          className="inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-white/22 bg-white/4 px-6 py-3 text-base font-medium text-white transition-colors hover:border-white/40 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime disabled:cursor-default disabled:opacity-60"
        >
          {isCleared ? (
            <Check aria-hidden="true" className="size-[18px]" />
          ) : (
            <Trash2 aria-hidden="true" className="size-[18px]" />
          )}
          {t.action}
        </button>
        <p role="status" className="text-sm text-viratec-accent">
          {isCleared ? t.done : ''}
        </p>
      </div>
    </div>
  );
}

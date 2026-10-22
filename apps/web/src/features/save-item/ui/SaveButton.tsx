import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import type { SavedItemRequestDto } from '@viratec/contracts';
import { useIsAuthenticated } from '@/entities/session';
import { ROUTES } from '@/shared/config/routes';
import { defineMessages, useLocalized } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { isItemSaved, useSavedItems, useToggleSaved } from '../model/useSavedItems';

const SAVE_MESSAGES = defineMessages({
  en: {
    save: 'Save',
    saved: 'Saved',
    signInToSave: 'Sign in to save',
    error: 'Could not update. Try again.',
  },
  uk: {
    save: 'Зберегти',
    saved: 'Збережено',
    signInToSave: 'Увійдіть, щоб зберегти',
    error: 'Не вдалося оновити. Спробуйте ще раз.',
  },
});

const BUTTON_CLASS =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border px-5 py-3 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime disabled:cursor-wait';

interface SaveButtonProps {
  item: SavedItemRequestDto;
  className?: string;
}

export function SaveButton({ item, className }: SaveButtonProps) {
  const t = useLocalized(SAVE_MESSAGES);
  const location = useLocation();
  const isAuthenticated = useIsAuthenticated();
  const { data: items, isPending: isLoading } = useSavedItems();
  const toggle = useToggleSaved();
  const isSaved = isItemSaved(items, item);

  if (!isAuthenticated) {
    return (
      <Link
        to={ROUTES.LOGIN}
        state={{ from: `${location.pathname}${location.search}` }}
        className={cn(
          BUTTON_CLASS,
          'border-white/22 bg-white/4 text-white hover:border-white/40 hover:bg-white/10',
          className,
        )}
      >
        <Bookmark aria-hidden="true" className="size-[18px]" />
        {t.signInToSave}
      </Link>
    );
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <button
        type="button"
        aria-pressed={isSaved}
        disabled={isLoading}
        onClick={() => toggle.mutate({ item, save: !isSaved })}
        className={cn(
          BUTTON_CLASS,
          isSaved
            ? 'border-viratec-lime/60 bg-viratec-lime/14 text-viratec-accent hover:bg-viratec-lime/20'
            : 'border-white/22 bg-white/4 text-white hover:border-white/40 hover:bg-white/10',
        )}
      >
        {isSaved ? (
          <BookmarkCheck aria-hidden="true" className="size-[18px]" />
        ) : (
          <Bookmark aria-hidden="true" className="size-[18px]" />
        )}
        {isSaved ? t.saved : t.save}
      </button>
      {toggle.isError && (
        <p role="alert" className="text-xs text-state-error">
          {t.error}
        </p>
      )}
    </div>
  );
}

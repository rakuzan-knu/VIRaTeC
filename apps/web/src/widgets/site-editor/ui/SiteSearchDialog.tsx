import { useId, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/shared/lib';
import { Dialog } from '@/shared/ui/dialog';
import type { SiteEditorMessages } from '../model/messages';
import { snippetOf, type SearchItem } from '../model/siteSearch';
import { useSiteSearch } from '../model/useSiteSearch';
import { SiteSearchFooter } from './SiteSearchFooter';

interface SiteSearchDialogProps {
  open: boolean;
  t: SiteEditorMessages;
  onClose: () => void;
  onChoose: (item: SearchItem) => void;
}

export function SiteSearchDialog({ open, t, onClose, onChoose }: SiteSearchDialogProps) {
  const search = useSiteSearch(open);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const listId = useId();
  const hintId = useId();
  const optionId = (index: number) => `${listId}-${index}`;
  const hasResults = search.visible.length > 0;

  const choose = (item: SearchItem | undefined) => {
    if (!item) return;
    search.changeQuery('');
    onChoose(item);
  };

  const statusText = () => {
    if (search.isLoading) return t.search.loading;
    if (search.isError) return t.loadFailed;
    if (!search.hasQuery) return t.search.description;
    return hasResults ? t.search.results(search.total) : t.search.empty;
  };

  return (
    <Dialog
      open={open}
      title={t.search.title}
      closeLabel={t.close}
      onClose={onClose}
      className="mt-[8svh] max-h-[84svh]"
    >
      <div className="flex flex-col gap-3">
        <div className="relative">
          <label htmlFor={inputId} className="sr-only">
            {t.search.label}
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute start-4 top-3.5 size-5 text-text-subtle"
          />
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded={hasResults}
            aria-controls={listId}
            aria-activedescendant={hasResults ? optionId(search.current) : undefined}
            aria-describedby={hintId}
            aria-autocomplete="list"
            autoComplete="off"
            enterKeyHint="search"
            data-autofocus
            value={search.query}
            placeholder={t.search.placeholder}
            onChange={(event) => search.changeQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                search.move(event.key === 'ArrowDown' ? 1 : -1);
              }
              if (event.key === 'PageDown' || event.key === 'PageUp') {
                event.preventDefault();
                search.goToPage(search.page + (event.key === 'PageDown' ? 1 : -1));
              }
              if (event.key === 'Enter') {
                event.preventDefault();
                choose(search.currentItem);
              }
            }}
            className="h-12 w-full rounded-xl border border-border-default bg-bg-input ps-12 pe-12 text-[15px] font-normal text-text-primary placeholder:text-text-subtle focus-visible:border-viratec-cyan focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
          />
          {search.query && (
            <button
              type="button"
              aria-label={t.search.clear}
              onClick={() => {
                search.changeQuery('');
                inputRef.current?.focus();
              }}
              className="absolute end-2 top-2 flex size-8 cursor-pointer items-center justify-center rounded-full text-text-muted hover:bg-white/8 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-border-focus"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          )}
        </div>
        <div className="flex min-h-6 items-center justify-between gap-3">
          <p
            role="status"
            className={cn('text-[13px]', search.isError ? 'text-state-error' : 'text-text-muted')}
          >
            {statusText()}
          </p>
          {search.isError && (
            <button
              type="button"
              onClick={search.retry}
              className="min-h-6 shrink-0 cursor-pointer text-[13px] text-brand-cyan underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-border-focus"
            >
              {t.retry}
            </button>
          )}
        </div>
        <ul
          id={listId}
          role="listbox"
          aria-label={t.search.title}
          className={cn(
            'flex flex-col gap-1 empty:hidden',
            search.pageCount > 1 && 'min-h-[286px]',
          )}
        >
          {search.visible.map((item, position) => {
            const index = search.offset + position;
            return (
              <li
                key={item.key}
                id={optionId(index)}
                role="option"
                aria-selected={index === search.current}
                onMouseMove={() => search.setActive(index)}
                onClick={() => choose(item)}
                className={cn(
                  'flex cursor-pointer flex-col gap-0.5 rounded-xl px-3 py-2',
                  index === search.current
                    ? 'bg-viratec-cyan/12 ring-1 ring-viratec-cyan/60'
                    : 'hover:bg-white/5',
                )}
              >
                <span className="truncate text-[14px] leading-5 text-text-primary">
                  {snippetOf(item, search.terms).map((part) =>
                    part.isMatch ? (
                      <mark
                        key={`${part.text}-${index}`}
                        className="rounded bg-brand-lime/80 px-0.5 text-text-on-lime"
                      >
                        {part.text}
                      </mark>
                    ) : (
                      part.text
                    ),
                  )}
                </span>
                <span
                  title={`${item.place} · ${item.field}`}
                  className="truncate text-[12px] leading-4 text-text-subtle"
                >
                  {item.place} · {item.field}
                </span>
              </li>
            );
          })}
        </ul>
        <SiteSearchFooter
          t={t}
          hintId={hintId}
          page={search.page}
          pageCount={search.pageCount}
          onPageChange={search.goToPage}
        />
      </div>
    </Dialog>
  );
}

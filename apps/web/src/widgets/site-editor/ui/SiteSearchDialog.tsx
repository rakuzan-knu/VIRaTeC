import { useId, useState } from 'react';
import { cn } from '@/shared/lib';
import { Dialog } from '@/shared/ui/dialog';
import type { SiteEditorMessages } from '../model/messages';
import { snippetOf, type SearchItem } from '../model/siteSearch';
import { useSiteSearch } from '../model/useSiteSearch';

interface SiteSearchDialogProps {
  open: boolean;
  t: SiteEditorMessages;
  onClose: () => void;
  onChoose: (item: SearchItem) => void;
}

export function SiteSearchDialog({ open, t, onClose, onChoose }: SiteSearchDialogProps) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const search = useSiteSearch(open, query);
  const listId = useId();
  const hintId = useId();
  const optionId = (index: number) => `${listId}-${index}`;
  const current = Math.min(active, Math.max(search.results.length - 1, 0));

  const choose = (item: SearchItem | undefined) => {
    if (!item) return;
    setQuery('');
    onChoose(item);
  };

  return (
    <Dialog
      open={open}
      title={t.search.title}
      description={t.search.description}
      closeLabel={t.close}
      onClose={onClose}
    >
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-2 text-label font-medium text-text-primary">
          {t.search.label}
          <input
            type="search"
            role="combobox"
            aria-expanded={search.results.length > 0}
            aria-controls={listId}
            aria-activedescendant={search.results.length > 0 ? optionId(current) : undefined}
            aria-describedby={hintId}
            aria-autocomplete="list"
            autoComplete="off"
            data-autofocus
            value={query}
            placeholder={t.search.placeholder}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                const step = event.key === 'ArrowDown' ? 1 : -1;
                const count = search.results.length;
                if (count > 0) setActive((current + step + count) % count);
              }
              if (event.key === 'Enter') {
                event.preventDefault();
                choose(search.results[current]);
              }
            }}
            className="h-12 rounded-xl border border-border-default bg-bg-input px-4 text-[15px] font-normal text-text-primary placeholder:text-text-subtle focus-visible:border-viratec-cyan focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
          />
        </label>
        <p id={hintId} className="text-[12px] text-text-subtle">
          {t.search.hint}
        </p>
        <p role="status" className="text-[13px] text-text-muted">
          {search.isLoading
            ? t.search.loading
            : search.query.length > 1
              ? search.results.length > 0
                ? t.search.results(search.results.length)
                : t.search.empty
              : ''}
        </p>
        <ul
          id={listId}
          role="listbox"
          aria-label={t.search.title}
          className="flex max-h-[50svh] flex-col gap-1 overflow-y-auto"
        >
          {search.results.map((item, index) => {
            const snippet = snippetOf(item, search.query);
            return (
              <li
                key={item.key}
                id={optionId(index)}
                role="option"
                aria-selected={index === current}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(item)}
                className={cn(
                  'flex cursor-pointer flex-col gap-1 rounded-xl px-3 py-2',
                  index === current
                    ? 'bg-viratec-cyan/12 ring-1 ring-viratec-cyan/60'
                    : 'hover:bg-white/5',
                )}
              >
                <span className="text-[14px] break-words text-text-primary">
                  {snippet.before}
                  {snippet.match && (
                    <mark className="rounded bg-brand-lime/80 px-0.5 text-text-on-lime">
                      {snippet.match}
                    </mark>
                  )}
                  {snippet.after}
                </span>
                <span className="text-[12px] text-text-subtle">
                  {item.place} · {item.field}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </Dialog>
  );
}

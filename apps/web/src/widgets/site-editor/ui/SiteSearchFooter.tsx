import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { SiteEditorMessages } from '../model/messages';

interface SiteSearchFooterProps {
  t: SiteEditorMessages;
  hintId: string;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function SiteSearchFooter({
  t,
  hintId,
  page,
  pageCount,
  onPageChange,
}: SiteSearchFooterProps) {
  const hints = [
    { key: '↑↓', label: t.search.hintChoose },
    { key: '↵', label: t.search.hintOpen },
    { key: 'Esc', label: t.search.hintClose },
  ];
  const pagers = [
    { label: t.search.previous, Icon: ChevronLeft, target: page - 1, disabled: page === 0 },
    {
      label: t.search.next,
      Icon: ChevronRight,
      target: page + 1,
      disabled: page >= pageCount - 1,
    },
  ];

  return (
    <div className="flex min-h-8 items-center justify-between gap-4 border-t border-white/10 pt-3">
      <p id={hintId} className="hidden items-center gap-4 text-[12px] text-text-subtle sm:flex">
        {hints.map(({ key, label }) => (
          <span key={key} className="flex items-center gap-1.5">
            <kbd className="rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 font-sans text-[11px] text-text-muted">
              {key}
            </kbd>
            {label}
          </span>
        ))}
      </p>
      {pageCount > 1 && (
        <div className="ms-auto flex items-center gap-1">
          {pagers.map(({ label, Icon, target, disabled }, position) => (
            <div key={label} className="flex items-center gap-1">
              {position === 1 && (
                <span className="min-w-12 text-center text-[13px] text-text-muted tabular-nums">
                  {page + 1} / {pageCount}
                </span>
              )}
              <button
                type="button"
                aria-label={label}
                disabled={disabled}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onPageChange(target)}
                className="flex size-8 cursor-pointer items-center justify-center rounded-full text-text-primary hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-border-focus disabled:cursor-default disabled:text-text-subtle disabled:hover:bg-transparent"
              >
                <Icon aria-hidden="true" className="size-4 rtl:rotate-180" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

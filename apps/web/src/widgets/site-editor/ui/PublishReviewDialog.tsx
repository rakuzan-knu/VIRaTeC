import { ArrowRight } from 'lucide-react';
import type { ContentChangeDto } from '@viratec/contracts';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/dialog';
import type { SiteEditorMessages } from '../model/messages';
import { usePublishReview } from '../model/usePublishReview';

const MAX_ROWS = 4;

interface PublishReviewDialogProps {
  open: boolean;
  changes: readonly ContentChangeDto[];
  warning: string | null;
  isPending: boolean;
  t: SiteEditorMessages;
  onConfirm: () => void;
  onClose: () => void;
}

export function PublishReviewDialog({
  open,
  changes,
  warning,
  isPending,
  t,
  onConfirm,
  onClose,
}: PublishReviewDialogProps) {
  const items = usePublishReview(open, changes);

  return (
    <Dialog
      open={open}
      title={t.changes.publishTitle}
      description={t.changes.publishText(changes.length)}
      closeLabel={t.close}
      onClose={onClose}
    >
      {warning && (
        <p
          role="alert"
          className="rounded-xl border border-state-error/40 bg-state-error/8 p-3 text-[14px] text-text-primary"
        >
          {warning}
        </p>
      )}
      <ul aria-label={t.review.title} className="flex max-h-[50svh] flex-col gap-2 overflow-y-auto">
        {items.map(({ change, status, rows, isLoading }) => (
          <li
            key={change.id}
            className="flex flex-col gap-2 rounded-xl border border-white/8 bg-white/3 p-3"
          >
            <span className="text-[14px] font-medium break-words text-text-primary">
              {change.label ?? t.changes.image}
            </span>
            {status !== 'changed' ? (
              <span className="text-[13px] text-text-muted">{t.review.status[status]}</span>
            ) : isLoading ? (
              <span className="text-[13px] text-text-muted">{t.review.loading}</span>
            ) : rows && rows.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {rows.slice(0, MAX_ROWS).map((row) => (
                  <li key={row.key} className="flex flex-col gap-0.5 text-[13px]">
                    <span className="text-text-subtle">{row.label}</span>
                    <span className="flex flex-wrap items-start gap-2 break-words">
                      <span className="min-w-0 flex-1 text-text-muted line-through decoration-white/30">
                        <span className="sr-only">{t.versions.before}: </span>
                        {row.before}
                      </span>
                      <ArrowRight
                        aria-hidden="true"
                        className="mt-0.5 size-3.5 shrink-0 text-text-subtle"
                      />
                      <span className="min-w-0 flex-1 text-text-primary">
                        <span className="sr-only">{t.review.after}: </span>
                        {row.after}
                      </span>
                    </span>
                  </li>
                ))}
                {rows.length > MAX_ROWS && (
                  <li className="text-[12px] text-text-subtle">
                    {t.review.more(rows.length - MAX_ROWS)}
                  </li>
                )}
              </ul>
            ) : (
              <span className="text-[13px] text-text-muted">
                {t.changes.fields(change.fieldIds.length)}
              </span>
            )}
          </li>
        ))}
      </ul>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button label={t.keepEditing} variant="secondary" onClick={onClose} />
        <Button label={t.changes.publishConfirm} loading={isPending} onClick={onConfirm} />
      </div>
    </Dialog>
  );
}

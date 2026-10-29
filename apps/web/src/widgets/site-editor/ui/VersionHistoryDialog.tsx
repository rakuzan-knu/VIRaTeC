import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { ContentRevisionDto } from '@viratec/contracts';
import { INTL_LOCALE, useLocale } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/dialog';
import { useEditorErrorMessage } from '../model/errors';
import type { SiteEditorMessages } from '../model/messages';
import type { DiffRow } from '../model/revisionDiff';
import { useSiteEditorStore } from '../model/store';
import { useRevisions } from '../model/useRevisions';

interface VersionHistoryDialogProps {
  open: boolean;
  contentTypeId: string | undefined;
  id: string;
  title: string;
  t: SiteEditorMessages;
  diffOf: (version: Record<string, unknown>) => DiffRow[];
  onClose: () => void;
}

export function VersionHistoryDialog({
  open,
  contentTypeId,
  id,
  title,
  t,
  diffOf,
  onClose,
}: VersionHistoryDialogProps) {
  const locale = useLocale();
  const { list, restore } = useRevisions(open, contentTypeId, id);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isConfirming, setConfirming] = useState(false);
  const loadError = useEditorErrorMessage(list.error);
  const restoreError = useEditorErrorMessage(restore.error);
  const versions = list.data ?? [];
  const selected = versions.find((version) => version.id === selectedId) ?? versions[0] ?? null;
  const rows = selected ? diffOf(selected.data) : [];
  const formatDate = new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const author = (version: ContentRevisionDto) =>
    version.actor
      ? t.versions.by(version.actor.name)
      : version.source === 'contentful'
        ? t.versions.contentful
        : t.versions.unknownAuthor;

  return (
    <Dialog
      open={open}
      title={t.versions.title(title)}
      description={t.versions.description}
      closeLabel={t.close}
      onClose={onClose}
    >
      {list.isPending && (
        <p role="status" className="text-[14px] text-text-muted">
          {t.loading}
        </p>
      )}
      {loadError && (
        <p role="alert" className="text-[14px] text-state-error">
          {loadError}
        </p>
      )}
      {list.isSuccess && versions.length === 0 && (
        <p className="text-[14px] text-text-muted">{t.versions.none}</p>
      )}
      {versions.length > 0 && selected && (
        <div className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-1">
            <legend className="mb-2 text-label font-medium text-text-primary">
              {t.versions.choose}
            </legend>
            <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
              {versions.map((version) => (
                <label
                  key={version.id}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-[14px]',
                    version.id === selected.id
                      ? 'bg-viratec-cyan/12 ring-1 ring-viratec-cyan/60'
                      : 'hover:bg-white/5',
                  )}
                >
                  <input
                    type="radio"
                    name={`versions-${id}`}
                    checked={version.id === selected.id}
                    onChange={() => {
                      setSelectedId(version.id);
                      setConfirming(false);
                    }}
                    className="accent-viratec-cyan"
                  />
                  <span className="flex flex-col">
                    <span className="text-text-primary">
                      {formatDate.format(new Date(version.createdAt))}
                    </span>
                    <span className="text-[12px] text-text-subtle">{author(version)}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <section aria-labelledby={`versions-diff-${id}`} className="flex flex-col gap-2">
            <h3 id={`versions-diff-${id}`} className="text-[15px] font-medium text-text-primary">
              {t.versions.difference}
            </h3>
            {rows.length === 0 ? (
              <p className="text-[14px] text-text-muted">{t.versions.same}</p>
            ) : (
              <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                {rows.map((row) => (
                  <li key={row.key} className="flex flex-col gap-1 rounded-xl bg-white/4 p-3">
                    <span className="text-[13px] font-medium text-text-primary">{row.label}</span>
                    <span className="flex flex-wrap items-start gap-2 text-[13px] break-words">
                      <span className="min-w-0 flex-1 text-text-muted">
                        <span className="sr-only">{t.versions.before}: </span>
                        {row.before}
                      </span>
                      <ArrowRight
                        aria-hidden="true"
                        className="mt-0.5 size-3.5 shrink-0 text-text-subtle"
                      />
                      <span className="min-w-0 flex-1 text-text-primary">
                        <span className="sr-only">{t.versions.after}: </span>
                        {row.after}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {restoreError && (
            <p role="alert" className="text-[14px] text-state-error">
              {restoreError}
            </p>
          )}
          {isConfirming ? (
            <div className="flex flex-col gap-3 rounded-xl border border-white/12 p-3">
              <p className="text-[14px] text-text-primary">{t.versions.restoreText}</p>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  label={t.keepEditing}
                  variant="secondary"
                  onClick={() => setConfirming(false)}
                />
                <Button
                  label={t.versions.restoreConfirm}
                  loading={restore.isPending}
                  onClick={() =>
                    restore.mutate(
                      { revisionId: selected.id, label: t.versions.restoreLabel(title) },
                      {
                        onSuccess: () => {
                          useSiteEditorStore.getState().announce(t.versions.restored);
                          setConfirming(false);
                          onClose();
                        },
                      },
                    )
                  }
                />
              </div>
            </div>
          ) : (
            <Button
              label={t.versions.restore}
              variant="secondary"
              className="self-end"
              disabled={rows.length === 0}
              onClick={() => setConfirming(true)}
            />
          )}
        </div>
      )}
    </Dialog>
  );
}

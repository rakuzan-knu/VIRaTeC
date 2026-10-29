import { useId } from 'react';
import type { AdminPermission, RecordResource } from '@viratec/contracts';
import { useLocale } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog, RecordFieldList } from '@/widgets/site-editor';
import { useAdminMessages } from '../model/messages';
import { useContentRecord } from '../model/useContentRecord';

export function ContentRecordForm({
  resource,
  recordKey,
  permissions,
  onClosed,
}: {
  resource: RecordResource;
  recordKey: string;
  permissions: readonly AdminPermission[];
  onClosed: () => void;
}) {
  const t = useAdminMessages();
  const locale = useLocale();
  const form = useContentRecord(resource, recordKey, permissions, onClosed);
  const hintId = useId();
  const { editorT, loaded } = form;
  const status = !loaded
    ? null
    : loaded.isDeleted
      ? editorT.records.statusDeleted
      : loaded.isNew
        ? editorT.records.statusNew
        : loaded.hasDraft
          ? editorT.records.statusDraft
          : editorT.records.statusPublished;
  const publishHint = !form.change
    ? t.content.nothingToPublish
    : form.draft
      ? t.content.saveFirst
      : null;

  return (
    <form
      noValidate
      aria-busy={form.isBusy}
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        form.submit();
      }}
    >
      <header className="flex flex-col gap-1">
        <span className="text-sm text-viratec-subtle">{editorT.records.resource[resource]}</span>
        <h3 className="font-display text-2xl font-medium break-words text-white">{form.label}</h3>
        {status && <p className="text-sm text-viratec-muted">{status}</p>}
      </header>

      {form.record.isPending && (
        <p role="status" className="text-viratec-muted">
          {t.content.loading}
        </p>
      )}
      {form.loadError && (
        <div role="alert" className="flex flex-col items-start gap-3 text-viratec-muted">
          {form.loadError}
          <Button
            label={t.content.retry}
            variant="secondary"
            onClick={() => void form.record.refetch()}
          />
        </div>
      )}

      {loaded && (
        <>
          {loaded.isDeleted && (
            <p className="rounded-2xl bg-state-error/10 p-3 text-[14px] text-text-primary">
              {editorT.records.deletedNote}
            </p>
          )}
          {!form.canEdit && !loaded.isDeleted && (
            <p className="rounded-2xl bg-white/5 p-3 text-[14px] text-text-muted">
              {editorT.inspector.readOnly}
            </p>
          )}
          <div className="flex flex-col gap-5">
            <RecordFieldList
              resource={resource}
              data={form.data}
              focusLocale={locale}
              readOnly={!form.canEdit}
              t={editorT}
              onChange={form.updateField}
            />
          </div>

          <div className="sticky bottom-0 -mx-6 flex flex-col gap-3 border-t border-white/8 bg-viratec-deep px-6 py-4 lg:-bottom-8 lg:-mx-8 lg:-mb-8 lg:px-8">
            {form.isConflict && (
              <div role="alert" className="flex items-center gap-3 text-[14px] text-state-error">
                <span className="flex-1">{editorT.inspector.conflict}</span>
                <Button
                  label={editorT.inspector.reload}
                  variant="secondary"
                  onClick={form.reload}
                />
              </div>
            )}
            {(form.saveError ?? form.actionError) && (
              <p role="alert" className="text-[14px] text-state-error">
                {form.saveError ?? form.actionError}
              </p>
            )}
            {form.feedback && (
              <p
                role={form.feedback.ok ? 'status' : 'alert'}
                className={cn(
                  'text-[14px]',
                  form.feedback.ok ? 'text-viratec-cyan' : 'text-state-error',
                )}
              >
                {form.feedback.text}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {form.canEdit && (
                <>
                  <Button
                    label={editorT.inspector.save}
                    type="submit"
                    disabled={!form.draft || form.isBusy}
                    loading={form.isSaving}
                  />
                  <Button
                    label={editorT.inspector.reset}
                    variant="secondary"
                    disabled={!form.draft || form.isBusy}
                    onClick={form.reset}
                  />
                </>
              )}
              {form.canPublish && (
                <Button
                  label={t.content.publish}
                  variant="secondary"
                  aria-describedby={publishHint ? hintId : undefined}
                  disabled={!form.change || Boolean(form.draft) || form.isBusy}
                  loading={form.isPublishing}
                  onClick={() => void form.publishNow()}
                />
              )}
              {form.canEdit && form.change && (
                <Button
                  label={t.content.discard}
                  variant="secondary"
                  disabled={form.isBusy}
                  onClick={form.askDiscard}
                />
              )}
              {form.canDelete && (
                <Button
                  label={editorT.records.delete}
                  variant="secondary"
                  className="hover:border-state-error"
                  disabled={form.isBusy}
                  onClick={form.askDelete}
                />
              )}
            </div>
            {form.canPublish && publishHint && (
              <p id={hintId} className="text-caption text-text-subtle">
                {publishHint}
              </p>
            )}
            {!form.canPublish && form.canEdit && (
              <p className="text-caption text-text-subtle">{t.content.noPublishPermission}</p>
            )}
          </div>
        </>
      )}
      <ConfirmDialog
        open={form.confirming === 'discard'}
        title={editorT.changes.discardTitle(form.label)}
        description={t.content.discardText}
        confirmLabel={editorT.changes.discardConfirm}
        cancelLabel={editorT.keepEditing}
        closeLabel={editorT.close}
        onConfirm={form.discardChanges}
        onClose={form.cancelConfirm}
      />
      <ConfirmDialog
        open={form.confirming === 'delete'}
        title={editorT.records.deleteTitle(form.label)}
        description={editorT.records.deleteText}
        confirmLabel={editorT.records.deleteConfirm}
        cancelLabel={editorT.keepEditing}
        closeLabel={editorT.close}
        onConfirm={form.deleteRecord}
        onClose={form.cancelConfirm}
      />
    </form>
  );
}

import { useState } from 'react';
import { recordResourceOf, type RecordData } from '@viratec/contracts';
import { useSessionStore } from '@/entities/session';
import { useLocale } from '@/shared/i18n';
import { Button } from '@/shared/ui/Button';
import { sameValue } from '../model/contentModel';
import { isConflict, useEditorErrorMessage } from '../model/errors';
import { recordDeleteAction, recordSaveAction } from '../model/history';
import type { SiteEditorMessages } from '../model/messages';
import { NO_PERMISSIONS, canEditRecords } from '../model/permissions';
import { useDeleteRecord, useEditorRecord, useSaveRecord } from '../model/queries';
import { normalizeRecordData, recordLabel, writeRecordValue } from '../model/recordModel';
import { recordDraftKey, useCurrentSelection, useSiteEditorStore } from '../model/store';
import { ConfirmDialog } from './ConfirmDialog';
import { SHORTCUTS } from '../model/shortcuts';
import { EditorPanel, useSaveShortcut } from './EditorPanel';
import { RecordFieldList } from './RecordFieldList';

export function RecordPanel({ t }: { t: SiteEditorMessages }) {
  const locale = useLocale();
  const selection = useCurrentSelection();
  const resource = recordResourceOf(selection?.contentTypeId);
  const key = selection?.entryId ?? null;
  const draftKey = resource && key ? recordDraftKey(resource, key) : null;
  const draft = useSiteEditorStore((state) =>
    draftKey ? state.recordDrafts[draftKey] : undefined,
  );
  const { setRecordDraft, dropRecordDraft, close, pushAction, announce } =
    useSiteEditorStore.getState();
  const permissions = useSessionStore((state) => state.user?.permissions ?? NO_PERMISSIONS);

  const record = useEditorRecord(resource, key);
  const save = useSaveRecord();
  const remove = useDeleteRecord();
  const saveError = useEditorErrorMessage(save.error);
  const loadError = useEditorErrorMessage(record.error);
  const removeError = useEditorErrorMessage(remove.error);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [isConfirmingDelete, setConfirmingDelete] = useState(false);

  const submit = () => {
    if (!resource || !key || !draftKey || !draft || !record.data) return;
    const loadedRecord = record.data;
    const data = normalizeRecordData(resource, draft);
    const changeLabel = `${t.records.resource[resource]}: ${recordLabel(resource, draft, locale)}`;
    save.mutate(
      {
        resource,
        key,
        dto: { data, baseUpdatedAt: loadedRecord.updatedAt, label: changeLabel },
      },
      {
        onSuccess: () => {
          dropRecordDraft(draftKey);
          setSavedAt(Date.now());
          pushAction(
            recordSaveAction({
              resource,
              key,
              before: loadedRecord.data,
              after: data,
              hadDraft: loadedRecord.hasDraft,
              label: t.history.saved(changeLabel),
              changeLabel,
            }),
          );
          announce(t.announce.saved);
        },
      },
    );
  };

  useSaveShortcut(submit);

  if (!selection || !resource || !key || !draftKey) return null;

  const loaded = record.data;
  const data = draft ?? loaded?.data ?? {};
  const canEdit = canEditRecords(permissions, resource) && !loaded?.isDeleted;
  const label = loaded ? recordLabel(resource, data, locale) : t.loading;
  const status = !loaded
    ? null
    : loaded.isDeleted
      ? t.records.statusDeleted
      : loaded.isNew
        ? t.records.statusNew
        : loaded.hasDraft
          ? t.records.statusDraft
          : t.records.statusPublished;

  const updateField = (path: string, value: unknown) => {
    if (!loaded) return;
    const next: RecordData = writeRecordValue(data, path, value);
    setSavedAt(null);
    if (sameValue(next, loaded.data)) dropRecordDraft(draftKey);
    else setRecordDraft(draftKey, next);
  };

  return (
    <EditorPanel
      t={t}
      label={t.records.title}
      kicker={t.records.resource[resource]}
      title={label}
      status={status}
      focusTitle={!selection.fieldId}
      footer={
        loaded && canEditRecords(permissions, resource) && !loaded.isDeleted ? (
          <>
            {isConflict(save.error) && (
              <div role="alert" className="flex items-center gap-3 text-[14px] text-state-error">
                <span className="flex-1">{t.inspector.conflict}</span>
                <Button
                  label={t.inspector.reload}
                  variant="secondary"
                  onClick={() => {
                    dropRecordDraft(draftKey);
                    save.reset();
                    void record.refetch();
                  }}
                />
              </div>
            )}
            {saveError && !isConflict(save.error) && (
              <p role="alert" className="text-[14px] text-state-error">
                {saveError}
              </p>
            )}
            {removeError && (
              <p role="alert" className="text-[14px] text-state-error">
                {removeError}
              </p>
            )}
            {savedAt && !draft && (
              <p role="status" className="text-[14px] text-viratec-cyan">
                {t.inspector.saved}
              </p>
            )}
            <Button
              label={t.inspector.save}
              aria-keyshortcuts={SHORTCUTS.save.aria}
              className="w-full"
              disabled={!draft}
              loading={save.isPending}
              onClick={submit}
            />
            <div className="flex gap-3">
              <Button
                label={t.inspector.reset}
                variant="secondary"
                className="flex-1"
                disabled={!draft || save.isPending}
                onClick={() => dropRecordDraft(draftKey)}
              />
              <Button
                label={t.records.delete}
                variant="secondary"
                className="flex-1 hover:border-state-error"
                disabled={save.isPending}
                onClick={() => setConfirmingDelete(true)}
              />
            </div>
            <p className="text-caption text-text-subtle">{t.saveHint(SHORTCUTS.save.label)}</p>
          </>
        ) : null
      }
    >
      <p className="text-[13px] text-text-muted">{t.inspectorHint}</p>
      {record.isPending && (
        <p role="status" className="text-text-muted">
          {t.loading}
        </p>
      )}
      {loadError && (
        <div role="alert" className="flex flex-col items-start gap-3 text-[15px] text-text-muted">
          {loadError}
          <Button label={t.retry} variant="secondary" onClick={() => void record.refetch()} />
        </div>
      )}
      {loaded && (
        <>
          {loaded.isDeleted && (
            <p className="rounded-2xl bg-state-error/10 p-3 text-[14px] text-text-primary">
              {t.records.deletedNote}
            </p>
          )}
          {loaded.isNew && (
            <p className="rounded-2xl bg-white/5 p-3 text-[14px] text-text-muted">
              {t.records.notInDatabase}
            </p>
          )}
          {!canEditRecords(permissions, resource) && (
            <p className="rounded-2xl bg-white/5 p-3 text-[14px] text-text-muted">
              {t.inspector.readOnly}
            </p>
          )}
          <RecordFieldList
            resource={resource}
            data={data}
            focusedPath={selection.fieldId}
            focusLocale={selection.locale ?? locale}
            readOnly={!canEdit}
            t={t}
            onChange={updateField}
          />
        </>
      )}
      <ConfirmDialog
        open={isConfirmingDelete}
        title={t.records.deleteTitle(label)}
        description={t.records.deleteText}
        confirmLabel={t.records.deleteConfirm}
        cancelLabel={t.keepEditing}
        closeLabel={t.close}
        isPending={remove.isPending}
        onConfirm={() => {
          const changeLabel = `${t.records.resource[resource]}: ${label}`;
          remove.mutate(
            { resource, key, label: changeLabel },
            {
              onSuccess: () => {
                dropRecordDraft(draftKey);
                setConfirmingDelete(false);
                close();
                if (loaded && !loaded.isNew) {
                  pushAction(
                    recordDeleteAction({
                      resource,
                      key,
                      before: loaded.data,
                      hadDraft: loaded.hasDraft,
                      label: t.history.deleted(changeLabel),
                      changeLabel,
                    }),
                  );
                }
              },
              onError: () => setConfirmingDelete(false),
            },
          );
        }}
        onClose={() => setConfirmingDelete(false)}
      />
    </EditorPanel>
  );
}

import { useState } from 'react';
import { recordResourceOf } from '@viratec/contracts';
import { useSessionStore } from '@/entities/session';
import { useLocale } from '@/shared/i18n';
import { Button } from '@/shared/ui/Button';
import { recordSaveKey } from '../model/autosave';
import { cancelDraftSave, flushDrafts } from '../model/autosaveRegistry';
import { useEditorErrorMessage } from '../model/errors';
import { recordDiff } from '../model/revisionDiff';
import { recordDeleteAction } from '../model/history';
import type { SiteEditorMessages } from '../model/messages';
import { NO_PERMISSIONS, canEditRecords } from '../model/permissions';
import { useDeleteRecord, useEditorRecord } from '../model/queries';
import { recordLabel, writeRecordValue } from '../model/recordModel';
import { recordDraftKey, useCurrentSelection, useSiteEditorStore } from '../model/store';
import { ConfirmDialog } from './ConfirmDialog';
import { EditorPanel, useSaveShortcut } from './EditorPanel';
import { RecordFieldList } from './RecordFieldList';
import { SaveStatusLine } from './SaveStatusLine';
import { VersionHistoryDialog } from './VersionHistoryDialog';

export function RecordPanel({ t }: { t: SiteEditorMessages }) {
  const locale = useLocale();
  const selection = useCurrentSelection();
  const resource = recordResourceOf(selection?.contentTypeId);
  const key = selection?.entryId ?? null;
  const draftKey = resource && key ? recordDraftKey(resource, key) : null;
  const draft = useSiteEditorStore((state) =>
    draftKey ? state.recordDrafts[draftKey] : undefined,
  );
  const { setRecordDraft, dropRecordDraft, close, pushAction } = useSiteEditorStore.getState();
  const permissions = useSessionStore((state) => state.user?.permissions ?? NO_PERMISSIONS);

  const record = useEditorRecord(resource, key);
  const remove = useDeleteRecord();
  const loadError = useEditorErrorMessage(record.error);
  const removeError = useEditorErrorMessage(remove.error);
  const [isConfirmingDelete, setConfirmingDelete] = useState(false);
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const saveKey = draftKey ? recordSaveKey(draftKey) : null;

  useSaveShortcut(() => {
    if (saveKey) void flushDrafts(saveKey);
  });

  if (!selection || !resource || !key || !draftKey) return null;

  const loaded = record.data;
  const data = draft?.data ?? loaded?.data ?? {};
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
    setRecordDraft(draftKey, {
      baseUpdatedAt: draft?.baseUpdatedAt ?? loaded.updatedAt,
      base: draft?.base ?? loaded.data,
      data: writeRecordValue(data, path, value),
    });
  };

  return (
    <EditorPanel
      t={t}
      label={t.records.title}
      kicker={t.records.resource[resource]}
      title={label}
      status={status}
      focusTitle={!selection.fieldId}
      saveKey={saveKey ?? undefined}
      onHistory={loaded && !loaded.isNew ? () => setHistoryOpen(true) : undefined}
      footer={
        loaded && canEditRecords(permissions, resource) && !loaded.isDeleted && saveKey ? (
          <>
            {removeError && (
              <p role="alert" className="text-[14px] text-state-error">
                {removeError}
              </p>
            )}
            <SaveStatusLine saveKey={saveKey} t={t} />
            <Button
              label={t.records.delete}
              variant="secondary"
              className="w-full hover:border-state-error"
              onClick={() => setConfirmingDelete(true)}
            />
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
          if (saveKey) cancelDraftSave(saveKey);
          dropRecordDraft(draftKey);
          remove.mutate(
            { resource, key, label: changeLabel },
            {
              onSuccess: () => {
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
      {loaded && (
        <VersionHistoryDialog
          open={isHistoryOpen}
          contentTypeId={selection.contentTypeId}
          id={key}
          title={label}
          t={t}
          diffOf={(version) => recordDiff(resource, data, version, t)}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </EditorPanel>
  );
}

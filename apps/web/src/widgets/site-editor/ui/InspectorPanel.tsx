import { useState } from 'react';
import { AdminPermission } from '@viratec/contracts';
import { useSessionStore } from '@/entities/session';
import { NO_PERMISSIONS } from '../model/permissions';
import { useLocale } from '@/shared/i18n';
import { Button } from '@/shared/ui/Button';
import {
  changeLabel,
  entryLabel,
  findContentType,
  isCollectionType,
  normalizeFields,
  sameFields,
  withFieldValue,
} from '../model/contentModel';
import { isConflict, useEditorErrorMessage } from '../model/errors';
import { typeName } from '../model/fieldText';
import { entrySaveAction } from '../model/history';
import type { SiteEditorMessages } from '../model/messages';
import { useEditorEntry, useEntryReferences, useSaveEntry } from '../model/queries';
import { useCurrentSelection, useSiteEditorStore } from '../model/store';
import { SHORTCUTS } from '../model/shortcuts';
import { AddSiblingEntryButton } from './AddSiblingEntryButton';
import { EditorPanel, useSaveShortcut } from './EditorPanel';
import { EntryFieldList } from './EntryFieldList';

export function InspectorPanel({ t }: { t: SiteEditorMessages }) {
  const locale = useLocale();
  const selection = useCurrentSelection();
  const { open, setDraft, dropDraft, pushAction, announce } = useSiteEditorStore.getState();
  const entryId = selection?.entryId ?? null;
  const draft = useSiteEditorStore((state) => (entryId ? state.drafts[entryId] : undefined));
  const permissions = useSessionStore((state) => state.user?.permissions ?? NO_PERMISSIONS);
  const canEdit = permissions.includes(AdminPermission.CONTENT_EDIT);
  const canUpload = permissions.includes(AdminPermission.MEDIA_MANAGE);

  const entry = useEditorEntry(entryId);
  const references = useEntryReferences(entryId);
  const save = useSaveEntry();
  const saveError = useEditorErrorMessage(save.error);
  const loadError = useEditorErrorMessage(entry.error);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const data = entry.data;
  const type = findContentType(data?.contentTypeId);
  const fields = draft?.fields ?? data?.fields ?? {};
  const isStale = Boolean(draft && data && draft.version !== data.version);

  const updateField = (fieldId: string, localeCode: string, value: unknown) => {
    if (!data) return;
    const next = withFieldValue(fields, fieldId, localeCode, value);
    setSavedAt(null);
    if (sameFields(next, data.fields)) dropDraft(data.id);
    else setDraft(data.id, { version: draft?.version ?? data.version, fields: next });
  };

  const persistField = (fieldId: string, localeCode: string, value: unknown) => {
    if (!data || !type) return;
    const fieldsToSave = normalizeFields(withFieldValue(data.fields, fieldId, localeCode, value));
    const label = changeLabel(
      typeName(t.fields, type.id, type.name),
      entryLabel(data.contentTypeId, fieldsToSave, data.locales, locale),
    );
    save.mutate(
      { id: data.id, dto: { version: data.version, fields: fieldsToSave, label } },
      {
        onSuccess: (saved) => {
          const pending = useSiteEditorStore.getState().drafts[data.id];
          const rest = pending && withFieldValue(pending.fields, fieldId, localeCode, value);
          if (rest && !sameFields(rest, saved.fields)) {
            setDraft(data.id, { version: saved.version, fields: rest });
          } else {
            dropDraft(data.id);
          }
          announce(t.announce.saved);
        },
      },
    );
  };

  const submit = () => {
    if (!data || !draft || !type) return;
    const fieldsToSave = normalizeFields(draft.fields);
    const label = changeLabel(
      typeName(t.fields, type.id, type.name),
      entryLabel(data.contentTypeId, draft.fields, data.locales, locale),
    );
    save.mutate(
      { id: data.id, dto: { version: draft.version, fields: fieldsToSave, label } },
      {
        onSuccess: () => {
          dropDraft(data.id);
          setSavedAt(Date.now());
          pushAction(
            entrySaveAction({
              entry: data,
              after: fieldsToSave,
              label: t.history.saved(label),
              changeLabel: label,
            }),
          );
          announce(t.announce.saved);
        },
      },
    );
  };

  useSaveShortcut(submit);

  if (!selection) return null;

  const label = data ? entryLabel(data.contentTypeId, fields, data.locales, locale) : t.loading;
  const status = !data
    ? null
    : draft
      ? null
      : data.publishedVersion === null
        ? t.inspector.notPublished
        : data.version > data.publishedVersion + 1
          ? t.inspector.draft
          : t.inspector.published;

  return (
    <EditorPanel
      t={t}
      label={t.inspector.title}
      kicker={type ? typeName(t.fields, type.id, type.name) : t.inspector.title}
      title={label}
      status={status}
      focusTitle={!selection.fieldId}
      footer={
        data && type && canEdit ? (
          <>
            {(isStale || isConflict(save.error)) && (
              <div role="alert" className="flex items-center gap-3 text-[14px] text-state-error">
                <span className="flex-1">{t.inspector.conflict}</span>
                <Button
                  label={t.inspector.reload}
                  variant="secondary"
                  onClick={() => {
                    dropDraft(data.id);
                    save.reset();
                    void entry.refetch();
                  }}
                />
              </div>
            )}
            {saveError && !isConflict(save.error) && (
              <p role="alert" className="text-[14px] text-state-error">
                {saveError}
              </p>
            )}
            {savedAt && !draft && (
              <p role="status" className="text-[14px] text-viratec-cyan">
                {t.inspector.saved}
              </p>
            )}
            <div className="flex gap-3">
              <Button
                label={t.inspector.save}
                aria-keyshortcuts={SHORTCUTS.save.aria}
                className="flex-1"
                disabled={!draft || isStale}
                loading={save.isPending}
                onClick={submit}
              />
              <Button
                label={t.inspector.reset}
                variant="secondary"
                disabled={!draft || save.isPending}
                onClick={() => dropDraft(data.id)}
              />
            </div>
            <p className="text-caption text-text-subtle">{t.saveHint(SHORTCUTS.save.label)}</p>
          </>
        ) : null
      }
    >
      <p className="text-[13px] text-text-muted">{t.inspectorHint}</p>
      {entry.isPending && (
        <p role="status" className="text-text-muted">
          {t.loading}
        </p>
      )}
      {loadError && (
        <div role="alert" className="flex flex-col items-start gap-3 text-[15px] text-text-muted">
          {loadError}
          <Button label={t.retry} variant="secondary" onClick={() => void entry.refetch()} />
        </div>
      )}
      {data && !type && <p className="text-text-muted">{t.inspector.unknownType}</p>}
      {data && type && (
        <>
          {!canEdit && (
            <p className="rounded-2xl bg-white/5 p-3 text-[14px] text-text-muted">
              {t.inspector.readOnly}
            </p>
          )}
          {references.data && references.data.length > 0 && (
            <nav aria-label={t.inspector.usedIn} className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] text-text-subtle">{t.inspector.usedIn}</span>
              {references.data.map((parent) => {
                const parentLabel = entryLabel(
                  parent.contentTypeId,
                  parent.fields,
                  data.locales,
                  locale,
                );
                return (
                  <button
                    key={parent.id}
                    type="button"
                    onClick={() => open({ entryId: parent.id })}
                    className="cursor-pointer rounded-full border border-white/12 px-3 py-1 text-[13px] text-text-primary transition-colors hover:border-viratec-cyan/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus motion-reduce:transition-none"
                  >
                    {parentLabel}
                  </button>
                );
              })}
            </nav>
          )}
          {canEdit && isCollectionType(type.id) && (
            <AddSiblingEntryButton type={type} fields={fields} locales={data.locales} t={t} />
          )}
          <EntryFieldList
            type={type}
            fields={fields}
            locales={data.locales}
            focusedFieldId={selection.fieldId}
            focusLocale={selection.locale ?? locale}
            canEdit={canEdit}
            canUpload={canUpload}
            t={t}
            onChange={updateField}
            onPersist={persistField}
          />
        </>
      )}
    </EditorPanel>
  );
}

import { AdminPermission } from '@viratec/contracts';
import { useSessionStore } from '@/entities/session';
import { NO_PERMISSIONS } from '../model/permissions';
import { useLocale } from '@/shared/i18n';
import { Button } from '@/shared/ui/Button';
import { entrySaveKey } from '../model/autosave';
import { flushDrafts } from '../model/autosaveRegistry';
import {
  entryLabel,
  findContentType,
  isCollectionType,
  withFieldValue,
} from '../model/contentModel';
import { useEditorErrorMessage } from '../model/errors';
import { typeName } from '../model/fieldText';
import type { SiteEditorMessages } from '../model/messages';
import { useEditorEntry, useEntryReferences } from '../model/queries';
import { useCurrentSelection, useSiteEditorStore } from '../model/store';
import { AddSiblingEntryButton } from './AddSiblingEntryButton';
import { EditorPanel, useSaveShortcut } from './EditorPanel';
import { EntryFieldList } from './EntryFieldList';
import { SaveStatusLine } from './SaveStatusLine';

export function InspectorPanel({ t }: { t: SiteEditorMessages }) {
  const locale = useLocale();
  const selection = useCurrentSelection();
  const { open, setDraft } = useSiteEditorStore.getState();
  const entryId = selection?.entryId ?? null;
  const draft = useSiteEditorStore((state) => (entryId ? state.drafts[entryId] : undefined));
  const permissions = useSessionStore((state) => state.user?.permissions ?? NO_PERMISSIONS);
  const canEdit = permissions.includes(AdminPermission.CONTENT_EDIT);
  const canUpload = permissions.includes(AdminPermission.MEDIA_MANAGE);

  const entry = useEditorEntry(entryId);
  const references = useEntryReferences(entryId);
  const loadError = useEditorErrorMessage(entry.error);

  const data = entry.data;
  const type = findContentType(data?.contentTypeId);
  const fields = draft?.fields ?? data?.fields ?? {};
  const saveKey = entryId ? entrySaveKey(entryId) : null;

  const updateField = (fieldId: string, localeCode: string, value: unknown) => {
    if (!data) return;
    setDraft(data.id, {
      version: draft?.version ?? data.version,
      base: draft?.base ?? data.fields,
      fields: withFieldValue(fields, fieldId, localeCode, value),
    });
  };

  const persistField = (fieldId: string, localeCode: string, value: unknown) => {
    if (!saveKey) return;
    updateField(fieldId, localeCode, value);
    void flushDrafts(saveKey);
  };

  useSaveShortcut(() => {
    if (saveKey) void flushDrafts(saveKey);
  });

  if (!selection) return null;

  const label = data ? entryLabel(data.contentTypeId, fields, data.locales, locale) : t.loading;
  const status = !data
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
      saveKey={saveKey ?? undefined}
      footer={
        data && type && canEdit && saveKey ? <SaveStatusLine saveKey={saveKey} t={t} /> : null
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

import type { ContentChangeDto } from '@viratec/contracts';
import {
  discardContentChange,
  fetchEditorEntry,
  fetchEntryReferences,
  saveEditorEntry,
} from '../api/editorApi';
import {
  changeLabel,
  entryLabel,
  findContentType,
  sameFields,
  withoutEntryLink,
} from './contentModel';
import { useSiteEditorStore } from './store';

const detachEntry = async (entryId: string) => {
  const savedVersions = new Map<string, number>();
  for (const parent of await fetchEntryReferences(entryId)) {
    const current = await fetchEditorEntry(parent.id);
    const fields = withoutEntryLink(current.fields, entryId);
    if (sameFields(fields, current.fields)) continue;
    const typeName = findContentType(current.contentTypeId)?.name ?? current.contentTypeId;
    const saved = await saveEditorEntry(current.id, {
      version: current.version,
      fields,
      label: changeLabel(
        typeName,
        entryLabel(current.contentTypeId, fields, current.locales, 'en'),
      ),
    });
    savedVersions.set(saved.id, saved.version);
  }

  const { drafts, setDraft, dropDraft } = useSiteEditorStore.getState();
  dropDraft(entryId);
  for (const [id, draft] of Object.entries(drafts)) {
    if (id === entryId) continue;
    const fields = withoutEntryLink(draft.fields, entryId);
    const version = savedVersions.get(id);
    if (version === undefined && fields === draft.fields) continue;
    setDraft(id, { version: version ?? draft.version, fields });
  }
};

export const discardChange = async (change: ContentChangeDto) => {
  if (change.resourceType === 'ENTRY' && change.isNew) await detachEntry(change.resourceId);
  return discardContentChange(change.id);
};

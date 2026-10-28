import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { type ContentEntryDto, type ContentFields, type RecordResource } from '@viratec/contracts';
import { fetchEditorEntry, fetchEntryReferences, fetchRecord } from '../api/editorApi';
import { cancelDraftSave } from './autosaveRegistry';
import { recordSaveKey } from './autosave';
import type { CollectionGrid, CollectionItem } from './collections';
import {
  changeLabel,
  findContentType,
  linkId,
  siblingFields,
  toLink,
  withFieldValue,
} from './contentModel';
import { typeName } from './fieldText';
import { entryCreateAction, recordDeleteAction } from './history';
import { useSiteEditorMessages } from './messages';
import { editorKeys, useCreateEntry, useDeleteRecord } from './queries';
import { recordDraftKey, useSiteEditorStore } from './store';

const asNumber = (value: unknown) => (typeof value === 'number' ? value : null);

const reorder = <T>(items: readonly T[], from: number, to: number) => {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  if (moved !== undefined) next.splice(to, 0, moved);
  return next;
};

const redistribute = (values: readonly number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const isUnique = new Set(sorted).size === sorted.length;
  const first = sorted[0] ?? 0;
  return isUnique ? sorted : sorted.map((_, index) => first + index);
};

export type MoveDirection = -1 | 1;

export function useCollectionActions() {
  const t = useSiteEditorMessages();
  const queryClient = useQueryClient();
  const createEntry = useCreateEntry();
  const deleteRecord = useDeleteRecord();
  const [isBusy, setBusy] = useState(false);
  const [hasError, setError] = useState(false);

  const loadEntry = (id: string) =>
    queryClient.fetchQuery({
      queryKey: editorKeys.entry(id),
      queryFn: () => fetchEditorEntry(id),
      staleTime: 10_000,
    });

  const loadRecord = (resource: RecordResource, key: string) =>
    queryClient.fetchQuery({
      queryKey: editorKeys.record(resource, key),
      queryFn: () => fetchRecord(resource, key),
      staleTime: 10_000,
    });

  const entryFields = (entry: ContentEntryDto) =>
    useSiteEditorStore.getState().drafts[entry.id]?.fields ?? entry.fields;

  const updateEntry = async (
    id: string,
    update: (fields: ContentFields, entry: ContentEntryDto) => ContentFields,
  ) => {
    const loaded = await loadEntry(id);
    const current = useSiteEditorStore.getState().drafts[id];
    useSiteEditorStore.getState().setDraft(id, {
      version: current?.version ?? loaded.version,
      base: current?.base ?? loaded.fields,
      fields: update(current?.fields ?? loaded.fields, loaded),
    });
  };

  const findParentLink = async (childId: string) => {
    for (const reference of await fetchEntryReferences(childId)) {
      const parent = await loadEntry(reference.id);
      const fields = entryFields(parent);
      for (const field of findContentType(parent.contentTypeId)?.fields ?? []) {
        if (field.type !== 'Array' || field.items?.type !== 'Link') continue;
        const value = fields[field.id]?.[parent.locales.en];
        if (Array.isArray(value) && value.some((link) => linkId(link) === childId)) {
          return { parent, fieldId: field.id };
        }
      }
    }
    return null;
  };

  const updateParentLinks = async (childId: string, update: (ids: string[]) => string[] | null) => {
    const link = await findParentLink(childId);
    if (!link) throw new Error('Parent not found');
    await updateEntry(link.parent.id, (fields, entry) => {
      const value = fields[link.fieldId]?.[entry.locales.en];
      const ids = (Array.isArray(value) ? value : [])
        .map(linkId)
        .filter((id): id is string => Boolean(id));
      const next = update(ids) ?? ids;
      return withFieldValue(
        fields,
        link.fieldId,
        entry.locales.en,
        next.map((id) => toLink('Entry', id)),
      );
    });
    return link;
  };

  const pickOrderField = async (grid: CollectionGrid) => {
    if (grid.collection.kind !== 'ordered') return null;
    const entries = await Promise.all(
      grid.items.map((item) => loadEntry(item.target.address.entryId)),
    );
    const candidates = grid.collection.orderFields.filter((field) =>
      entries.every((entry) => asNumber(entryFields(entry)[field.id]?.[entry.locales.en]) !== null),
    );
    const matching = candidates.find((field) => {
      const values = entries.map(
        (entry) => asNumber(entryFields(entry)[field.id]?.[entry.locales.en]) ?? 0,
      );
      return values.every((value, index) => index === 0 || value >= (values[index - 1] ?? 0));
    });
    return { field: matching ?? candidates[0] ?? null, entries };
  };

  const run = async (task: () => Promise<string | null>) => {
    setBusy(true);
    setError(false);
    try {
      const announcement = await task();
      if (announcement) useSiteEditorStore.getState().announce(announcement);
    } catch {
      setError(true);
      useSiteEditorStore.getState().announce(t.collection.failed);
    } finally {
      setBusy(false);
    }
  };

  const move = (
    grid: CollectionGrid,
    item: CollectionItem,
    direction: MoveDirection,
    label: string,
  ) =>
    run(async () => {
      const from = grid.items.indexOf(item);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= grid.items.length) return null;
      const { collection } = grid;
      const ids = grid.items.map((entry) => entry.target.address.entryId);
      const nextIds = reorder(ids, from, to);

      if (collection.kind === 'linked') {
        await updateParentLinks(item.target.address.entryId, (linked) => {
          const neighbour = ids[to];
          const index = linked.indexOf(item.target.address.entryId);
          const target = neighbour ? linked.indexOf(neighbour) : -1;
          return index < 0 || target < 0 ? null : reorder(linked, index, target);
        });
      } else if (collection.kind === 'ordered') {
        const picked = await pickOrderField(grid);
        const field = picked?.field;
        if (!picked || !field) return null;
        const byId = new Map(picked.entries.map((entry) => [entry.id, entry]));
        const values = redistribute(
          picked.entries.map(
            (entry) => asNumber(entryFields(entry)[field.id]?.[entry.locales.en]) ?? 0,
          ),
        );
        await Promise.all(
          nextIds.map(async (id, index) => {
            const entry = byId.get(id);
            const value = values[index];
            if (!entry || value === undefined) return;
            if (asNumber(entryFields(entry)[field.id]?.[entry.locales.en]) === value) return;
            await updateEntry(id, (fields, loaded) =>
              withFieldValue(fields, field.id, loaded.locales.en, value),
            );
          }),
        );
      }
      return t.collection.moved(label);
    });

  const remove = (grid: CollectionGrid, item: CollectionItem, label: string) =>
    run(async () => {
      const { collection } = grid;
      const id = item.target.address.entryId;
      if (collection.kind === 'record') {
        const { resource } = collection;
        const loaded = await loadRecord(resource, id);
        const draftKey = recordDraftKey(resource, id);
        cancelDraftSave(recordSaveKey(draftKey));
        useSiteEditorStore.getState().dropRecordDraft(draftKey);
        const removedLabel = `${t.records.resource[resource]}: ${label}`;
        await deleteRecord.mutateAsync({ resource, key: id, label: removedLabel });
        if (!loaded.isNew) {
          useSiteEditorStore.getState().pushAction(
            recordDeleteAction({
              resource,
              key: id,
              before: loaded.data,
              hadDraft: loaded.hasDraft,
              label: t.history.deleted(removedLabel),
              changeLabel: removedLabel,
            }),
          );
        }
      } else if (collection.kind === 'linked') {
        await updateParentLinks(id, (ids) => ids.filter((linked) => linked !== id));
      } else {
        const entry = await loadEntry(id);
        const field = collection.orderFields.find(
          (candidate) =>
            !candidate.required &&
            asNumber(entryFields(entry)[candidate.id]?.[entry.locales.en]) !== null,
        );
        if (!field) return null;
        await updateEntry(id, (fields, loaded) =>
          withFieldValue(fields, field.id, loaded.locales.en, undefined),
        );
      }
      return t.collection.removed(label);
    });

  const addEntry = (grid: CollectionGrid) =>
    run(async () => {
      const type = findContentType(grid.contentTypeId);
      const last = grid.items[grid.items.length - 1];
      if (!type || !last) return null;
      const name = typeName(t.fields, type.id, type.name);
      const placeholder = `${t.inspector.untitled}: ${name.toLowerCase()}`;
      const label = changeLabel(name, placeholder);
      const sibling = await loadEntry(last.target.address.entryId);
      const fields =
        grid.collection.kind === 'ordered'
          ? siblingFields(type, entryFields(sibling), sibling.locales, placeholder)
          : siblingFields(type, {}, sibling.locales, placeholder);
      const created = await createEntry.mutateAsync({ contentTypeId: type.id, label, fields });
      if (grid.collection.kind === 'linked') {
        await updateParentLinks(last.target.address.entryId, (ids) => {
          const index = ids.indexOf(last.target.address.entryId);
          const next = [...ids];
          next.splice(index < 0 ? next.length : index + 1, 0, created.id);
          return next;
        });
      }
      const { pushAction, select } = useSiteEditorStore.getState();
      pushAction(entryCreateAction({ id: created.id, label: t.history.created(label) }));
      select({ entryId: created.id, contentTypeId: type.id });
      return t.history.created(label);
    });

  return { move, remove, addEntry, isBusy, hasError };
}

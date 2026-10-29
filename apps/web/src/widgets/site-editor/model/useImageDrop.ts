import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AdminPermission, recordResourceOf, type ContentAssetDto } from '@viratec/contracts';
import { useSessionStore } from '@/entities/session';
import { absoluteImageUrl, type ContentAssetAddress } from '@/shared/lib';
import { fetchEditorEntry, fetchRecord, uploadEditorAsset } from '../api/editorApi';
import { prepareImage } from '../lib/prepareImage';
import { entrySaveKey, recordSaveKey } from './autosave';
import { flushDrafts } from './autosaveRegistry';
import { toLink, withFieldValue } from './contentModel';
import { imageRecordSchema } from './fieldText';
import { useSiteEditorMessages } from './messages';
import { NO_PERMISSIONS, canEditRecords } from './permissions';
import { editorKeys } from './queries';
import { writeRecordValue } from './recordModel';
import { recordDraftKey, useSiteEditorStore } from './store';
import { EDITOR_ROOT_ATTRIBUTE, resolveCanvasTarget } from './useCanvasTargets';

export interface DropTarget {
  element: Element;
  address: ContentAssetAddress;
}

const hasFiles = (event: DragEvent) => Boolean(event.dataTransfer?.types.includes('Files'));

const targetAt = (x: number, y: number): DropTarget | null => {
  for (const element of document.elementsFromPoint(x, y)) {
    if (element.closest(`[${EDITOR_ROOT_ATTRIBUTE}]`)) continue;
    const target = resolveCanvasTarget(element);
    return target?.kind === 'asset' ? { element: target.element, address: target.address } : null;
  }
  return null;
};

export function useImageDrop(enabled: boolean) {
  const t = useSiteEditorMessages();
  const queryClient = useQueryClient();
  const permissions = useSessionStore((state) => state.user?.permissions ?? NO_PERMISSIONS);
  const [target, setTarget] = useState<DropTarget | null>(null);
  const [isUploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const applyAsset = async ({ address }: DropTarget, asset: ContentAssetDto) => {
    const { entryId, contentTypeId, fieldId } = address;
    const resource = recordResourceOf(contentTypeId);
    const store = useSiteEditorStore.getState();
    if (resource) {
      const url = absoluteImageUrl(asset.url);
      if (!imageRecordSchema(resource, fieldId)?.safeParse(url).success) throw new Error('url');
      const loaded = await queryClient.fetchQuery({
        queryKey: editorKeys.record(resource, entryId),
        queryFn: () => fetchRecord(resource, entryId),
      });
      const draftKey = recordDraftKey(resource, entryId);
      const current = store.recordDrafts[draftKey];
      store.setRecordDraft(draftKey, {
        baseUpdatedAt: current?.baseUpdatedAt ?? loaded.updatedAt,
        base: current?.base ?? loaded.data,
        data: writeRecordValue(current?.data ?? loaded.data, fieldId, url),
      });
      return recordSaveKey(draftKey);
    }
    const loaded = await queryClient.fetchQuery({
      queryKey: editorKeys.entry(entryId),
      queryFn: () => fetchEditorEntry(entryId),
    });
    const current = store.drafts[entryId];
    store.setDraft(entryId, {
      version: current?.version ?? loaded.version,
      base: current?.base ?? loaded.fields,
      fields: withFieldValue(
        current?.fields ?? loaded.fields,
        fieldId,
        loaded.locales.en,
        toLink('Asset', asset.id),
      ),
    });
    return entrySaveKey(entryId);
  };

  const canReplace = ({ address }: DropTarget) => {
    const resource = recordResourceOf(address.contentTypeId);
    const canEdit = resource
      ? canEditRecords(permissions, resource)
      : permissions.includes(AdminPermission.CONTENT_EDIT);
    return canEdit && permissions.includes(AdminPermission.MEDIA_MANAGE);
  };

  const replace = async (dropTarget: DropTarget, file: File) => {
    const { announce } = useSiteEditorStore.getState();
    if (!canReplace(dropTarget)) {
      announce(t.drop.noRight);
      setTarget(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setTarget(dropTarget);
    setPreviewUrl(objectUrl);
    setUploading(true);
    announce(t.drop.uploading);
    try {
      const prepared = await prepareImage(file);
      const asset = await uploadEditorAsset({
        ...prepared,
        title: file.name.replace(/\.[^.]+$/, '') || 'Image',
      });
      await flushDrafts(await applyAsset(dropTarget, asset));
      announce(t.drop.replaced);
    } catch {
      announce(t.drop.failed);
    } finally {
      setUploading(false);
      setTarget(null);
      setPreviewUrl(null);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const replaceRef = useRef(replace);
  replaceRef.current = replace;

  useEffect(() => {
    if (!enabled) {
      setTarget(null);
      return;
    }
    let current: DropTarget | null = null;
    const update = (next: DropTarget | null) => {
      if (next?.element === current?.element) return;
      current = next;
      setTarget(next);
    };
    const handleOver = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      const next = targetAt(event.clientX, event.clientY);
      update(next);
      if (!next) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    };
    const handleLeave = (event: DragEvent) => {
      if (!event.relatedTarget) update(null);
    };
    const handleDrop = (event: DragEvent) => {
      const file = event.dataTransfer?.files[0];
      const dropTarget = current ?? targetAt(event.clientX, event.clientY);
      if (!dropTarget || !file) {
        update(null);
        return;
      }
      event.preventDefault();
      current = null;
      void replaceRef.current(dropTarget, file);
    };
    document.addEventListener('dragover', handleOver);
    document.addEventListener('dragleave', handleLeave);
    document.addEventListener('drop', handleDrop);
    return () => {
      document.removeEventListener('dragover', handleOver);
      document.removeEventListener('dragleave', handleLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, [enabled]);

  return { target, isUploading, previewUrl, replace };
}

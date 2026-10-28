import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  AdminPermission,
  type ContentResourceKind,
  type RecordData,
  type RecordResource,
} from '@viratec/contracts';
import { useLocale } from '@/shared/i18n';
import { contentAssetIdFromUrl } from '@/shared/lib';
import {
  canEditRecords,
  isConflict,
  normalizeRecordData,
  recordLabel,
  sameValue,
  useContentChanges,
  useDeleteRecord,
  useDiscardChange,
  useEditorErrorMessage,
  useEditorRecord,
  usePublishContent,
  useSaveRecord,
  useSiteEditorMessages,
  writeRecordValue,
} from '@/widgets/site-editor';
import { useAdminMessages } from './messages';
import { adminKeys } from './queries';
import { useRunWithStepUp } from './stepUp';

const RESOURCE_KINDS: Record<RecordResource, ContentResourceKind> = {
  project: 'PROJECT',
  event: 'EVENT',
  publication: 'PUBLICATION',
};

type Feedback = { ok: boolean; text: string } | null;

export function useContentRecord(
  resource: RecordResource,
  key: string,
  permissions: readonly AdminPermission[],
  onClosed: () => void,
) {
  const locale = useLocale();
  const t = useAdminMessages();
  const editorT = useSiteEditorMessages();
  const queryClient = useQueryClient();
  const runWithStepUp = useRunWithStepUp();
  const record = useEditorRecord(resource, key);
  const changes = useContentChanges();
  const save = useSaveRecord();
  const remove = useDeleteRecord();
  const discard = useDiscardChange();
  const publish = usePublishContent();
  const [draft, setDraft] = useState<RecordData | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [confirming, setConfirming] = useState<'discard' | 'delete' | null>(null);
  const saveError = useEditorErrorMessage(save.error);
  const loadError = useEditorErrorMessage(record.error);
  const actionError = useEditorErrorMessage(remove.error ?? discard.error);

  const loaded = record.data;
  const data = draft ?? loaded?.data ?? {};
  const label = loaded ? recordLabel(resource, data, locale) : editorT.loading;
  const changeLabel = `${editorT.records.resource[resource]}: ${label}`;
  const change = changes.data?.find(
    (item) => item.resourceType === RESOURCE_KINDS[resource] && item.resourceId === key,
  );
  const assetIds = Object.values(loaded?.data ?? {}).flatMap((value) => {
    const assetId = typeof value === 'string' ? contentAssetIdFromUrl(value) : null;
    return assetId ? [assetId] : [];
  });
  const assetChangeIds = (changes.data ?? [])
    .filter((item) => item.resourceType === 'ASSET' && assetIds.includes(item.resourceId))
    .map((item) => item.id);
  const canEdit = canEditRecords(permissions, resource);
  const canPublish = permissions.includes(AdminPermission.CONTENT_PUBLISH);
  const isBusy = save.isPending || remove.isPending || discard.isPending || publish.isPending;

  const refreshList = () => queryClient.invalidateQueries({ queryKey: adminKeys.content() });

  const updateField = (path: string, value: unknown) => {
    if (!loaded) return;
    const next = writeRecordValue(data, path, value);
    setFeedback(null);
    setDraft(sameValue(next, loaded.data) ? null : next);
  };

  const submit = () => {
    if (!draft || !loaded) return;
    setFeedback(null);
    save.mutate(
      {
        resource,
        key,
        dto: {
          data: normalizeRecordData(resource, draft),
          baseUpdatedAt: loaded.updatedAt,
          label: changeLabel,
        },
      },
      {
        onSuccess: () => {
          setDraft(null);
          setFeedback({ ok: true, text: editorT.inspector.saved });
          void refreshList();
        },
      },
    );
  };

  const reload = () => {
    setDraft(null);
    save.reset();
    void record.refetch();
  };

  const publishNow = async () => {
    if (!change || draft) return;
    setFeedback(null);
    try {
      const result = await runWithStepUp(() =>
        publish.mutateAsync({ changeIds: [...assetChangeIds, change.id] }),
      );
      const [failed] = result.failed;
      setFeedback(
        failed
          ? { ok: false, text: t.content.publishFailed(failed.reason) }
          : { ok: true, text: t.content.published },
      );
      if (!failed && loaded?.isDeleted) onClosed();
    } catch (error) {
      setFeedback({
        ok: false,
        text: error instanceof Error && error.message ? error.message : editorT.loadFailed,
      });
    } finally {
      void refreshList();
    }
  };

  const discardChanges = () => {
    setConfirming(null);
    if (!change) return;
    setFeedback(null);
    discard.mutate(change, {
      onSuccess: () => {
        setDraft(null);
        void refreshList();
        if (change.isNew) onClosed();
      },
    });
  };

  const deleteRecord = () => {
    setConfirming(null);
    if (!loaded) return;
    setFeedback(null);
    remove.mutate(
      { resource, key, label: changeLabel },
      {
        onSuccess: () => {
          setDraft(null);
          void refreshList();
          if (loaded.isNew) onClosed();
        },
      },
    );
  };

  return {
    record,
    loaded,
    data,
    draft,
    label,
    change,
    canEdit: canEdit && !loaded?.isDeleted,
    canDelete: canEdit && Boolean(loaded) && !loaded?.isDeleted,
    canPublish,
    isBusy,
    isSaving: save.isPending,
    isPublishing: publish.isPending,
    isConflict: isConflict(save.error),
    saveError: isConflict(save.error) ? null : saveError,
    loadError,
    actionError,
    feedback,
    editorT,
    updateField,
    submit,
    reset: () => setDraft(null),
    reload,
    publishNow,
    confirming,
    askDiscard: () => setConfirming('discard'),
    askDelete: () => setConfirming('delete'),
    cancelConfirm: () => setConfirming(null),
    discardChanges,
    deleteRecord,
  };
}

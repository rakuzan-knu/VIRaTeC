import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recordResourceOf, type RestoreContentRevisionRequestDto } from '@viratec/contracts';
import { PREVIEW_CONTENT_QUERY_KEY } from '@/shared/lib';
import { fetchRevisions, restoreRevision } from '../api/editorApi';
import { entrySaveKey, recordSaveKey } from './autosave';
import { cancelDraftSave, flushDrafts } from './autosaveRegistry';
import { EDITOR_QUERY_KEY, refreshRecordQueries } from './queries';
import { recordDraftKey, useSiteEditorStore } from './store';

type RevisionResourceType = RestoreContentRevisionRequestDto['resourceType'];

const RECORD_TYPES = { project: 'PROJECT', event: 'EVENT', publication: 'PUBLICATION' } as const;

export const revisionResourceOf = (contentTypeId: string | undefined): RevisionResourceType => {
  const resource = recordResourceOf(contentTypeId);
  return resource ? RECORD_TYPES[resource] : 'ENTRY';
};

export function useRevisions(enabled: boolean, contentTypeId: string | undefined, id: string) {
  const queryClient = useQueryClient();
  const resourceType = revisionResourceOf(contentTypeId);
  const list = useQuery({
    queryKey: [...EDITOR_QUERY_KEY, 'revisions', resourceType, id],
    queryFn: () => fetchRevisions(resourceType, id),
    enabled,
    staleTime: 0,
  });

  const restore = useMutation({
    mutationFn: async ({ revisionId, label }: { revisionId: string; label: string }) => {
      const resource = recordResourceOf(contentTypeId);
      const saveKey = resource ? recordSaveKey(recordDraftKey(resource, id)) : entrySaveKey(id);
      await flushDrafts(saveKey);
      cancelDraftSave(saveKey);
      const store = useSiteEditorStore.getState();
      if (resource) store.dropRecordDraft(recordDraftKey(resource, id));
      else store.dropDraft(id);
      return restoreRevision({ resourceType, resourceId: id, revisionId, label });
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: EDITOR_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: PREVIEW_CONTENT_QUERY_KEY }),
        refreshRecordQueries(queryClient),
      ]),
  });

  return { list, restore };
}

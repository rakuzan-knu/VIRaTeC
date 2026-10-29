import { api } from '@/shared/api/apiClient';
import type { ContentSearchSource } from '../model/siteSearch';
import type {
  ContentAssetDto,
  ContentChangeDto,
  ContentEntryDto,
  ContentReferenceDto,
  CreateContentEntryRequestDto,
  CreateRecordRequestDto,
  PublishContentRequestDto,
  PublishContentResultDto,
  RecordDraftDto,
  RecordDto,
  RecordResource,
  SaveContentEntryRequestDto,
  SaveRecordRequestDto,
  TranslateContentRequestDto,
  UpdatePresenceRequestDto,
  EditorPresenceDto,
  ContentRevisionDto,
  RestoreContentRevisionRequestDto,
  TranslateContentResultDto,
  UploadContentAssetRequestDto,
} from '@viratec/contracts';

const entryPath = (id: string) => `/admin/content/entries/${encodeURIComponent(id)}`;

export const fetchEditorEntry = (id: string) => api.get<ContentEntryDto>(entryPath(id));

export const fetchEntryReferences = (id: string) =>
  api.get<ContentReferenceDto[]>(`${entryPath(id)}/references`);

export const saveEditorEntry = (id: string, dto: SaveContentEntryRequestDto) =>
  api.put<ContentEntryDto>(entryPath(id), dto);

export const deleteEditorEntry = (id: string, label: string) =>
  api.delete<{ success: boolean }>(entryPath(id), { label });

export const createEditorEntry = (dto: CreateContentEntryRequestDto) =>
  api.post<ContentEntryDto>('/admin/content/entries', dto);

export const uploadEditorAsset = (dto: UploadContentAssetRequestDto) =>
  api.post<ContentAssetDto>('/admin/content/assets', dto);

export const fetchContentChanges = () => api.get<ContentChangeDto[]>('/admin/content/changes');

export const discardContentChange = (id: string) =>
  api.delete<{ success: boolean }>(`/admin/content/changes/${encodeURIComponent(id)}`);

export const publishContent = (dto: PublishContentRequestDto) =>
  api.post<PublishContentResultDto>('/admin/content/publish', dto);

export const fetchEditorAsset = (id: string) =>
  api.get<ContentAssetDto>(`/admin/content/assets/${encodeURIComponent(id)}`);

const RECORD_LIST_PATHS: Record<RecordResource, string> = {
  project: '/projects',
  publication: '/publications',
  event: '/events',
};

const recordPath = (resource: RecordResource, key?: string) =>
  `/admin/records/${resource}${key ? `/${encodeURIComponent(key)}` : ''}`;

export const fetchRecord = (resource: RecordResource, key: string) =>
  api.get<RecordDto>(recordPath(resource, key));

export const saveRecord = (resource: RecordResource, key: string, dto: SaveRecordRequestDto) =>
  api.put<RecordDto>(recordPath(resource, key), dto);

export const createRecord = (resource: RecordResource, dto: CreateRecordRequestDto) =>
  api.post<RecordDto>(recordPath(resource), dto);

export const deleteRecord = (resource: RecordResource, key: string, label: string) =>
  api.delete<{ success: boolean }>(recordPath(resource, key), { label });

export const fetchRecordDrafts = () => api.get<RecordDraftDto[]>('/admin/records/drafts');

export const fetchContentForSearch = (types: readonly string[]) =>
  api.get<ContentSearchSource>(
    `/admin/content/preview?types=${encodeURIComponent(types.join(','))}`,
  );

export const fetchRecordList = <T>(resource: RecordResource) =>
  api.get<T[]>(RECORD_LIST_PATHS[resource]);

export const updatePresence = (dto: UpdatePresenceRequestDto) =>
  api.put<EditorPresenceDto[]>('/admin/content/presence', dto);

export const translateTexts = (dto: TranslateContentRequestDto) =>
  api.post<TranslateContentResultDto>('/admin/content/translate', dto);

export const fetchRevisions = (
  resourceType: RestoreContentRevisionRequestDto['resourceType'],
  resourceId: string,
) =>
  api.get<ContentRevisionDto[]>(
    `/admin/content/revisions?resourceType=${resourceType}&resourceId=${encodeURIComponent(resourceId)}`,
  );

export const restoreRevision = (dto: RestoreContentRevisionRequestDto) =>
  api.post<{ success: boolean }>('/admin/content/revisions/restore', dto);

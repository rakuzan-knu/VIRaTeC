import { api } from '@/shared/api/apiClient';
import type {
  AdminMetricsDto,
  AdminPage,
  AdminPermission,
  AdminUserDto,
  AuditLogEntryDto,
  RecordData,
  RecordDraftDto,
  RecordResource,
  StaffRole,
  UpdateStaffAccessRequestDto,
} from '@viratec/contracts';

export interface AdminCapabilities {
  staffRole: StaffRole;
  permissions: AdminPermission[];
  elevatedUntil: string | null;
}

export interface AdminUsersQuery {
  search: string;
  page: number;
  staffOnly: boolean;
}

const toQueryString = (params: Record<string, string | number | boolean | undefined>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== false) search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
};

export const fetchAdminCapabilities = () => api.get<AdminCapabilities>('/admin/me');

export const fetchAdminMetrics = () => api.get<AdminMetricsDto>('/admin/metrics');

export const fetchAdminUsers = ({ search, page, staffOnly }: AdminUsersQuery) =>
  api.get<AdminPage<AdminUserDto>>(`/admin/users${toQueryString({ search, page, staffOnly })}`);

export const fetchAuditLog = (page: number, action: string) =>
  api.get<AdminPage<AuditLogEntryDto>>(`/admin/audit${toQueryString({ page, action })}`);

export const updateStaffAccess = (userId: string, dto: UpdateStaffAccessRequestDto) =>
  api.put<AdminUserDto>(`/admin/users/${encodeURIComponent(userId)}/access`, dto);

export const revokeStaffAccess = (userId: string) =>
  api.delete<AdminUserDto>(`/admin/users/${encodeURIComponent(userId)}/access`);

export const setUserBlocked = (userId: string, blocked: boolean) =>
  api.post<AdminUserDto>(`/admin/users/${encodeURIComponent(userId)}/block`, { blocked });

export const revokeUserSessions = (userId: string) =>
  api.post<{ success: boolean }>(
    `/admin/users/${encodeURIComponent(userId)}/sessions/revoke`,
    undefined,
  );

export type ContentItemStatus = 'published' | 'draft' | 'new' | 'deleted';

export interface ContentListItem {
  key: string;
  data: RecordData;
  status: ContentItemStatus;
}

const CONTENT_LIST_PATHS: Record<RecordResource, string> = {
  publication: '/publications',
  event: '/events?limit=100',
  project: '/projects?limit=100',
};

const contentKeyOf = (resource: RecordResource, data: RecordData) =>
  String(resource === 'publication' ? data.slug : data.id);

const draftStatus = (draft: RecordDraftDto): ContentItemStatus =>
  draft.isDeleted ? 'deleted' : draft.isNew ? 'new' : 'draft';

export const fetchContentList = async (resource: RecordResource): Promise<ContentListItem[]> => {
  const [published, drafts] = await Promise.all([
    api.get<RecordData[]>(CONTENT_LIST_PATHS[resource], { cache: 'no-cache' }),
    api.get<RecordDraftDto[]>('/admin/records/drafts'),
  ]);
  const own = new Map(
    drafts.filter((draft) => draft.resource === resource).map((draft) => [draft.key, draft]),
  );
  const existing = published.map((data): ContentListItem => {
    const key = contentKeyOf(resource, data);
    const draft = own.get(key);
    own.delete(key);
    return draft
      ? { key, data: { ...data, ...draft.data }, status: draftStatus(draft) }
      : { key, data, status: 'published' };
  });
  const created = [...own.values()].map((draft): ContentListItem => ({
    key: draft.key,
    data: draft.data,
    status: draftStatus(draft),
  }));
  return [...created, ...existing];
};

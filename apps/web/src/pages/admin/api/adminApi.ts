import { api } from '@/shared/api/apiClient';
import type {
  AdminMetricsDto,
  AdminPage,
  AdminPermission,
  AdminUserDto,
  AuditLogEntryDto,
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

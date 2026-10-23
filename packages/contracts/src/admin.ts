import { z } from 'zod';
import {
  AdminPermission,
  EventType,
  ProjectStatus,
  PublicationType,
  StaffRole,
  UserRole,
} from './enums.js';

export const ALL_ADMIN_PERMISSIONS = Object.values(AdminPermission);

export const ADMIN_PERMISSION_PRESETS = {
  contentEditor: [
    AdminPermission.DASHBOARD_VIEW,
    AdminPermission.CONTENT_VIEW,
    AdminPermission.CONTENT_EDIT,
    AdminPermission.CONTENT_PUBLISH,
    AdminPermission.MEDIA_MANAGE,
  ],
  eventsModerator: [
    AdminPermission.DASHBOARD_VIEW,
    AdminPermission.EVENTS_MANAGE,
    AdminPermission.CONTENT_VIEW,
  ],
  readOnly: [
    AdminPermission.DASHBOARD_VIEW,
    AdminPermission.USERS_VIEW,
    AdminPermission.CONTENT_VIEW,
    AdminPermission.AUDIT_VIEW,
  ],
} as const satisfies Record<string, AdminPermission[]>;

export type AdminPermissionPreset = keyof typeof ADMIN_PERMISSION_PRESETS;

export const AdminMetricsSchema = z.object({
  users: z.object({
    total: z.number(),
    last7Days: z.number(),
    last30Days: z.number(),
    blocked: z.number(),
    byRole: z.record(z.nativeEnum(UserRole), z.number()),
  }),
  staff: z.object({
    admins: z.number(),
    withTwoFactor: z.number(),
  }),
  projects: z.object({
    total: z.number(),
    byStatus: z.record(z.nativeEnum(ProjectStatus), z.number()),
  }),
  events: z.object({
    total: z.number(),
    upcoming: z.number(),
    past: z.number(),
    byType: z.record(z.nativeEnum(EventType), z.number()),
  }),
  research: z.object({ papers: z.number() }),
  publications: z.object({
    total: z.number(),
    byType: z.record(z.nativeEnum(PublicationType), z.number()),
  }),
  community: z.object({ posts: z.number() }),
  sessions: z.object({ active: z.number() }),
  generatedAt: z.string(),
});

export type AdminMetricsDto = z.infer<typeof AdminMetricsSchema>;

export const AdminUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.nativeEnum(UserRole),
  staffRole: z.nativeEnum(StaffRole),
  permissions: z.array(z.nativeEnum(AdminPermission)),
  staffExpiresAt: z.string().nullable(),
  twoFactorEnabled: z.boolean(),
  isBlocked: z.boolean(),
  createdAt: z.string(),
});

export type AdminUserDto = z.infer<typeof AdminUserSchema>;

export const ADMIN_PAGE_SIZE = 20;

export interface AdminPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const UpdateStaffAccessRequestSchema = z.object({
  staffRole: z.enum([StaffRole.NONE, StaffRole.ADMIN]),
  permissions: z.array(z.nativeEnum(AdminPermission)).max(ALL_ADMIN_PERMISSIONS.length),
  expiresAt: z.string().datetime().nullable().optional(),
});

export type UpdateStaffAccessRequestDto = z.infer<typeof UpdateStaffAccessRequestSchema>;

export const AuditLogEntrySchema = z.object({
  id: z.string(),
  action: z.string(),
  actor: z.object({ id: z.string(), name: z.string(), email: z.string() }).nullable(),
  targetType: z.string().nullable(),
  targetId: z.string().nullable(),
  metadata: z.record(z.unknown()),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.string(),
});

export type AuditLogEntryDto = z.infer<typeof AuditLogEntrySchema>;

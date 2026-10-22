import { AdminPermission, ALL_ADMIN_PERMISSIONS, StaffRole } from '@viratec/contracts';

export interface StaffFields {
  staffRole: StaffRole | `${StaffRole}`;
  permissions: (AdminPermission | `${AdminPermission}`)[];
  staffExpiresAt: Date | null;
}

export interface EffectiveStaff {
  staffRole: StaffRole;
  permissions: AdminPermission[];
}

export function effectiveStaff(user: StaffFields, now = new Date()): EffectiveStaff {
  if (user.staffRole === StaffRole.OWNER) {
    return { staffRole: StaffRole.OWNER, permissions: [...ALL_ADMIN_PERMISSIONS] };
  }
  if (user.staffRole === StaffRole.ADMIN && (!user.staffExpiresAt || user.staffExpiresAt > now)) {
    return { staffRole: StaffRole.ADMIN, permissions: user.permissions as AdminPermission[] };
  }
  return { staffRole: StaffRole.NONE, permissions: [] };
}

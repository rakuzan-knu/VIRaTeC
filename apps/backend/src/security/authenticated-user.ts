import type { AdminPermission, StaffRole } from '@viratec/contracts';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  faculty: string;
  sessionId?: string;
  staffRole: StaffRole;
  permissions: AdminPermission[];
  twoFactorEnabled: boolean;
  mfaVerifiedAt: Date | null;
  elevatedUntil: Date | null;
}

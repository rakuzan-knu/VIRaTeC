import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminPermission, StaffRole } from '@viratec/contracts';
import { OWNER_ONLY_KEY, PERMISSIONS_KEY, STEP_UP_KEY } from '../decorators/staff.decorator';
import type { AuthenticatedUser } from '../../security/authenticated-user';

export const STAFF_SESSION_MAX_AGE_MS = 12 * 60 * 60_000;

export type StaffAccessErrorCode =
  | 'ADMIN_ACCESS_REQUIRED'
  | 'MFA_SETUP_REQUIRED'
  | 'MFA_REVERIFY_REQUIRED'
  | 'OWNER_REQUIRED'
  | 'PERMISSION_DENIED'
  | 'STEP_UP_REQUIRED';

const deny = (code: StaffAccessErrorCode, message: string) =>
  new ForbiddenException({ message, code });

@Injectable()
export class StaffGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private read<T>(key: string, context: ExecutionContext) {
    return this.reflector.getAllAndOverride<T | undefined>(key, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>().user;

    if (!user || user.staffRole === StaffRole.NONE) {
      throw deny('ADMIN_ACCESS_REQUIRED', 'Administrator access is required');
    }
    if (!user.twoFactorEnabled) {
      throw deny('MFA_SETUP_REQUIRED', 'Enable two-factor authentication to continue');
    }
    if (
      !user.mfaVerifiedAt ||
      Date.now() - user.mfaVerifiedAt.getTime() > STAFF_SESSION_MAX_AGE_MS
    ) {
      throw deny('MFA_REVERIFY_REQUIRED', 'Confirm your identity with a two-factor code');
    }

    if (this.read<boolean>(OWNER_ONLY_KEY, context) && user.staffRole !== StaffRole.OWNER) {
      throw deny('OWNER_REQUIRED', 'Only the owner can perform this action');
    }

    const required = this.read<AdminPermission[]>(PERMISSIONS_KEY, context) ?? [];
    if (!required.every((permission) => user.permissions.includes(permission))) {
      throw deny('PERMISSION_DENIED', 'You do not have permission to perform this action');
    }

    if (
      this.read<boolean>(STEP_UP_KEY, context) &&
      (!user.elevatedUntil || user.elevatedUntil.getTime() < Date.now())
    ) {
      throw deny('STEP_UP_REQUIRED', 'Confirm this action with a two-factor code');
    }

    return true;
  }
}

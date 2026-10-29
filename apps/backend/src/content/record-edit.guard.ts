import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AdminPermission } from '@viratec/contracts';
import type { AuthenticatedUser } from '../security/authenticated-user';

export const canEditRecord = (user: AuthenticatedUser, resource: string | undefined) =>
  user.permissions.includes(AdminPermission.CONTENT_EDIT) ||
  (resource === 'event' && user.permissions.includes(AdminPermission.EVENTS_MANAGE));

export const recordEditDenied = () =>
  new ForbiddenException({
    message: 'You do not have permission to perform this action',
    code: 'PERMISSION_DENIED',
  });

@Injectable()
export class RecordEditGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
      params: Record<string, string | undefined>;
    }>();
    if (!request.user || !canEditRecord(request.user, request.params.resource)) {
      throw recordEditDenied();
    }
    return true;
  }
}

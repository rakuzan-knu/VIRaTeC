import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../../security/authenticated-user';

@Injectable()
export class VerifiedEmailGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>().user;
    if (!user?.emailVerified) {
      throw new ForbiddenException({
        message: 'Confirm your email address to continue',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }
    return true;
  }
}

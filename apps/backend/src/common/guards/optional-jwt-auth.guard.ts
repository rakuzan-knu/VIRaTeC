import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { cookieNames } from '../../auth/session-cookies';

const ACCESS_COOKIE_NAMES = [cookieNames(false).access, cookieNames(true).access];

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, unknown>;
      cookies?: Record<string, string | undefined>;
    }>();
    const hasCookie = ACCESS_COOKIE_NAMES.some((name) => Boolean(request.cookies?.[name]));
    if (!request.headers.authorization && !hasCookie) return true;
    return super.canActivate(context);
  }
}

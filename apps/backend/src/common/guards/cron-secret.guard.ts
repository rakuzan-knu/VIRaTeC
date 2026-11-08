import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { safeEqual } from '../../security/crypto';

@Injectable()
export class CronSecretGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const secret = this.config.get<string>('cron.secret') ?? '';
    if (!secret) {
      throw new ServiceUnavailableException({
        message: 'Scheduled jobs are not configured',
        code: 'CRON_NOT_CONFIGURED',
      });
    }

    const { authorization } = context
      .switchToHttp()
      .getRequest<{ headers: { authorization?: string } }>().headers;
    if (typeof authorization !== 'string' || !safeEqual(authorization, `Bearer ${secret}`)) {
      throw new UnauthorizedException({
        message: 'Invalid scheduler credentials',
        code: 'CRON_UNAUTHORIZED',
      });
    }
    return true;
  }
}

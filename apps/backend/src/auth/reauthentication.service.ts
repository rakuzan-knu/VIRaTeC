import {
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import * as argon2 from 'argon2';
import { RATE_LIMITS, RateLimitService } from '../security/rate-limit.service';
import type { ClientContext } from '../common/decorators/client-context.decorator';
import { AuthService } from './auth.service';
import { TwoFactorService } from './two-factor.service';

const GOOGLE_CREDENTIAL_MAX_AGE_SECONDS = 10 * 60;

export type ReauthenticationErrorCode =
  'PASSWORD_INCORRECT' | 'GOOGLE_REAUTH_REQUIRED' | 'TWO_FACTOR_REQUIRED' | 'TWO_FACTOR_INVALID';

export interface ReauthenticationProof {
  password?: string;
  code?: string;
  googleCredential?: string;
}

type ReauthenticationSubject = Pick<User, 'id' | 'passwordHash' | 'googleId' | 'twoFactorEnabled'>;

const denied = (message: string, code: ReauthenticationErrorCode) =>
  new ForbiddenException({ message, code });

@Injectable()
export class ReauthenticationService {
  constructor(
    private rateLimit: RateLimitService,
    private twoFactor?: TwoFactorService,
    private auth?: AuthService,
  ) {}

  async confirm(
    user: ReauthenticationSubject,
    proof: ReauthenticationProof,
    client: ClientContext = {},
  ) {
    const checkKey = `password:check:${user.id}`;
    await this.rateLimit.consume(checkKey, RATE_LIMITS.passwordCheckPerAccount);

    if (user.passwordHash) {
      const isValid = !!proof.password && (await argon2.verify(user.passwordHash, proof.password));
      if (!isValid) throw denied('Password is incorrect', 'PASSWORD_INCORRECT');
    } else {
      await this.confirmGoogle(user, proof.googleCredential);
    }

    if (user.twoFactorEnabled) await this.confirmSecondFactor(user.id, proof.code, client);
    await this.rateLimit.reset(checkKey);
  }

  private async confirmGoogle(user: ReauthenticationSubject, credential: string | undefined) {
    const required = () => denied('Confirm with your Google account', 'GOOGLE_REAUTH_REQUIRED');
    if (!credential || !user.googleId) throw required();
    if (!this.auth) throw new ServiceUnavailableException('Google sign-in is unavailable');

    const payload = await this.auth.verifyGoogleCredential(credential).catch((error: unknown) => {
      if (error instanceof UnauthorizedException) throw required();
      throw error;
    });
    const age = Math.floor(Date.now() / 1000) - (payload.iat ?? 0);
    if (payload.sub !== user.googleId || age > GOOGLE_CREDENTIAL_MAX_AGE_SECONDS) throw required();
  }

  private async confirmSecondFactor(
    userId: string,
    code: string | undefined,
    client: ClientContext,
  ) {
    if (!code) throw denied('Enter your two-step verification code', 'TWO_FACTOR_REQUIRED');
    if (!this.twoFactor) throw new ServiceUnavailableException('Two-factor is unavailable');

    await this.twoFactor.requireSecondFactor(userId, code, client).catch((error: unknown) => {
      if (error instanceof UnauthorizedException) {
        throw denied('The code is incorrect or expired', 'TWO_FACTOR_INVALID');
      }
      throw error;
    });
  }
}

import {
  BadRequestException,
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';
import { OAuth2Client, type TokenPayload } from 'google-auth-library';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { UserRole } from '@viratec/contracts';
import { toAccount } from '../users/account';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { ClientContext } from '../common/decorators/client-context.decorator';
import { AuditService } from '../security/audit.service';
import { RATE_LIMITS, RateLimitService } from '../security/rate-limit.service';
import { randomToken, sha256Hex } from '../security/crypto';
import { TwoFactorService } from './two-factor.service';

const MFA_CHALLENGE_TTL_MS = 5 * 60_000;
const MFA_CHALLENGE_MAX_ATTEMPTS = 5;
const DEFAULT_REFRESH_TTL_MS = 7 * 24 * 60 * 60_000;

interface SessionCarry {
  mfaVerifiedAt?: Date | null;
  elevatedUntil?: Date | null;
}

interface SignInUser extends TokenSubject {
  isBlocked: boolean;
  twoFactorEnabled: boolean;
}

interface TokenSubject {
  id: string;
  email: string;
  role: string;
  faculty: string;
}

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private audit?: AuditService,
    private rateLimit?: RateLimitService,
    private twoFactor?: TwoFactorService,
  ) {}

  async register(dto: RegisterDto, client: ClientContext = {}) {
    if (client.ipAddress) {
      await this.rateLimit?.consume(`register:ip:${client.ipAddress}`, RATE_LIMITS.registerPerIp);
    }
    if (dto.role && dto.role !== UserRole.STUDENT && dto.role !== UserRole.PARTNER) {
      throw new ForbiddenException('Privileged roles cannot be selected during registration');
    }

    const [existing, passwordHash] = await Promise.all([
      this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
        select: { id: true },
      }),
      argon2.hash(dto.password),
    ]);

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
        role: dto.role,
        faculty: dto.faculty,
        department: dto.department,
      },
    });

    const tokens = await this.generateTokens(user, client);
    return {
      user: toAccount(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto, client: ClientContext = {}) {
    const email = dto.email.toLowerCase();
    const accountKey = `login:account:${sha256Hex(email)}`;
    await Promise.all([
      this.rateLimit?.consume(accountKey, RATE_LIMITS.loginPerAccount),
      client.ipAddress
        ? this.rateLimit?.consume(`login:ip:${client.ipAddress}`, RATE_LIMITS.loginPerIp)
        : undefined,
    ]);

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('This account uses Google sign-in');
    }

    const isValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isValid) {
      void this.audit?.record({ action: 'auth.login_failed', actorId: user.id, client });
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.rateLimit?.reset(accountKey);
    return this.completeSignIn(user, client);
  }

  private async completeSignIn<T extends SignInUser>(user: T, client: ClientContext) {
    if (user.isBlocked) {
      void this.audit?.record({ action: 'auth.login_blocked', actorId: user.id, client });
      throw new ForbiddenException('This account has been suspended');
    }

    if (user.twoFactorEnabled) {
      const challengeToken = randomToken();
      await this.prisma.mfaChallenge.create({
        data: {
          userId: user.id,
          tokenHash: sha256Hex(challengeToken),
          expiresAt: new Date(Date.now() + MFA_CHALLENGE_TTL_MS),
          userAgent: client.userAgent ?? null,
          ipAddress: client.ipAddress ?? null,
        },
      });
      return { mfaRequired: true as const, challengeToken };
    }

    const tokens = await this.generateTokens(user, client);
    void this.audit?.record({ action: 'auth.login', actorId: user.id, client });
    return {
      user: toAccount(user as unknown as Parameters<typeof toAccount>[0]),
      ...tokens,
    };
  }

  async verifyMfaChallenge(challengeToken: string, code: string, client: ClientContext = {}) {
    const challenge = await this.prisma.mfaChallenge.findUnique({
      where: { tokenHash: sha256Hex(challengeToken) },
      include: { user: true },
    });

    if (
      !challenge ||
      challenge.consumedAt ||
      challenge.expiresAt < new Date() ||
      challenge.attempts >= MFA_CHALLENGE_MAX_ATTEMPTS
    ) {
      throw new UnauthorizedException('The sign-in attempt has expired. Sign in again.');
    }

    await Promise.all([
      this.prisma.mfaChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      }),
      this.rateLimit?.consume(`mfa:login:${challenge.userId}`, RATE_LIMITS.mfaPerAccount),
    ]);

    if (!this.twoFactor)
      throw new ServiceUnavailableException('Two-factor verification is unavailable');
    await this.twoFactor.requireSecondFactor(challenge.userId, code, client);

    const { count } = await this.prisma.mfaChallenge.updateMany({
      where: { id: challenge.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    if (count === 0) {
      throw new UnauthorizedException('The sign-in attempt has expired. Sign in again.');
    }

    const { user } = challenge;
    if (user.isBlocked) {
      throw new ForbiddenException('This account has been suspended');
    }

    const [, tokens] = await Promise.all([
      this.rateLimit?.reset(`mfa:login:${user.id}`),
      this.generateTokens(user, client, randomUUID(), { mfaVerifiedAt: new Date() }),
    ]);
    void this.audit?.record({ action: 'auth.mfa_verified', actorId: user.id, client });
    void this.audit?.record({ action: 'auth.login', actorId: user.id, client });
    return { user: toAccount(user), ...tokens };
  }

  async googleAuth(dto: GoogleAuthDto, client: ClientContext = {}) {
    const payload = await this.verifyGoogleCredential(dto.credential);
    const email = payload.email.toLowerCase();

    let user = await this.prisma.user.findUnique({
      where: { googleId: payload.sub },
    });

    if (!user) {
      try {
        user = await this.prisma.user.create({
          data: {
            email,
            googleId: payload.sub,
            name: payload.name || email.split('@')[0],
            avatarUrl: payload.picture,
          },
        });
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
          throw error;
        }
        // A concurrent sign-in may have created this Google account. Email alone
        // never authorizes linking an existing account or issuing its tokens.
        user = await this.prisma.user.findUnique({ where: { googleId: payload.sub } });
        if (!user) {
          throw new ConflictException(
            'An account with this email already exists. Sign in using its existing method.',
          );
        }
      }
    }

    return this.completeSignIn(user, client);
  }

  private async verifyGoogleCredential(
    credential: string,
  ): Promise<TokenPayload & { email: string }> {
    const clientId = this.configService.get<string>('google.clientId');
    if (!clientId) {
      throw new ServiceUnavailableException('Google sign-in is not configured');
    }

    let payload: TokenPayload | undefined;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid Google credential');
    }

    if (!payload?.sub || !payload.email || !payload.email_verified) {
      throw new UnauthorizedException('Google account email is not verified');
    }

    return { ...payload, email: payload.email };
  }

  async refreshToken(refreshToken: string, client: ClientContext = {}) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: sha256Hex(refreshToken) },
      include: { user: true },
    });

    if (tokenRecord?.revoked) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: tokenRecord.userId, sessionId: tokenRecord.sessionId, revoked: false },
        data: { revoked: true },
      });
      void this.audit?.record({
        action: 'auth.refresh_reuse',
        actorId: tokenRecord.userId,
        metadata: { sessionId: tokenRecord.sessionId },
        client,
      });
    }

    if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (tokenRecord.user.isBlocked) {
      throw new ForbiddenException('This account has been suspended');
    }

    // Revoke old token and issue new pair (rotation)
    const { count } = await this.prisma.refreshToken.updateMany({
      where: { id: tokenRecord.id, revoked: false },
      data: { revoked: true },
    });
    if (count === 0) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = tokenRecord.user;
    const tokens = await this.generateTokens(user, client, tokenRecord.sessionId, {
      mfaVerifiedAt: tokenRecord.mfaVerifiedAt,
      elevatedUntil: tokenRecord.elevatedUntil,
    });
    return {
      user: toAccount(user),
      ...tokens,
    };
  }

  private async generateTokens(
    { id: userId, email, role, faculty }: TokenSubject,
    client: ClientContext = {},
    sessionId: string = randomUUID(),
    carry: SessionCarry = {},
  ) {
    const payload = { sub: userId, email, role, faculty, sid: sessionId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: (this.configService.get<string>('jwt.accessTtl') ||
          '15m') as JwtSignOptions['expiresIn'],
      }),
      this.jwtService.signAsync(
        { ...payload, jti: randomUUID() },
        {
          secret: this.configService.get<string>('jwt.refreshSecret'),
          expiresIn: (this.configService.get<string>('jwt.refreshTtl') ||
            '7d') as JwtSignOptions['expiresIn'],
        },
      ),
    ]);

    const refreshTtlMs =
      this.configService.get<number>('jwt.refreshTtlMs') ?? DEFAULT_REFRESH_TTL_MS;
    const expiresAt = new Date(Date.now() + refreshTtlMs);

    await this.prisma.refreshToken.create({
      data: {
        token: sha256Hex(refreshToken),
        userId,
        sessionId,
        mfaVerifiedAt: carry.mfaVerifiedAt ?? null,
        elevatedUntil: carry.elevatedUntil ?? null,
        userAgent: client.userAgent ?? null,
        ipAddress: client.ipAddress ?? null,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  async linkGoogle(userId: string, dto: GoogleAuthDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    if (user.googleId) {
      throw new ConflictException('A Google account is already connected');
    }

    const payload = await this.verifyGoogleCredential(dto.credential).catch((error: unknown) => {
      if (error instanceof UnauthorizedException) {
        throw new BadRequestException('Invalid Google credential');
      }
      throw error;
    });
    const owner = await this.prisma.user.findUnique({ where: { googleId: payload.sub } });
    if (owner) {
      throw new ConflictException('This Google account is connected to another VIRaTeC account');
    }

    try {
      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: { googleId: payload.sub, avatarUrl: user.avatarUrl ?? payload.picture },
      });
      return toAccount(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('This Google account is connected to another VIRaTeC account');
      }
      throw error;
    }
  }

  async unlinkGoogle(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    if (!user.passwordHash) {
      throw new BadRequestException('Set a password before disconnecting Google');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { googleId: null },
    });
    return toAccount(updated);
  }

  async getAccount(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return toAccount(user);
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: sha256Hex(refreshToken), revoked: false },
      data: { revoked: true },
    });
    return { success: true };
  }

  async logoutAll(userId: string) {
    await this.revokeAllSessions(userId);
    return { success: true };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    client: ClientContext = {},
    sessionId?: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    if (user.passwordHash) {
      const isValid =
        !!dto.currentPassword && (await argon2.verify(user.passwordHash, dto.currentPassword));
      if (!isValid) {
        throw new ForbiddenException('Current password is incorrect');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await argon2.hash(dto.newPassword) },
    });
    await this.revokeAllSessions(userId);

    const tokens = await this.generateTokens(updated, client, sessionId);
    return {
      user: toAccount(updated),
      ...tokens,
    };
  }

  private async revokeAllSessions(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  async listSessions(userId: string, currentSessionId?: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId, revoked: false, expiresAt: { gt: new Date() } },
      select: {
        sessionId: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: { lastUsedAt: 'desc' },
    });

    const sessions = new Map<string, (typeof tokens)[number]>();
    for (const token of tokens) {
      if (!sessions.has(token.sessionId)) sessions.set(token.sessionId, token);
    }

    return [...sessions.values()].map(({ sessionId, ...session }) => ({
      id: sessionId,
      ...session,
      isCurrent: sessionId === currentSessionId,
    }));
  }

  async eraseOtherSessions(userId: string, currentSessionId?: string) {
    const { count } = await this.prisma.refreshToken.deleteMany({
      where: currentSessionId
        ? { userId, sessionId: { not: currentSessionId } }
        : { userId, OR: [{ revoked: true }, { expiresAt: { lt: new Date() } }] },
    });
    return { removed: count };
  }

  async revokeSession(userId: string, sessionId: string) {
    const { count } = await this.prisma.refreshToken.updateMany({
      where: { userId, sessionId, revoked: false },
      data: { revoked: true },
    });
    if (count === 0) {
      throw new NotFoundException('Session not found');
    }
    return { success: true };
  }
}

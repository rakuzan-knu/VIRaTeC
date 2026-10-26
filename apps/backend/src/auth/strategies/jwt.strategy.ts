import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { FastifyRequest } from 'fastify';
import { PrismaService } from '../../prisma/prisma.service';
import { cookieNames, readCookie } from '../session-cookies';
import { effectiveStaff } from '../../security/staff';
import type { AuthenticatedUser } from '../../security/authenticated-user';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  faculty: string;
  sid?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const secure = configService.get<boolean>('security.cookieSecure') ?? false;
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: FastifyRequest) => readCookie(request, cookieNames(secure).access),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.accessSecret'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        faculty: true,
        isBlocked: true,
        staffRole: true,
        permissions: true,
        staffExpiresAt: true,
        twoFactorEnabled: true,
        refreshTokens: payload.sid
          ? {
              where: { sessionId: payload.sid, revoked: false, expiresAt: { gt: new Date() } },
              select: { id: true, mfaVerifiedAt: true, elevatedUntil: true },
              orderBy: { createdAt: 'desc' },
              take: 1,
            }
          : false,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('This account has been suspended');
    }

    const session = payload.sid ? user.refreshTokens[0] : undefined;
    if (payload.sid && !session) {
      throw new UnauthorizedException('Session has been revoked');
    }

    const staff = effectiveStaff(user);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      faculty: user.faculty,
      sessionId: payload.sid,
      staffRole: staff.staffRole,
      permissions: staff.permissions,
      twoFactorEnabled: user.twoFactorEnabled,
      mfaVerifiedAt: session?.mfaVerifiedAt ?? null,
      elevatedUntil: session?.elevatedUntil ?? null,
    };
  }
}

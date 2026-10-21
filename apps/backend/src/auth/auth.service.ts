import {
  Injectable,
  ConflictException,
  ForbiddenException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { OAuth2Client, type TokenPayload } from 'google-auth-library';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { UserRole } from '@viratec/contracts';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.role && dto.role !== UserRole.STUDENT && dto.role !== UserRole.PARTNER) {
      throw new ForbiddenException('Privileged roles cannot be selected during registration');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await argon2.hash(dto.password);

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

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.faculty);
    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('This account uses Google sign-in');
    }

    const isValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.faculty);
    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async googleAuth(dto: GoogleAuthDto) {
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

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.faculty);
    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
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

  async refreshToken(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke old token and issue new pair (rotation)
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revoked: true },
    });

    const user = tokenRecord.user;
    const tokens = await this.generateTokens(user.id, user.email, user.role, user.faculty);
    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  private async generateTokens(userId: string, email: string, role: string, faculty: string) {
    const payload = { sub: userId, email, role, faculty };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: (this.configService.get<string>('jwt.accessTtl') || '15m') as any,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: (this.configService.get<string>('jwt.refreshTtl') || '7d') as any,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: {
    id: string;
    email: string;
    name: string;
    role: any;
    faculty: any;
    department?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    skills: string[];
    createdAt: Date;
    updatedAt: Date;
  }) {
    const { passwordHash: _, googleId: __, ...safeUser } = user as any;
    return safeUser;
  }
}

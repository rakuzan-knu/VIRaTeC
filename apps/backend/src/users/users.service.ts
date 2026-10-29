import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, ProfileVisibility } from '@prisma/client';
import { ProfileLanguagesSchema, ProfileLinksSchema } from '@viratec/contracts';
import type { ZodType } from 'zod';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { RATE_LIMITS, RateLimitService } from '../security/rate-limit.service';
import { toAccount } from '../security/account';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UploadAvatarDto } from './dto/upload-avatar.dto';
import { buildAvatarUrl, parseAvatarImage } from './avatar';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { PUBLIC_PROFILE_SELECT, toPublicProfile, visibleTo } from './public-profile';

const RELATED_ITEMS_LIMIT = 6;

function parseWith<T>(schema: ZodType<T>, value: unknown, field: string): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new BadRequestException(`Invalid ${field}`);
  }
  return result.data;
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private rateLimit?: RateLimitService,
  ) {}

  async findAll(viewerId: string | null, query: ListUsersQueryDto) {
    const { q, openTo, faculty, studyLevel, country, language, page, pageSize } = query;
    const filters: Prisma.UserWhereInput[] = [
      visibleTo(viewerId),
      { emailVerifiedAt: { not: null } },
    ];

    if (q) {
      const contains = { contains: q, mode: Prisma.QueryMode.insensitive };
      filters.push({
        OR: [
          { name: contains },
          { institution: contains },
          { department: contains },
          { bio: contains },
          { skills: { has: q } },
        ],
      });
    }
    if (openTo) filters.push({ openTo: { has: openTo } });
    if (faculty) filters.push({ faculty });
    if (studyLevel) filters.push({ studyLevel });
    if (country) filters.push({ country });
    if (language) filters.push({ languages: { array_contains: [{ code: language }] } });

    const where: Prisma.UserWhereInput = { AND: filters };
    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: PUBLIC_PROFILE_SELECT,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: users.map(toPublicProfile),
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    };
  }

  async findPublicProfile(id: string, viewerId: string | null, memberId: string | null) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...PUBLIC_PROFILE_SELECT,
        emailVerifiedAt: true,
        projects: {
          select: { id: true, title: true, status: true },
          take: RELATED_ITEMS_LIMIT,
          orderBy: { createdAt: 'desc' },
        },
        papers: {
          select: { id: true, title: true, createdAt: true },
          take: RELATED_ITEMS_LIMIT,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const isOwner = viewerId !== null && viewerId === id;
    const isHidden = user?.visibility === ProfileVisibility.PRIVATE || !user?.emailVerifiedAt;
    if (!user || (isHidden && !isOwner)) {
      throw new NotFoundException('Profile not found');
    }
    if (user.visibility === ProfileVisibility.MEMBERS && !isOwner) {
      if (!viewerId) throw new UnauthorizedException('Sign in to view this profile');
      if (!memberId) {
        throw new ForbiddenException({
          message: 'Confirm your email address to view member profiles',
          code: 'EMAIL_NOT_VERIFIED',
        });
      }
    }

    const { projects, papers, emailVerifiedAt: _emailVerifiedAt, ...profile } = user;
    return { ...toPublicProfile(profile), isOwner, projects, papers };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const languages =
      dto.languages === undefined
        ? undefined
        : parseWith(ProfileLanguagesSchema, dto.languages, 'languages');
    const links =
      dto.links === undefined ? undefined : parseWith(ProfileLinksSchema, dto.links, 'links');

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        faculty: dto.faculty,
        department: dto.department === undefined ? undefined : dto.department || null,
        bio: dto.bio === undefined ? undefined : dto.bio || null,
        skills: dto.skills ? [...new Set(dto.skills)] : undefined,
        studyLevel: dto.studyLevel,
        studyYear: dto.studyYear,
        institution: dto.institution === undefined ? undefined : dto.institution || null,
        country: dto.country,
        languages: languages as Prisma.InputJsonValue | undefined,
        links: links as Prisma.InputJsonValue | undefined,
        openTo: dto.openTo ? [...new Set(dto.openTo)] : undefined,
      },
    });
    return toAccount(user);
  }

  async updatePrivacy(userId: string, dto: UpdatePrivacyDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { visibility: dto.visibility, showEmail: dto.showEmail },
    });
    return toAccount(user);
  }

  async exportData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        avatar: { select: { data: true, mimeType: true, updatedAt: true } },
        projects: true,
        papers: true,
        posts: true,
        savedItems: { select: { kind: true, refId: true, createdAt: true } },
        refreshTokens: {
          where: { revoked: false, expiresAt: { gt: new Date() } },
          select: {
            sessionId: true,
            userAgent: true,
            ipAddress: true,
            createdAt: true,
            lastUsedAt: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { avatar, projects, papers, posts, savedItems, refreshTokens, ...account } = user;
    return {
      exportedAt: new Date().toISOString(),
      format: 'viratec-account-export@1',
      account: toAccount(account),
      avatar: avatar
        ? {
            mimeType: avatar.mimeType,
            updatedAt: avatar.updatedAt,
            dataUrl: `data:${avatar.mimeType};base64,${Buffer.from(avatar.data).toString('base64')}`,
          }
        : null,
      projects,
      papers,
      communityPosts: posts,
      savedItems,
      activeSessions: refreshTokens,
    };
  }

  async uploadAvatar(userId: string, dto: UploadAvatarDto) {
    const { data, mimeType } = parseAvatarImage(dto.image);

    const user = await this.prisma.$transaction(async (tx) => {
      const avatar = await tx.userAvatar.upsert({
        where: { userId },
        create: { userId, data, mimeType },
        update: { data, mimeType },
        select: { updatedAt: true },
      });
      return tx.user.update({
        where: { id: userId },
        data: { avatarUrl: buildAvatarUrl(userId, avatar.updatedAt) },
      });
    });
    return toAccount(user);
  }

  async deleteAvatar(userId: string) {
    const [, user] = await this.prisma.$transaction([
      this.prisma.userAvatar.deleteMany({ where: { userId } }),
      this.prisma.user.update({ where: { id: userId }, data: { avatarUrl: null } }),
    ]);
    return toAccount(user);
  }

  async findAvatar(userId: string, viewerId: string | null) {
    const avatar = await this.prisma.userAvatar.findFirst({
      where: { userId, user: visibleTo(viewerId) },
      select: { data: true, mimeType: true, user: { select: { visibility: true } } },
    });
    if (!avatar) {
      throw new NotFoundException('Avatar not found');
    }
    return {
      data: avatar.data,
      mimeType: avatar.mimeType,
      isPublic: avatar.user.visibility === ProfileVisibility.PUBLIC,
    };
  }

  async deleteAccount(userId: string, dto: DeleteAccountDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.confirmation.trim().toLowerCase() !== user.email) {
      throw new BadRequestException('Confirmation does not match the account email');
    }

    if (user.passwordHash) {
      await this.rateLimit?.consume(
        `password:check:${userId}`,
        RATE_LIMITS.passwordCheckPerAccount,
      );
      const isValid = !!dto.password && (await argon2.verify(user.passwordHash, dto.password));
      if (!isValid) {
        throw new ForbiddenException('Password is incorrect');
      }
    }

    await this.prisma.user.delete({ where: { id: userId } });
    return { success: true };
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, ProfileVisibility, StaffRole } from '@prisma/client';
import { ProfileLanguagesSchema, ProfileLinksSchema } from '@viratec/contracts';
import type { ZodType } from 'zod';
import { PrismaService } from '../prisma/prisma.service';
import { RateLimitService } from '../security/rate-limit.service';
import { toAccount } from '../security/account';
import { ReauthenticationService } from '../auth/reauthentication.service';
import { SecurityMailService } from '../auth/security-mail.service';
import type { ClientContext } from '../common/decorators/client-context.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UploadAvatarDto } from './dto/upload-avatar.dto';
import { buildAvatarUrl, parseAvatarImage } from './avatar';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { PUBLIC_PROFILE_SELECT, toPublicProfile, visibleTo } from './public-profile';

const RELATED_ITEMS_LIMIT = 50;

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
    private reauthentication?: ReauthenticationService,
    private securityMail?: SecurityMailService,
  ) {}

  async findAll(viewerId: string | null, query: ListUsersQueryDto) {
    const { q, openTo, faculty, studyLevel, country, language, page, pageSize } = query;
    const filters: Prisma.UserWhereInput[] = [
      visibleTo(viewerId),
      { emailVerifiedAt: { not: null } },
      { isBlocked: false },
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
        isBlocked: true,
        projects: {
          select: { id: true, title: true, status: true },
          take: RELATED_ITEMS_LIMIT,
          orderBy: { createdAt: 'desc' },
        },
        papers: {
          select: { id: true, title: true, createdAt: true, doi: true, fileUrl: true },
          take: RELATED_ITEMS_LIMIT,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const isOwner = viewerId !== null && viewerId === id;
    const isHidden =
      user?.visibility === ProfileVisibility.PRIVATE || !user?.emailVerifiedAt || user.isBlocked;
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

    const {
      projects,
      papers,
      emailVerifiedAt: _emailVerifiedAt,
      isBlocked: _isBlocked,
      ...profile
    } = user;
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
        role: dto.role,
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
        postLikes: { select: { postId: true, createdAt: true } },
        auditActions: {
          select: { action: true, ipAddress: true, userAgent: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
        eventRegistrations: {
          select: {
            eventId: true,
            locale: true,
            timeZone: true,
            createdAt: true,
            event: { select: { title: true, startDate: true } },
          },
        },
        eventAttendances: {
          select: {
            eventId: true,
            joinedAt: true,
            event: { select: { title: true, startDate: true } },
          },
        },
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

    const {
      avatar,
      projects,
      papers,
      posts,
      savedItems,
      postLikes,
      auditActions,
      eventRegistrations,
      eventAttendances,
      refreshTokens,
      ...account
    } = user;
    return {
      exportedAt: new Date().toISOString(),
      format: 'viratec-account-export@1',
      account: toAccount(account),
      accountStatus: {
        isBlocked: account.isBlocked,
        emailVerifiedAt: account.emailVerifiedAt,
      },
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
      postLikes,
      securityLog: auditActions,
      savedItems,
      eventRegistrations,
      eventAttendances,
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

  async findAvatar(userId: string, memberId: string | null, viewerId: string | null = memberId) {
    const avatar = await this.prisma.userAvatar.findFirst({
      where: {
        userId,
        ...(viewerId === userId
          ? {}
          : {
              user: {
                AND: [
                  visibleTo(memberId),
                  { isBlocked: false },
                  { emailVerifiedAt: { not: null } },
                ],
              },
            }),
      },
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

  private async assertNotLastOwner(userId: string, staffRole: StaffRole) {
    if (staffRole !== StaffRole.OWNER) return;
    const otherOwners = await this.prisma.user.count({
      where: { staffRole: StaffRole.OWNER, id: { not: userId } },
    });
    if (otherOwners === 0) {
      throw new ConflictException({
        message: 'Transfer ownership before deleting the last owner account',
        code: 'LAST_OWNER',
      });
    }
  }

  async deleteAccount(userId: string, dto: DeleteAccountDto, client: ClientContext = {}) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.confirmation.trim().toLowerCase() !== user.email) {
      throw new BadRequestException('Confirmation does not match the account email');
    }

    await this.assertNotLastOwner(userId, user.staffRole);
    if (!this.reauthentication) {
      throw new ServiceUnavailableException('Identity confirmation is unavailable');
    }
    await this.reauthentication.confirm(user, dto, client);

    await this.prisma.$transaction(async (tx) => {
      await tx.communityPost.updateMany({
        where: { authorId: { not: userId }, likes: { some: { userId } } },
        data: { likesCount: { decrement: 1 } },
      });
      await tx.auditLog.updateMany({
        where: { actorId: userId },
        data: { ipAddress: null, userAgent: null },
      });
      await tx.auditLog.updateMany({ where: { targetId: userId }, data: { targetId: null } });
      await tx.user.delete({ where: { id: userId } });
    });
    await this.securityMail?.accountDeleted(user.email);
    return { success: true };
  }
}

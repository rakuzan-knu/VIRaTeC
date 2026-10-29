import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type User } from '@prisma/client';
import {
  ADMIN_PAGE_SIZE,
  AdminPermission,
  EventType,
  ProjectStatus,
  PublicationType,
  StaffRole,
  UserRole,
  type AdminMetricsDto,
  type AdminPage,
  type AdminUserDto,
  type AuditLogEntryDto,
} from '@viratec/contracts';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../security/audit.service';
import { effectiveStaff } from '../security/staff';
import type { ClientContext } from '../common/decorators/client-context.decorator';
import type { AuthenticatedUser } from '../security/authenticated-user';
import type { AuditQueryDto, ListUsersQueryDto, UpdateStaffAccessDto } from './dto/admin.dto';

const DAY_MS = 24 * 60 * 60_000;

interface MetricsRow {
  totalUsers: number;
  last7Days: number;
  last30Days: number;
  blocked: number;
  admins: number;
  staffWithTwoFactor: number;
  usersByRole: Record<string, number>;
  totalProjects: number;
  projectsByStatus: Record<string, number>;
  totalEvents: number;
  upcomingEvents: number;
  eventsByType: Record<string, number>;
  papers: number;
  totalPublications: number;
  publicationsByType: Record<string, number>;
  posts: number;
  activeSessions: number;
}

const countBy = <K extends string>(keys: K[], counts: Record<string, number>) =>
  Object.fromEntries(keys.map((key) => [key, counts[key] ?? 0])) as Record<K, number>;

function toAdminUser(user: User): AdminUserDto {
  const staff = effectiveStaff(user);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    staffRole: staff.staffRole,
    permissions: staff.permissions,
    staffExpiresAt: user.staffExpiresAt?.toISOString() ?? null,
    twoFactorEnabled: user.twoFactorEnabled,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt.toISOString(),
  };
}

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async metrics(): Promise<AdminMetricsDto> {
    const now = new Date();
    const [row] = await this.prisma.$queryRaw<MetricsRow[]>`
      WITH
        u AS (
          SELECT
            COUNT(*)::int AS "totalUsers",
            COUNT(*) FILTER (WHERE "createdAt" >= ${new Date(now.getTime() - 7 * DAY_MS)})::int AS "last7Days",
            COUNT(*) FILTER (WHERE "createdAt" >= ${new Date(now.getTime() - 30 * DAY_MS)})::int AS "last30Days",
            COUNT(*) FILTER (WHERE "isBlocked")::int AS "blocked",
            COUNT(*) FILTER (WHERE "staffRole" <> 'NONE')::int AS "admins",
            COUNT(*) FILTER (WHERE "staffRole" <> 'NONE' AND "twoFactorEnabled")::int AS "staffWithTwoFactor"
          FROM "users"
        ),
        ur AS (
          SELECT COALESCE(jsonb_object_agg("key", "count"), '{}'::jsonb) AS "usersByRole"
          FROM (SELECT "role"::text AS "key", COUNT(*)::int AS "count" FROM "users" GROUP BY "role") t
        ),
        p AS (
          SELECT
            COALESCE(SUM("count"), 0)::int AS "totalProjects",
            COALESCE(jsonb_object_agg("key", "count"), '{}'::jsonb) AS "projectsByStatus"
          FROM (SELECT "status"::text AS "key", COUNT(*)::int AS "count" FROM "projects" GROUP BY "status") t
        ),
        e AS (
          SELECT
            COUNT(*)::int AS "totalEvents",
            COUNT(*) FILTER (WHERE "startDate" >= ${now})::int AS "upcomingEvents"
          FROM "events"
        ),
        et AS (
          SELECT COALESCE(jsonb_object_agg("key", "count"), '{}'::jsonb) AS "eventsByType"
          FROM (SELECT "type"::text AS "key", COUNT(*)::int AS "count" FROM "events" GROUP BY "type") t
        ),
        pub AS (
          SELECT
            COALESCE(SUM("count"), 0)::int AS "totalPublications",
            COALESCE(jsonb_object_agg("key", "count"), '{}'::jsonb) AS "publicationsByType"
          FROM (SELECT "type"::text AS "key", COUNT(*)::int AS "count" FROM "publications" GROUP BY "type") t
        )
      SELECT
        u.*, ur.*, p.*, e.*, et.*, pub.*,
        (SELECT COUNT(*)::int FROM "research_papers") AS "papers",
        (SELECT COUNT(*)::int FROM "community_posts") AS "posts",
        (
          SELECT COUNT(DISTINCT "sessionId")::int FROM "refresh_tokens"
          WHERE NOT "revoked" AND "expiresAt" > ${now}
        ) AS "activeSessions"
      FROM u, ur, p, e, et, pub
    `;
    const {
      totalUsers,
      last7Days,
      last30Days,
      blocked,
      usersByRole,
      admins,
      staffWithTwoFactor,
      totalProjects,
      projectsByStatus,
      totalEvents,
      upcomingEvents,
      eventsByType,
      papers,
      totalPublications,
      publicationsByType,
      posts,
      activeSessions,
    } = row;

    return {
      users: {
        total: totalUsers,
        last7Days,
        last30Days,
        blocked,
        byRole: countBy(Object.values(UserRole), usersByRole),
      },
      staff: { admins, withTwoFactor: staffWithTwoFactor },
      projects: {
        total: totalProjects,
        byStatus: countBy(Object.values(ProjectStatus), projectsByStatus),
      },
      events: {
        total: totalEvents,
        upcoming: upcomingEvents,
        past: totalEvents - upcomingEvents,
        byType: countBy(Object.values(EventType), eventsByType),
      },
      research: { papers },
      publications: {
        total: totalPublications,
        byType: countBy(Object.values(PublicationType), publicationsByType),
      },
      community: { posts },
      sessions: { active: activeSessions },
      generatedAt: now.toISOString(),
    };
  }

  async listUsers({
    search,
    page = 1,
    staffOnly,
  }: ListUsersQueryDto): Promise<AdminPage<AdminUserDto>> {
    const term = search?.trim();
    const where: Prisma.UserWhereInput = {
      ...(term
        ? {
            OR: [
              { name: { contains: term, mode: 'insensitive' } },
              { email: { contains: term, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(staffOnly ? { staffRole: { not: StaffRole.NONE } } : {}),
    };

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: [{ staffRole: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * ADMIN_PAGE_SIZE,
        take: ADMIN_PAGE_SIZE,
      }),
    ]);

    return { items: users.map(toAdminUser), total, page, pageSize: ADMIN_PAGE_SIZE };
  }

  private async findTarget(id: string) {
    const target = await this.prisma.user.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('User not found');
    return target;
  }

  private assertVerified(target: User) {
    if (!target.emailVerifiedAt) {
      throw new ConflictException({
        message: 'The user must confirm their email address first',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }
  }

  private assertCanManage(actor: AuthenticatedUser, target: User) {
    if (actor.id === target.id) {
      throw new ForbiddenException('You cannot change your own access');
    }
    if (target.staffRole === StaffRole.OWNER) {
      throw new ForbiddenException('The owner account cannot be changed here');
    }
    if (actor.staffRole !== StaffRole.OWNER && target.staffRole !== StaffRole.NONE) {
      throw new ForbiddenException('Only the owner can manage administrators');
    }
  }

  private async revokeSessions(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  async updateAccess(
    actor: AuthenticatedUser,
    targetId: string,
    dto: UpdateStaffAccessDto,
    client: ClientContext,
  ) {
    const target = await this.findTarget(targetId);
    this.assertCanManage(actor, target);

    if (dto.staffRole === StaffRole.NONE) {
      return this.revokeAccess(actor, targetId, client);
    }

    if (dto.permissions.length === 0) {
      throw new BadRequestException('Select at least one permission');
    }
    this.assertVerified(target);
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    if (expiresAt && expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('The expiry date must be in the future');
    }

    const before = toAdminUser(target);
    const updated = await this.prisma.user.update({
      where: { id: targetId },
      data: {
        staffRole: StaffRole.ADMIN,
        permissions: dto.permissions,
        staffExpiresAt: expiresAt,
      },
    });
    const removed = before.permissions.filter(
      (permission) => !dto.permissions.includes(permission),
    );
    if (removed.length > 0) await this.revokeSessions(targetId);

    await this.audit.record({
      action: 'admin.access_updated',
      actorId: actor.id,
      targetType: 'user',
      targetId,
      metadata: {
        before: { staffRole: before.staffRole, permissions: before.permissions },
        after: { staffRole: StaffRole.ADMIN, permissions: dto.permissions },
        expiresAt: expiresAt?.toISOString() ?? null,
      },
      client,
    });
    return toAdminUser(updated);
  }

  async revokeAccess(actor: AuthenticatedUser, targetId: string, client: ClientContext) {
    const target = await this.findTarget(targetId);
    this.assertCanManage(actor, target);

    const updated = await this.prisma.user.update({
      where: { id: targetId },
      data: { staffRole: StaffRole.NONE, permissions: [], staffExpiresAt: null },
    });
    await this.revokeSessions(targetId);
    await this.audit.record({
      action: 'admin.access_revoked',
      actorId: actor.id,
      targetType: 'user',
      targetId,
      metadata: { previousPermissions: target.permissions },
      client,
    });
    return toAdminUser(updated);
  }

  async setBlocked(
    actor: AuthenticatedUser,
    targetId: string,
    blocked: boolean,
    client: ClientContext,
  ) {
    const target = await this.findTarget(targetId);
    this.assertCanManage(actor, target);

    const updated = await this.prisma.user.update({
      where: { id: targetId },
      data: blocked
        ? { isBlocked: true, staffRole: StaffRole.NONE, permissions: [], staffExpiresAt: null }
        : { isBlocked: false },
    });
    if (blocked) await this.revokeSessions(targetId);
    await this.audit.record({
      action: blocked ? 'admin.user_blocked' : 'admin.user_unblocked',
      actorId: actor.id,
      targetType: 'user',
      targetId,
      client,
    });
    return toAdminUser(updated);
  }

  async revokeUserSessions(actor: AuthenticatedUser, targetId: string, client: ClientContext) {
    const target = await this.findTarget(targetId);
    if (target.id !== actor.id) this.assertCanManage(actor, target);
    await this.revokeSessions(targetId);
    await this.audit.record({
      action: 'admin.sessions_revoked',
      actorId: actor.id,
      targetType: 'user',
      targetId,
      client,
    });
    return { success: true };
  }

  async transferOwnership(actor: AuthenticatedUser, targetId: string, client: ClientContext) {
    const target = await this.findTarget(targetId);
    if (target.id === actor.id) throw new BadRequestException('You already own this site');
    if (target.isBlocked) throw new BadRequestException('A suspended user cannot become the owner');
    this.assertVerified(target);
    if (!target.twoFactorEnabled) {
      throw new ConflictException('The new owner must enable two-factor authentication first');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: actor.id },
        data: {
          staffRole: StaffRole.ADMIN,
          permissions: Object.values(AdminPermission),
          staffExpiresAt: null,
        },
      }),
      this.prisma.user.update({
        where: { id: targetId },
        data: { staffRole: StaffRole.OWNER, permissions: [], staffExpiresAt: null },
      }),
    ]);
    await this.audit.record({
      action: 'admin.ownership_transferred',
      actorId: actor.id,
      targetType: 'user',
      targetId,
      client,
    });
    return { success: true };
  }

  async auditLog({ page = 1, action }: AuditQueryDto): Promise<AdminPage<AuditLogEntryDto>> {
    const where: Prisma.AuditLogWhereInput = action ? { action } : {};
    const [total, entries] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * ADMIN_PAGE_SIZE,
        take: ADMIN_PAGE_SIZE,
        include: { actor: { select: { id: true, name: true, email: true } } },
      }),
    ]);

    return {
      items: entries.map((entry) => ({
        id: entry.id,
        action: entry.action,
        actor: entry.actor,
        targetType: entry.targetType,
        targetId: entry.targetId,
        metadata: (entry.metadata ?? {}) as Record<string, unknown>,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        createdAt: entry.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize: ADMIN_PAGE_SIZE,
    };
  }
}

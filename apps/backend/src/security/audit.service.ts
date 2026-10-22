import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { ClientContext } from '../common/decorators/client-context.decorator';

export type AuditAction =
  | 'auth.login'
  | 'auth.login_failed'
  | 'auth.login_blocked'
  | 'auth.mfa_failed'
  | 'auth.mfa_verified'
  | 'auth.refresh_reuse'
  | 'auth.step_up'
  | 'auth.step_up_failed'
  | 'auth.2fa_enabled'
  | 'auth.2fa_disabled'
  | 'auth.backup_codes_regenerated'
  | 'auth.backup_code_used'
  | 'admin.access_updated'
  | 'admin.access_revoked'
  | 'admin.ownership_transferred'
  | 'admin.owner_assigned'
  | 'admin.user_blocked'
  | 'admin.user_unblocked'
  | 'admin.sessions_revoked';

export interface AuditEntry {
  action: AuditAction;
  actorId?: string | null;
  targetType?: string;
  targetId?: string;
  metadata?: Prisma.InputJsonObject;
  client?: ClientContext;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async record({ action, actorId, targetType, targetId, metadata, client }: AuditEntry) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action,
          actorId: actorId ?? null,
          targetType: targetType ?? null,
          targetId: targetId ?? null,
          metadata: metadata ?? {},
          ipAddress: client?.ipAddress ?? null,
          userAgent: client?.userAgent ?? null,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to write audit entry ${action}`, error as Error);
    }
  }
}

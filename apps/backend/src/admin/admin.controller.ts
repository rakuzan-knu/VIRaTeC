import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminPermission } from '@viratec/contracts';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StaffGuard } from '../common/guards/staff.guard';
import { OwnerOnly, RequirePermissions, RequireStepUp } from '../common/decorators/staff.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Client, type ClientContext } from '../common/decorators/client-context.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { AdminService } from './admin.service';
import {
  AuditQueryDto,
  BlockUserDto,
  ListUsersQueryDto,
  TransferOwnershipDto,
  UpdateStaffAccessDto,
} from './dto/admin.dto';

@ApiTags('Administration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StaffGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('me')
  @ApiOperation({ summary: 'Current administrator capabilities' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return {
      staffRole: user.staffRole,
      permissions: user.permissions,
      elevatedUntil: user.elevatedUntil?.toISOString() ?? null,
    };
  }

  @Get('metrics')
  @RequirePermissions(AdminPermission.DASHBOARD_VIEW)
  @ApiOperation({ summary: 'Dashboard metrics' })
  metrics() {
    return this.adminService.metrics();
  }

  @Get('users')
  @RequirePermissions(AdminPermission.USERS_VIEW)
  @ApiOperation({ summary: 'Search users' })
  users(@Query() query: ListUsersQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Put('users/:id/access')
  @OwnerOnly()
  @RequireStepUp()
  @ApiOperation({ summary: 'Grant or change administrator access (owner only)' })
  updateAccess(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStaffAccessDto,
    @Client() client: ClientContext,
  ) {
    return this.adminService.updateAccess(actor, id, dto, client);
  }

  @Delete('users/:id/access')
  @OwnerOnly()
  @ApiOperation({ summary: 'Revoke administrator access immediately (owner only)' })
  revokeAccess(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Client() client: ClientContext,
  ) {
    return this.adminService.revokeAccess(actor, id, client);
  }

  @Post('users/:id/block')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(AdminPermission.USERS_MANAGE)
  @RequireStepUp()
  @ApiOperation({ summary: 'Suspend or restore a user' })
  setBlocked(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: BlockUserDto,
    @Client() client: ClientContext,
  ) {
    return this.adminService.setBlocked(actor, id, dto.blocked, client);
  }

  @Post('users/:id/sessions/revoke')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(AdminPermission.USERS_MANAGE)
  @ApiOperation({ summary: 'Sign a user out of every device' })
  revokeSessions(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Client() client: ClientContext,
  ) {
    return this.adminService.revokeUserSessions(actor, id, client);
  }

  @Post('ownership/transfer')
  @HttpCode(HttpStatus.OK)
  @OwnerOnly()
  @RequireStepUp()
  @ApiOperation({ summary: 'Transfer site ownership (owner only)' })
  transferOwnership(
    @CurrentUser() actor: AuthenticatedUser,
    @Body() dto: TransferOwnershipDto,
    @Client() client: ClientContext,
  ) {
    return this.adminService.transferOwnership(actor, dto.userId, client);
  }

  @Get('audit')
  @RequirePermissions(AdminPermission.AUDIT_VIEW)
  @ApiOperation({ summary: 'Audit log' })
  audit(@Query() query: AuditQueryDto) {
    return this.adminService.auditLog(query);
  }
}

import { Body, Controller, Delete, Get, Header, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminPermission, type RecordResource } from '@viratec/contracts';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StaffGuard } from '../common/guards/staff.guard';
import { RequirePermissions } from '../common/decorators/staff.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Client, type ClientContext } from '../common/decorators/client-context.decorator';
import type { AuthenticatedUser } from '../security/authenticated-user';
import { CreateRecordDto, DeleteRecordDto, SaveRecordDto } from './dto/record-editor.dto';
import { RecordKeyPipe, RecordResourcePipe } from './record.pipes';
import { RecordEditorService } from './record-editor.service';

@ApiTags('Content editor')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StaffGuard)
@RequirePermissions(AdminPermission.CONTENT_VIEW)
@Controller('admin/records')
export class AdminRecordsController {
  constructor(private readonly records: RecordEditorService) {}

  @Get('drafts')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Unpublished drafts of projects, events and publications' })
  drafts() {
    return this.records.listDrafts();
  }

  @Get(':resource/:key')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'A record with its draft and published data' })
  record(
    @Param('resource', RecordResourcePipe) resource: RecordResource,
    @Param('key', RecordKeyPipe) key: string,
  ) {
    return this.records.getRecord(resource, key);
  }

  @Put(':resource/:key')
  @ApiOperation({ summary: 'Save a draft of a record' })
  save(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('resource', RecordResourcePipe) resource: RecordResource,
    @Param('key', RecordKeyPipe) key: string,
    @Body() dto: SaveRecordDto,
    @Client() client: ClientContext,
  ) {
    return this.records.saveRecord(actor, resource, key, dto, client);
  }

  @Post(':resource')
  @ApiOperation({ summary: 'Create a draft of a new record' })
  create(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('resource', RecordResourcePipe) resource: RecordResource,
    @Body() dto: CreateRecordDto,
    @Client() client: ClientContext,
  ) {
    return this.records.createRecord(actor, resource, dto, client);
  }

  @Delete(':resource/:key')
  @ApiOperation({ summary: 'Mark a record for deletion on the next publish' })
  remove(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('resource', RecordResourcePipe) resource: RecordResource,
    @Param('key', RecordKeyPipe) key: string,
    @Body() dto: DeleteRecordDto,
    @Client() client: ClientContext,
  ) {
    return this.records.deleteRecord(actor, resource, key, dto.label, client);
  }
}

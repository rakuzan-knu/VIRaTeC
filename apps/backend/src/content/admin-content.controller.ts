import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdminPermission } from '@viratec/contracts';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StaffGuard } from '../common/guards/staff.guard';
import { RequirePermissions, RequireStepUp } from '../common/decorators/staff.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Client, type ClientContext } from '../common/decorators/client-context.decorator';
import type { AuthenticatedUser } from '../security/authenticated-user';
import { parseContentTypes } from './content.controller';
import { ContentService } from './content.service';
import { ContentEditorService } from './content-editor.service';
import { ContentIdPipe } from './content-id.pipe';
import {
  CreateContentEntryDto,
  PublishContentDto,
  SaveContentEntryDto,
  UploadContentAssetDto,
} from './dto/content-editor.dto';

@ApiTags('Content editor')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StaffGuard)
@Controller('admin/content')
export class AdminContentController {
  constructor(
    private readonly content: ContentService,
    private readonly editor: ContentEditorService,
  ) {}

  @Get('preview')
  @RequirePermissions(AdminPermission.CONTENT_VIEW)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Draft and published entries of the given content types' })
  @ApiQuery({ name: 'types', example: 'homePage,partner' })
  preview(@Query('types') types?: string) {
    return this.content.getPreviewEntries(parseContentTypes(types));
  }

  @Get('entries/:id')
  @RequirePermissions(AdminPermission.CONTENT_VIEW)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Current draft of an entry with its version' })
  entry(@Param('id', ContentIdPipe) id: string) {
    return this.editor.getEntry(id);
  }

  @Get('entries/:id/references')
  @RequirePermissions(AdminPermission.CONTENT_VIEW)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Entries that link to this entry' })
  references(@Param('id', ContentIdPipe) id: string) {
    return this.editor.getReferences(id);
  }

  @Put('entries/:id')
  @RequirePermissions(AdminPermission.CONTENT_EDIT)
  @ApiOperation({ summary: 'Save a draft of an entry' })
  save(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ContentIdPipe) id: string,
    @Body() dto: SaveContentEntryDto,
    @Client() client: ClientContext,
  ) {
    return this.editor.saveEntry(actor, id, dto, client);
  }

  @Post('entries')
  @RequirePermissions(AdminPermission.CONTENT_EDIT)
  @ApiOperation({ summary: 'Create a draft entry' })
  create(
    @CurrentUser() actor: AuthenticatedUser,
    @Body() dto: CreateContentEntryDto,
    @Client() client: ClientContext,
  ) {
    return this.editor.createEntry(actor, dto, client);
  }

  @Get('assets/:id')
  @RequirePermissions(AdminPermission.CONTENT_VIEW)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Image asset with its current file' })
  asset(@Param('id', ContentIdPipe) id: string) {
    return this.editor.getAsset(id);
  }

  @Post('assets')
  @RequirePermissions(AdminPermission.MEDIA_MANAGE)
  @ApiOperation({ summary: 'Upload an image as a draft asset' })
  upload(
    @CurrentUser() actor: AuthenticatedUser,
    @Body() dto: UploadContentAssetDto,
    @Client() client: ClientContext,
  ) {
    return this.editor.uploadAsset(actor, dto, client);
  }

  @Get('changes')
  @RequirePermissions(AdminPermission.CONTENT_VIEW)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Saved drafts that are not published yet' })
  changes() {
    return this.editor.listChanges();
  }

  @Delete('changes/:id')
  @RequirePermissions(AdminPermission.CONTENT_EDIT)
  @ApiOperation({ summary: 'Discard a draft and restore the published content' })
  discard(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Client() client: ClientContext,
  ) {
    return this.editor.discardChange(actor, id, client);
  }

  @Post('publish')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(AdminPermission.CONTENT_PUBLISH)
  @RequireStepUp()
  @ApiOperation({ summary: 'Publish saved drafts' })
  publish(
    @CurrentUser() actor: AuthenticatedUser,
    @Body() dto: PublishContentDto,
    @Client() client: ClientContext,
  ) {
    return this.editor.publish(actor, dto, client);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UploadAvatarDto } from './dto/upload-avatar.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

const AVATAR_PUBLIC_CACHE = 'public, max-age=3600';
const AVATAR_PRIVATE_CACHE = 'private, max-age=3600';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Search the member directory (respects profile visibility)' })
  @ApiResponse({ status: 200, description: 'List of users retrieved' })
  async findAll(
    @CurrentUser('id') viewerId: string | undefined,
    @Query() query: ListUsersQueryDto,
  ) {
    return this.usersService.findAll(viewerId ?? null, query);
  }

  @Patch('me/privacy')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update profile visibility settings' })
  async updatePrivacy(@CurrentUser('id') userId: string, @Body() dto: UpdatePrivacyDto) {
    return this.usersService.updatePrivacy(userId, dto);
  }

  @Get('me/export')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export all personal data of the current user' })
  async exportData(@CurrentUser('id') userId: string) {
    return this.usersService.exportData(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Permanently delete the current user account' })
  @ApiResponse({ status: 200, description: 'Account deleted' })
  @ApiResponse({ status: 400, description: 'Confirmation does not match the account email' })
  @ApiResponse({ status: 403, description: 'Password is incorrect' })
  async deleteAccount(@CurrentUser('id') userId: string, @Body() dto: DeleteAccountDto) {
    return this.usersService.deleteAccount(userId, dto);
  }

  @Put('me/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a profile photo for the current user' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded' })
  @ApiResponse({ status: 400, description: 'Not a PNG, JPEG or WebP image' })
  @ApiResponse({ status: 413, description: 'Image is too large' })
  async uploadAvatar(@CurrentUser('id') userId: string, @Body() dto: UploadAvatarDto) {
    return this.usersService.uploadAvatar(userId, dto);
  }

  @Delete('me/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove the profile photo of the current user' })
  @ApiResponse({ status: 200, description: 'Avatar removed' })
  async deleteAvatar(@CurrentUser('id') userId: string) {
    return this.usersService.deleteAvatar(userId);
  }

  @Get(':id/avatar')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get the profile photo of a user, respecting profile visibility' })
  @ApiResponse({ status: 200, description: 'Image bytes' })
  @ApiResponse({ status: 404, description: 'Avatar not found or profile hidden' })
  async getAvatar(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') viewerId: string | undefined,
    @Res() reply: FastifyReply,
  ) {
    const { data, mimeType, isPublic } = await this.usersService.findAvatar(id, viewerId ?? null);
    return reply
      .header('Content-Type', mimeType)
      .header('Cache-Control', isPublic ? AVATAR_PUBLIC_CACHE : AVATAR_PRIVATE_CACHE)
      .header('Content-Disposition', 'inline')
      .header('Cross-Origin-Resource-Policy', 'cross-origin')
      .send(data);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get a public profile, respecting its visibility' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Profile is visible to signed-in members only' })
  @ApiResponse({ status: 404, description: 'User not found or profile hidden' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') viewerId: string | undefined,
  ) {
    return this.usersService.findPublicProfile(id, viewerId ?? null);
  }
}

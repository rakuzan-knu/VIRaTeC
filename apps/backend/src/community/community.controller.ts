import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsQueryDto } from './dto/list-posts-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { VerifiedEmailGuard } from '../common/guards/verified-email.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Community')
@Controller('community')
export class CommunityController {
  constructor(private communityService: CommunityService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'List discussions and announcements' })
  async findAll(
    @CurrentUser('id') viewerId: string | undefined,
    @Query() query: ListPostsQueryDto,
  ) {
    return this.communityService.findAll(query, viewerId ?? null);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get discussion post by ID' })
  @ApiResponse({ status: 200, description: 'Post retrieved' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findById(
    @CurrentUser('id') viewerId: string | undefined,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.communityService.findById(id, viewerId ?? null);
  }

  @Post()
  @UseGuards(JwtAuthGuard, VerifiedEmailGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a new discussion or announcement' })
  @ApiResponse({ status: 201, description: 'Post created' })
  @ApiResponse({ status: 403, description: 'The account email is not confirmed' })
  async create(@Body() dto: CreatePostDto, @CurrentUser('id') userId: string) {
    return this.communityService.create(dto, userId);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like or unlike a community post (idempotent toggle)' })
  @ApiResponse({ status: 200, description: 'Like state after the toggle' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async toggleLike(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.communityService.toggleLike(id, userId);
  }
}

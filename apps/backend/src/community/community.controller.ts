import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Community')
@Controller('community')
export class CommunityController {
  constructor(private communityService: CommunityService) {}

  @Get()
  @ApiOperation({ summary: 'List discussions and announcements' })
  @ApiQuery({ name: 'tag', required: false })
  async findAll(@Query('tag') tag?: string) {
    return this.communityService.findAll(tag);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get discussion post by ID' })
  @ApiResponse({ status: 200, description: 'Post retrieved' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.communityService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a new discussion or announcement' })
  @ApiResponse({ status: 201, description: 'Post created' })
  async create(@Body() dto: CreatePostDto, @CurrentUser('id') userId: string) {
    return this.communityService.create(dto, userId);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like a community post' })
  async like(@Param('id', ParseUUIDPipe) id: string) {
    return this.communityService.like(id);
  }
}

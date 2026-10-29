import {
  BadRequestException,
  Controller,
  Get,
  Header,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { safeEqual } from '../security/crypto';
import { Client, type ClientContext } from '../common/decorators/client-context.decorator';
import { ContentService } from './content.service';
import { ContentfulClient } from './contentful.client';

const CONTENT_CACHE_CONTROL = 'public, max-age=0, s-maxage=30, stale-while-revalidate=60';
const CONTENT_TYPE_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;
const MAX_CONTENT_TYPES = 10;
const BEARER_PREFIX = 'Bearer ';

export const parseContentTypes = (value: string | undefined) => {
  const types = [...new Set((value ?? '').split(',').map((type) => type.trim()))]
    .filter(Boolean)
    .sort();
  if (
    types.length === 0 ||
    types.length > MAX_CONTENT_TYPES ||
    !types.every((type) => CONTENT_TYPE_PATTERN.test(type))
  ) {
    throw new BadRequestException(
      `Pass 1 to ${MAX_CONTENT_TYPES} comma-separated Contentful content type ids`,
    );
  }
  return types;
};

@ApiTags('Content')
@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly contentful: ContentfulClient,
  ) {}

  @Get('entries')
  @Header('Cache-Control', CONTENT_CACHE_CONTROL)
  @ApiOperation({ summary: 'Published Contentful entries of the given content types' })
  @ApiQuery({ name: 'types', example: 'homePage,partner' })
  @ApiResponse({ status: 429, description: 'Too many uncached content requests' })
  @ApiResponse({ status: 503, description: 'Contentful is not configured or unavailable' })
  getEntries(@Client() client: ClientContext, @Query('types') types?: string) {
    return this.contentService.getEntries(parseContentTypes(types), client);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiExcludeEndpoint()
  async webhook(@Headers('authorization') authorization?: string) {
    const secret = this.contentful.config.webhookSecret;
    const token = authorization?.startsWith(BEARER_PREFIX)
      ? authorization.slice(BEARER_PREFIX.length)
      : '';
    if (!secret || !token || !safeEqual(token, secret)) {
      throw new UnauthorizedException('Invalid webhook secret');
    }
    await this.contentService.invalidate();
  }
}

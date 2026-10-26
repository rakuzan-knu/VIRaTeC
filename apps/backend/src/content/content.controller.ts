import { BadRequestException, Controller, Get, Header, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ContentService } from './content.service';

const CONTENT_CACHE_CONTROL = 'public, max-age=0, s-maxage=30, stale-while-revalidate=60';
const CONTENT_TYPE_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;
const MAX_CONTENT_TYPES = 10;

const parseTypes = (value: string | undefined) => {
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
  constructor(private readonly contentService: ContentService) {}

  @Get('entries')
  @Header('Cache-Control', CONTENT_CACHE_CONTROL)
  @ApiOperation({ summary: 'Published Contentful entries of the given content types' })
  @ApiQuery({ name: 'types', example: 'homePage,partner' })
  @ApiResponse({ status: 503, description: 'Contentful is not configured or unavailable' })
  getEntries(@Query('types') types?: string) {
    return this.contentService.getEntries(parseTypes(types));
  }
}

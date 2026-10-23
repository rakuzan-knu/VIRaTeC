import { Controller, Get, Param, ParseEnumPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PublicationType } from '@viratec/contracts';
import { PublicationsService } from './publications.service';

@ApiTags('Publications')
@Controller('publications')
export class PublicationsController {
  constructor(private publicationsService: PublicationsService) {}

  @Get()
  @ApiOperation({ summary: 'List papers, news and event reports in both languages' })
  @ApiQuery({ name: 'type', enum: PublicationType, required: false })
  async findAll(
    @Query('type', new ParseEnumPipe(PublicationType, { optional: true })) type?: PublicationType,
  ) {
    return this.publicationsService.findAll(type);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a publication by slug' })
  @ApiResponse({ status: 200, description: 'Publication retrieved' })
  @ApiResponse({ status: 404, description: 'Publication not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.publicationsService.findBySlug(slug);
  }
}

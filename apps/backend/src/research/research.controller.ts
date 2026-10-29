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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ResearchService } from './research.service';
import { CreatePaperDto } from './dto/create-paper.dto';
import { ListPapersQueryDto } from './dto/list-papers-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StaffGuard } from '../common/guards/staff.guard';
import { RequirePermissions } from '../common/decorators/staff.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminPermission } from '@viratec/contracts';

@ApiTags('Research')
@Controller('research')
export class ResearchController {
  constructor(private researchService: ResearchService) {}

  @Get()
  @ApiOperation({ summary: 'Get all research papers and publications' })
  async findAll(@Query() query: ListPapersQueryDto) {
    return this.researchService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get research paper by ID' })
  @ApiResponse({ status: 200, description: 'Research paper retrieved' })
  @ApiResponse({ status: 404, description: 'Paper not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.researchService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, StaffGuard)
  @RequirePermissions(AdminPermission.CONTENT_EDIT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish or register a new research paper (staff only)' })
  @ApiResponse({ status: 201, description: 'Paper published' })
  @ApiResponse({ status: 403, description: 'Staff access with content editing is required' })
  async create(@Body() dto: CreatePaperDto, @CurrentUser('id') userId: string) {
    return this.researchService.create(dto, userId);
  }
}

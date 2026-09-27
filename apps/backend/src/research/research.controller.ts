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
import { ResearchService } from './research.service';
import { CreatePaperDto } from './dto/create-paper.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FacultyDivision } from '@viratec/contracts';

@ApiTags('Research')
@Controller('research')
export class ResearchController {
  constructor(private researchService: ResearchService) {}

  @Get()
  @ApiOperation({ summary: 'Get all research papers and publications' })
  @ApiQuery({ name: 'faculty', enum: FacultyDivision, required: false })
  async findAll(@Query('faculty') faculty?: FacultyDivision) {
    return this.researchService.findAll(faculty);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get research paper by ID' })
  @ApiResponse({ status: 200, description: 'Research paper retrieved' })
  @ApiResponse({ status: 404, description: 'Paper not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.researchService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish or register a new research paper' })
  @ApiResponse({ status: 201, description: 'Paper published' })
  async create(@Body() dto: CreatePaperDto, @CurrentUser('id') userId: string) {
    return this.researchService.create(dto, userId);
  }
}

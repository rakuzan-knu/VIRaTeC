import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PublicCacheInterceptor } from '../common/interceptors/public-cache.interceptor';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { ListEventsQueryDto } from './dto/list-events-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@viratec/contracts';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  @UseInterceptors(PublicCacheInterceptor)
  @ApiOperation({ summary: 'List academic and tech events, hackathons, and workshops' })
  async findAll(@Query() query: ListEventsQueryDto) {
    return this.eventsService.findAll(query);
  }

  @Get(':id')
  @UseInterceptors(PublicCacheInterceptor)
  @ApiOperation({ summary: 'Get event details by ID' })
  @ApiResponse({ status: 200, description: 'Event retrieved' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PROFESSOR, UserRole.RESEARCHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new event (Professors, Researchers, Admins only)' })
  @ApiResponse({ status: 201, description: 'Event created' })
  async create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }
}

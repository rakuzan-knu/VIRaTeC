import {
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  ParseUUIDPipe,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { EventRegistrationsService } from './event-registrations.service';
import { CreateEventDto } from './dto/create-event.dto';
import { ListEventsQueryDto } from './dto/list-events-query.dto';
import { EventRegistrationDto, EventUnsubscribeDto } from './dto/event-registration.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { StaffGuard } from '../common/guards/staff.guard';
import { VerifiedEmailGuard } from '../common/guards/verified-email.guard';
import { RequirePermissions } from '../common/decorators/staff.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Client, type ClientContext } from '../common/decorators/client-context.decorator';
import { AdminPermission } from '@viratec/contracts';

const EVENT_CDN_CACHE_CONTROL = 'public, max-age=15, s-maxage=30, stale-while-revalidate=60';
const GUEST_ACCESS_CACHE_CONTROL = 'public, max-age=0, s-maxage=15';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(
    private eventsService: EventsService,
    private registrations: EventRegistrationsService,
  ) {}

  @Get()
  @Header('Cache-Control', EVENT_CDN_CACHE_CONTROL)
  @ApiOperation({ summary: 'List academic and tech events, hackathons, and workshops' })
  async findAll(@Query() query: ListEventsQueryDto) {
    return this.eventsService.findAll(query);
  }

  @Get('unsubscribe')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Which event an unsubscribe link belongs to' })
  @ApiResponse({ status: 400, description: 'The unsubscribe link is invalid' })
  async unsubscribePreview(@Query() { token }: EventUnsubscribeDto) {
    return this.registrations.unsubscribePreview(token);
  }

  @Get('unsubscribe/one-click')
  @ApiOperation({ summary: 'Send mail clients without one-click support to the unsubscribe page' })
  redirectToUnsubscribePage(@Query() { token }: EventUnsubscribeDto, @Res() reply: FastifyReply) {
    return reply.redirect(this.registrations.unsubscribePageUrl(token), HttpStatus.FOUND);
  }

  @Post('unsubscribe/one-click')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'One-click unsubscribe called by the mail provider (RFC 8058)' })
  @ApiResponse({ status: 400, description: 'The unsubscribe link is invalid' })
  async unsubscribeOneClick(
    @Query() { token }: EventUnsubscribeDto,
    @Client() client: ClientContext,
  ) {
    return this.registrations.unsubscribeByToken(token, client);
  }

  @Post('unsubscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unsubscribe from an event with the link from an email' })
  @ApiResponse({ status: 400, description: 'The unsubscribe link is invalid' })
  async unsubscribe(@Body() dto: EventUnsubscribeDto, @Client() client: ClientContext) {
    return this.registrations.unsubscribeByToken(dto.token, client);
  }

  @Get(':id')
  @Header('Cache-Control', EVENT_CDN_CACHE_CONTROL)
  @ApiOperation({ summary: 'Get event details by ID' })
  @ApiResponse({ status: 200, description: 'Event retrieved' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.findById(id);
  }

  @Get(':id/access')
  @UseGuards(OptionalJwtAuthGuard)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Whether the viewer can open the meeting, with the link once open' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async access(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string | undefined,
  ) {
    return this.registrations.access(id, userId);
  }

  @Get(':id/access/guest')
  @Header('Cache-Control', GUEST_ACCESS_CACHE_CONTROL)
  @ApiOperation({ summary: 'Meeting access for visitors who are not signed in' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async guestAccess(@Param('id', ParseUUIDPipe) id: string) {
    return this.registrations.access(id, undefined);
  }

  @Put(':id/registration')
  @UseGuards(JwtAuthGuard, VerifiedEmailGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subscribe to an event' })
  @ApiResponse({ status: 403, description: 'The email address is not confirmed' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 409, description: 'The event is full, cancelled or over' })
  async register(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EventRegistrationDto,
    @CurrentUser('id') userId: string,
    @Client() client: ClientContext,
  ) {
    return this.registrations.register(userId, id, dto, client);
  }

  @Delete(':id/registration')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unsubscribe from an event' })
  async unregister(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Client() client: ClientContext,
  ) {
    return this.registrations.unregister(userId, id, client);
  }

  @Post(':id/attendance')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record that a signed-in user opened the meeting' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async attendance(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.registrations.recordAttendance(userId, id);
  }

  @Get(':id/attendees')
  @UseGuards(JwtAuthGuard, StaffGuard)
  @RequirePermissions(AdminPermission.EVENTS_MANAGE)
  @Header('Cache-Control', 'no-store')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subscribers of an event (staff with event management only)' })
  @ApiResponse({ status: 403, description: 'Staff access with event management is required' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async attendees(@Param('id', ParseUUIDPipe) id: string) {
    return this.registrations.listAttendees(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, StaffGuard)
  @RequirePermissions(AdminPermission.EVENTS_MANAGE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new event (staff with event management only)' })
  @ApiResponse({ status: 201, description: 'Event created' })
  @ApiResponse({ status: 403, description: 'Staff access with event management is required' })
  async create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }
}

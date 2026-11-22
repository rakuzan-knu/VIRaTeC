import { Controller, Get, Header, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EventRegistrationsService } from './event-registrations.service';

@ApiTags('Events')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Not signed in' })
@UseGuards(JwtAuthGuard)
@Controller('users/me/events')
export class MyEventsController {
  constructor(private registrations: EventRegistrationsService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Events the current user is subscribed to' })
  async list(@CurrentUser('id') userId: string) {
    return this.registrations.listMine(userId);
  }
}

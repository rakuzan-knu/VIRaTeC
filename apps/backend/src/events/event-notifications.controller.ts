import { Controller, Get, Header, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CronSecretGuard } from '../common/guards/cron-secret.guard';
import { EventNotificationsService } from './event-notifications.service';

@ApiTags('Events')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Invalid scheduler credentials' })
@ApiResponse({ status: 503, description: 'CRON_SECRET is not set' })
@UseGuards(CronSecretGuard)
@Controller('internal/event-notifications')
export class EventNotificationsController {
  constructor(private notifications: EventNotificationsService) {}

  @Get('dispatch')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Send due event emails (called by the scheduler)' })
  async dispatch() {
    return this.notifications.dispatch();
  }

  @Get('daily')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Plan the next day of event emails and send what is due' })
  async daily() {
    return this.notifications.runDaily();
  }
}

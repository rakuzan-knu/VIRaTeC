import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CronSecretGuard } from '../common/guards/cron-secret.guard';
import { EventDispatchScheduler } from './event-dispatch.scheduler';
import { EventNotificationsController } from './event-notifications.controller';
import { EventNotificationsService } from './event-notifications.service';
import { EventRegistrationsService } from './event-registrations.service';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { MyEventsController } from './my-events.controller';

@Module({
  imports: [AuthModule],
  controllers: [EventsController, MyEventsController, EventNotificationsController],
  providers: [
    EventsService,
    EventRegistrationsService,
    EventNotificationsService,
    EventDispatchScheduler,
    CronSecretGuard,
  ],
  exports: [EventsService],
})
export class EventsModule {}

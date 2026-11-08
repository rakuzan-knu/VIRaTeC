import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Event } from '@prisma/client';
import { eventJoinOpensAt } from '@viratec/contracts';

export const SCHEDULING_HORIZON_MS = 26 * 60 * 60_000;

const DISPATCH_PATH = '/api/v1/internal/event-notifications/dispatch';
const REQUEST_TIMEOUT_MS = 10_000;

interface CronConfig {
  secret: string;
  qstashToken: string;
  qstashUrl: string;
}

type EventOpening = Pick<Event, 'id' | 'startDate' | 'joinOpensMinutesBefore' | 'scheduleVersion'>;

@Injectable()
export class EventDispatchScheduler {
  private readonly logger = new Logger(EventDispatchScheduler.name);

  constructor(private readonly config: ConfigService) {}

  async scheduleOpeningWithinHorizon(event: EventOpening, now: Date) {
    const opensAt = eventJoinOpensAt(event.startDate, event.joinOpensMinutesBefore);
    if (opensAt.getTime() > now.getTime() + SCHEDULING_HORIZON_MS) return;
    const when = opensAt > now ? opensAt : now;
    await this.scheduleAt(
      when,
      `event-open-${event.id}-${event.scheduleVersion}-${Math.floor(opensAt.getTime() / 1000)}`,
    );
  }

  async scheduleAt(when: Date, deduplicationId: string) {
    const { secret, qstashToken, qstashUrl } = this.config.getOrThrow<CronConfig>('cron');
    if (!secret || !qstashToken) return;

    const frontendUrl = this.config.getOrThrow<string>('mail.frontendUrl');
    try {
      const response = await fetch(`${qstashUrl}/v2/publish/${frontendUrl}${DISPATCH_PATH}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${qstashToken}`,
          'Upstash-Method': 'GET',
          'Upstash-Not-Before': String(Math.ceil(when.getTime() / 1000)),
          'Upstash-Deduplication-Id': deduplicationId,
          'Upstash-Forward-Authorization': `Bearer ${secret}`,
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!response.ok) {
        this.logger.error(
          `QStash responded with ${response.status}: ${(await response.text()).slice(0, 300)}`,
        );
      }
    } catch (error) {
      this.logger.error(`QStash request failed: ${String(error)}`);
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventNotificationKind, EventStatus, type Prisma } from '@prisma/client';
import { EVENT_JOIN_LIMITS, EventTranslationsSchema, eventJoinOpensAt } from '@viratec/contracts';
import { MailClient } from '../auth/mail.client';
import { PrismaService } from '../prisma/prisma.service';
import { EventDispatchScheduler, SCHEDULING_HORIZON_MS } from './event-dispatch.scheduler';
import { buildEventMail, mailLocaleOf } from './event-mail';
import { createUnsubscribeToken } from './event-unsubscribe-token';

const BATCH_SIZE = 10;
const TIME_BUDGET_MS = 25_000;
const LEASE_MS = 5 * 60_000;
const MAX_ATTEMPTS = 5;
const DAY_MS = 24 * 60 * 60_000;
const BACKLOG_RETRY_MS = 30_000;
const LIMIT_RETRY_MS = 60 * 60_000;
const ONE_CLICK_UNSUBSCRIBE_PATH = '/api/v1/events/unsubscribe/one-click';
const UNSUBSCRIBE_PATH = '/events/unsubscribe';

const NOTIFICATION_INCLUDE = {
  registration: {
    include: { event: true, user: { select: { email: true, isBlocked: true } } },
  },
} satisfies Prisma.EventNotificationInclude;

type ClaimedNotification = Prisma.EventNotificationGetPayload<{
  include: typeof NOTIFICATION_INCLUDE;
}>;

const eventPagePath = (eventId: string) => `/events/${encodeURIComponent(eventId)}`;

@Injectable()
export class EventNotificationsService {
  private readonly logger = new Logger(EventNotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private mail: MailClient,
    private scheduler: EventDispatchScheduler,
  ) {}

  async dispatch() {
    const queued = await this.queueJoinOpen(new Date());
    const sentRecently = await this.prisma.eventNotification.count({
      where: { sentAt: { gte: new Date(Date.now() - DAY_MS) } },
    });

    const deadline = Date.now() + TIME_BUDGET_MS;
    let remaining = this.config.getOrThrow<number>('cron.eventMailDailyLimit') - sentRecently;
    let sent = 0;
    let dropped = 0;
    let failed = false;

    while (remaining > 0 && !failed && Date.now() < deadline) {
      const ids = await this.claim(Math.min(BATCH_SIZE, remaining));
      if (ids.length === 0) break;

      const notifications = await this.prisma.eventNotification.findMany({
        where: { id: { in: ids } },
        include: NOTIFICATION_INCLUDE,
      });

      for (const notification of notifications) {
        if (this.isStale(notification, new Date())) {
          await this.prisma.eventNotification.delete({ where: { id: notification.id } });
          dropped += 1;
          continue;
        }
        try {
          await this.deliver(notification);
        } catch (error) {
          this.logger.error(`Event email ${notification.id} was not sent: ${String(error)}`);
          failed = true;
          break;
        }
        await this.prisma.eventNotification.update({
          where: { id: notification.id },
          data: { sentAt: new Date() },
        });
        sent += 1;
        remaining -= 1;
      }
    }

    const limitReached = remaining <= 0;
    await this.scheduleFollowUp(limitReached, failed);
    return { queued, sent, dropped, limitReached };
  }

  async runDaily() {
    const now = new Date();
    const events = await this.prisma.event.findMany({
      where: {
        status: EventStatus.SCHEDULED,
        meetingUrl: { not: null },
        startDate: {
          gt: now,
          lte: new Date(
            now.getTime() +
              SCHEDULING_HORIZON_MS +
              EVENT_JOIN_LIMITS.maxOpensMinutesBefore * 60_000,
          ),
        },
      },
      select: { id: true, startDate: true, joinOpensMinutesBefore: true, scheduleVersion: true },
    });
    await Promise.all(
      events.map((event) => this.scheduler.scheduleOpeningWithinHorizon(event, now)),
    );
    return { planned: events.length, ...(await this.dispatch()) };
  }

  private async scheduleFollowUp(limitReached: boolean, failed: boolean) {
    const pending = await this.prisma.eventNotification.count({
      where: { sentAt: null, attempts: { lt: MAX_ATTEMPTS } },
    });
    if (pending === 0) return;

    const delayMs = limitReached ? LIMIT_RETRY_MS : failed ? LEASE_MS : BACKLOG_RETRY_MS;
    const when = new Date(Date.now() + delayMs);
    await this.scheduler.scheduleAt(when, `event-backlog-${Math.floor(when.getTime() / 60_000)}`);
  }

  private async queueJoinOpen(now: Date) {
    const events = await this.prisma.event.findMany({
      where: {
        status: EventStatus.SCHEDULED,
        meetingUrl: { not: null },
        startDate: {
          lte: new Date(now.getTime() + EVENT_JOIN_LIMITS.maxOpensMinutesBefore * 60_000),
        },
        endDate: { gt: now },
      },
      select: { id: true, startDate: true, joinOpensMinutesBefore: true, scheduleVersion: true },
    });

    let queued = 0;
    for (const event of events) {
      const opensAt = eventJoinOpensAt(event.startDate, event.joinOpensMinutesBefore);
      if (opensAt > now) continue;

      const registrations = await this.prisma.eventRegistration.findMany({
        where: {
          eventId: event.id,
          createdAt: { lt: opensAt },
          user: { isBlocked: false },
          notifications: {
            none: {
              kind: EventNotificationKind.JOIN_OPEN,
              scheduleVersion: event.scheduleVersion,
            },
          },
        },
        select: { id: true },
      });
      if (registrations.length === 0) continue;

      const { count } = await this.prisma.eventNotification.createMany({
        data: registrations.map((registration) => ({
          registrationId: registration.id,
          kind: EventNotificationKind.JOIN_OPEN,
          scheduleVersion: event.scheduleVersion,
        })),
        skipDuplicates: true,
      });
      queued += count;
    }
    return queued;
  }

  private async claim(limit: number) {
    const leaseUntil = new Date(Date.now() + LEASE_MS);
    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      UPDATE "event_notifications"
      SET "attempts" = "attempts" + 1, "nextAttemptAt" = ${leaseUntil}
      WHERE "id" IN (
        SELECT "id" FROM "event_notifications"
        WHERE "sentAt" IS NULL AND "nextAttemptAt" <= NOW() AND "attempts" < ${MAX_ATTEMPTS}
        ORDER BY "kind" ASC, "createdAt" ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING "id"
    `;
    return rows.map((row) => row.id);
  }

  private isStale({ kind, scheduleVersion, registration }: ClaimedNotification, now: Date) {
    const { event, user } = registration;
    if (user.isBlocked || scheduleVersion !== event.scheduleVersion || event.endDate <= now) {
      return true;
    }
    return (
      kind === EventNotificationKind.JOIN_OPEN &&
      (event.status !== EventStatus.SCHEDULED || !event.meetingUrl)
    );
  }

  private async deliver({ kind, registration }: ClaimedNotification) {
    const { event, user, id: registrationId, locale, timeZone } = registration;
    const translations = EventTranslationsSchema.safeParse(event.translations);
    const text = translations.success ? translations.data[mailLocaleOf(locale)] : undefined;
    const token = createUnsubscribeToken(
      this.config.getOrThrow<Buffer>('security.totpEncryptionKey'),
      registrationId,
    );
    const unsubscribeUrl = this.mail.buildLink(UNSUBSCRIBE_PATH, { token });
    const oneClickUrl = this.mail.buildLink(ONE_CLICK_UNSUBSCRIBE_PATH, { token });

    await this.mail.send({
      to: user.email,
      headers: {
        'List-Unsubscribe': `<${oneClickUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      ...buildEventMail({
        kind,
        locale,
        timeZone,
        title: text?.title || event.title,
        startDate: event.startDate,
        cancelReason: event.cancelReason,
        meetingUrl: event.meetingUrl,
        pageUrl: this.mail.buildLink(eventPagePath(event.id), {}),
        unsubscribeUrl,
      }),
    });
  }
}

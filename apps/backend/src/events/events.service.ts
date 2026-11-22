import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventStatus, type Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { TtlCache } from '../common/cache/ttl-cache';
import type { CursorPage } from '@viratec/contracts';
import { cursorArgs, cursorCacheKey, toCursorPage } from '../common/pagination/cursor-page';
import { ListEventsQueryDto } from './dto/list-events-query.dto';
import { eventPublishOutcome, toPublicEvent, type PublicEvent } from './event-access';
import { EventDispatchScheduler } from './event-dispatch.scheduler';

const CACHE_TTL_MS = 30_000;

type PublishedEventFields = Omit<Prisma.EventCreateInput, 'startDate' | 'endDate' | 'status'> & {
  startDate: Date;
  endDate: Date;
  status: EventStatus;
};

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private listCache = new TtlCache<CursorPage<PublicEvent>>(CACHE_TTL_MS);
  private itemCache = new TtlCache<PublicEvent>(CACHE_TTL_MS);

  constructor(
    private prisma: PrismaService,
    private scheduler: EventDispatchScheduler,
  ) {}

  clearCache() {
    this.listCache.clear();
    this.itemCache.clear();
  }

  findAll(query: ListEventsQueryDto) {
    const { type, scope } = query;
    return this.listCache.get(cursorCacheKey(query, `${type ?? ''}:${scope ?? ''}`), async () => {
      const now = new Date();
      const direction = scope === 'past' ? 'desc' : 'asc';
      const events = await this.prisma.event.findMany({
        where: {
          ...(type ? { type } : {}),
          ...(scope === 'upcoming' ? { endDate: { gte: now } } : {}),
          ...(scope === 'past' ? { endDate: { lt: now } } : {}),
        },
        orderBy: [{ startDate: direction }, { id: direction }],
        ...cursorArgs(query),
      });
      return toCursorPage(events.map(toPublicEvent), query.limit);
    });
  }

  findById(id: string) {
    return this.itemCache.get(id, async () => {
      const event = await this.prisma.event.findUnique({
        where: { id },
      });

      if (!event) {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }

      return toPublicEvent(event);
    });
  }

  async create(dto: CreateEventDto) {
    const event = await this.prisma.event.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
    this.listCache.clear();
    return event;
  }

  async applyPublishedChange(
    tx: Prisma.TransactionClient,
    id: string,
    change: { isNew: boolean; isDeleted: boolean },
    fields: PublishedEventFields,
  ) {
    if (change.isNew) {
      await tx.event.create({ data: { id, ...fields } });
      return;
    }

    const now = new Date();
    const previous = await tx.event.findUniqueOrThrow({
      where: { id },
      select: {
        startDate: true,
        endDate: true,
        status: true,
        scheduleVersion: true,
        _count: { select: { registrations: true } },
      },
    });
    const cancelInstead =
      change.isDeleted &&
      previous._count.registrations > 0 &&
      previous.status === EventStatus.SCHEDULED &&
      previous.endDate > now;

    if (change.isDeleted && !cancelInstead) {
      await tx.event.delete({ where: { id } });
      return;
    }

    const next = cancelInstead ? { ...fields, status: EventStatus.CANCELLED } : fields;
    const { versionChanged, notification } = eventPublishOutcome(previous, next, now);
    const scheduleVersion = previous.scheduleVersion + (versionChanged ? 1 : 0);

    await tx.event.update({ where: { id }, data: { ...next, scheduleVersion } });
    if (!notification) return;

    const registrations = await tx.eventRegistration.findMany({
      where: { eventId: id, user: { isBlocked: false } },
      select: { id: true },
    });
    await tx.eventNotification.createMany({
      data: registrations.map((registration) => ({
        registrationId: registration.id,
        kind: notification,
        scheduleVersion,
      })),
      skipDuplicates: true,
    });
  }

  async scheduleAfterPublish(id: string) {
    try {
      const event = await this.prisma.event.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          startDate: true,
          endDate: true,
          meetingUrl: true,
          joinOpensMinutesBefore: true,
          scheduleVersion: true,
        },
      });
      if (!event) return;

      const now = new Date();
      if (event.status === EventStatus.SCHEDULED && event.meetingUrl && event.endDate > now) {
        await this.scheduler.scheduleOpeningWithinHorizon(event, now);
      }
      const pending = await this.prisma.eventNotification.count({
        where: { sentAt: null, registration: { eventId: id } },
      });
      if (pending > 0) {
        await this.scheduler.scheduleAt(now, `event-change-${id}-${event.scheduleVersion}`);
      }
    } catch (error) {
      this.logger.error(`Event ${id} was published but not scheduled: ${String(error)}`);
    }
  }
}

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventStatus } from '@prisma/client';
import {
  StaffRole,
  eventJoinOpensAt,
  type EventAccessDto,
  type EventAttendeeDto,
  type EventAttendeesDto,
} from '@viratec/contracts';
import type { ClientContext } from '../common/decorators/client-context.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../security/audit.service';
import { RATE_LIMITS, RateLimitService } from '../security/rate-limit.service';
import { resolveEventAccess, toPublicEvent } from './event-access';
import { readUnsubscribeToken } from './event-unsubscribe-token';
import type { EventRegistrationDto } from './dto/event-registration.dto';

const MY_EVENTS_LIMIT = 200;
const ATTENDEES_LIMIT = 5000;

interface LockedEvent {
  status: EventStatus;
  endDate: Date;
  capacity: number | null;
}

@Injectable()
export class EventRegistrationsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private audit: AuditService,
    private rateLimit: RateLimitService,
  ) {}

  private async findEvent(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException(`Event with ID ${id} not found`);
    return event;
  }

  async access(eventId: string, userId: string | undefined): Promise<EventAccessDto> {
    const event = await this.findEvent(eventId);
    const [registration, taken] = await Promise.all([
      userId
        ? this.prisma.eventRegistration.findUnique({
            where: { eventId_userId: { eventId, userId } },
            select: { id: true },
          })
        : null,
      event.capacity === null ? null : this.prisma.eventRegistration.count({ where: { eventId } }),
    ]);
    const registered = Boolean(registration);
    const state = resolveEventAccess(event, { signedIn: Boolean(userId), registered }, new Date());

    return {
      state,
      opensAt: eventJoinOpensAt(event.startDate, event.joinOpensMinutesBefore).toISOString(),
      meetingUrl: state === 'OPEN' ? event.meetingUrl : null,
      registered,
      spotsLeft:
        event.capacity === null || taken === null ? null : Math.max(0, event.capacity - taken),
    };
  }

  async register(
    userId: string,
    eventId: string,
    { locale, timeZone }: EventRegistrationDto,
    client: ClientContext,
  ) {
    await this.rateLimit.consume(
      `event-registration:${userId}`,
      RATE_LIMITS.eventRegistrationPerAccount,
    );

    const created = await this.prisma.$transaction(async (tx) => {
      const [event] = await tx.$queryRaw<LockedEvent[]>`
        SELECT "status", "endDate", "capacity" FROM "events" WHERE "id" = ${eventId} FOR UPDATE
      `;
      if (!event) throw new NotFoundException(`Event with ID ${eventId} not found`);
      if (event.status === EventStatus.CANCELLED || event.endDate <= new Date()) {
        throw new ConflictException({
          message: 'This event is no longer open for subscriptions',
          code: 'EVENT_CLOSED',
        });
      }

      const key = { eventId_userId: { eventId, userId } };
      const existing = await tx.eventRegistration.findUnique({ where: key, select: { id: true } });
      if (existing) {
        await tx.eventRegistration.update({ where: key, data: { locale, timeZone } });
        return false;
      }

      if (event.capacity !== null) {
        const taken = await tx.eventRegistration.count({ where: { eventId } });
        if (taken >= event.capacity) {
          throw new ConflictException({ message: 'This event is full', code: 'EVENT_FULL' });
        }
      }

      await tx.eventRegistration.create({ data: { eventId, userId, locale, timeZone } });
      return true;
    });

    if (created) {
      await this.audit.record({
        action: 'event.registered',
        actorId: userId,
        targetType: 'event',
        targetId: eventId,
        client,
      });
    }
    return { registered: true };
  }

  async unregister(userId: string, eventId: string, client: ClientContext) {
    const { count } = await this.prisma.eventRegistration.deleteMany({
      where: { eventId, userId },
    });
    if (count > 0) {
      await this.audit.record({
        action: 'event.unregistered',
        actorId: userId,
        targetType: 'event',
        targetId: eventId,
        client,
      });
    }
    return { registered: false };
  }

  async recordAttendance(userId: string, eventId: string) {
    const access = await this.access(eventId, userId);
    if (access.state === 'OPEN') {
      await this.prisma.eventAttendance.createMany({
        data: [{ eventId, userId }],
        skipDuplicates: true,
      });
    }
    return { success: true };
  }

  private readToken(token: string) {
    const registrationId = readUnsubscribeToken(
      this.config.getOrThrow<Buffer>('security.totpEncryptionKey'),
      token,
    );
    if (!registrationId) {
      throw new BadRequestException({
        message: 'This unsubscribe link is invalid',
        code: 'EVENT_UNSUBSCRIBE_INVALID',
      });
    }
    return registrationId;
  }

  async unsubscribePreview(token: string) {
    const registration = await this.prisma.eventRegistration.findUnique({
      where: { id: this.readToken(token) },
      include: { event: true },
    });
    return { event: registration ? toPublicEvent(registration.event) : null };
  }

  unsubscribePageUrl(token: string) {
    const url = new URL('/events/unsubscribe', this.config.getOrThrow<string>('mail.frontendUrl'));
    url.searchParams.set('token', token);
    return url.toString();
  }

  async unsubscribeByToken(token: string, client: ClientContext) {
    const registrationId = this.readToken(token);
    const registration = await this.prisma.eventRegistration.findUnique({
      where: { id: registrationId },
      select: { eventId: true, userId: true },
    });
    if (registration) {
      await this.prisma.eventRegistration.deleteMany({ where: { id: registrationId } });
      await this.audit.record({
        action: 'event.unsubscribed_by_link',
        actorId: registration.userId,
        targetType: 'event',
        targetId: registration.eventId,
        client,
      });
    }
    return { success: true };
  }

  async listMine(userId: string) {
    const registrations = await this.prisma.eventRegistration.findMany({
      where: { userId },
      include: { event: true },
      orderBy: { event: { startDate: 'desc' } },
      take: MY_EVENTS_LIMIT,
    });
    return registrations.map((registration) => toPublicEvent(registration.event));
  }

  async listAttendees(eventId: string): Promise<EventAttendeesDto> {
    await this.findEvent(eventId);
    const userSelect = { id: true, name: true, email: true, staffRole: true } as const;
    const [registrations, attendances] = await Promise.all([
      this.prisma.eventRegistration.findMany({
        where: { eventId },
        orderBy: { createdAt: 'asc' },
        take: ATTENDEES_LIMIT,
        select: { createdAt: true, user: { select: userSelect } },
      }),
      this.prisma.eventAttendance.findMany({
        where: { eventId },
        orderBy: { joinedAt: 'asc' },
        take: ATTENDEES_LIMIT,
        select: { joinedAt: true, user: { select: userSelect } },
      }),
    ]);

    const attendees = new Map<string, EventAttendeeDto>();
    for (const { user, createdAt } of registrations) {
      attendees.set(user.id, {
        ...user,
        staffRole: StaffRole[user.staffRole],
        subscribedAt: createdAt.toISOString(),
        joinedAt: null,
      });
    }
    for (const { user, joinedAt } of attendances) {
      attendees.set(user.id, {
        ...user,
        staffRole: StaffRole[user.staffRole],
        subscribedAt: attendees.get(user.id)?.subscribedAt ?? null,
        joinedAt: joinedAt.toISOString(),
      });
    }

    return {
      subscribed: registrations.length,
      joined: attendances.length,
      dailyMailLimit: this.config.getOrThrow<number>('cron.eventMailDailyLimit'),
      attendees: [...attendees.values()],
    };
  }
}

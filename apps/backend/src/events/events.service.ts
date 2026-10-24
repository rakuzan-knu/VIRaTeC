import { Injectable, NotFoundException } from '@nestjs/common';
import type { Event } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { TtlCache } from '../common/cache/ttl-cache';
import { EventTranslationsSchema, type CursorPage } from '@viratec/contracts';
import { cursorArgs, cursorCacheKey, toCursorPage } from '../common/pagination/cursor-page';
import { ListEventsQueryDto } from './dto/list-events-query.dto';

const CACHE_TTL_MS = 30_000;

const withTranslations = (event: Event) => ({
  ...event,
  translations: event.translations ? EventTranslationsSchema.parse(event.translations) : null,
});

type EventWithTranslations = ReturnType<typeof withTranslations>;

@Injectable()
export class EventsService {
  private listCache = new TtlCache<CursorPage<EventWithTranslations>>(CACHE_TTL_MS);
  private itemCache = new TtlCache<EventWithTranslations>(CACHE_TTL_MS);

  constructor(private prisma: PrismaService) {}

  findAll(query: ListEventsQueryDto) {
    const { type } = query;
    return this.listCache.get(cursorCacheKey(query, type), async () => {
      const events = await this.prisma.event.findMany({
        where: type ? { type } : undefined,
        orderBy: [{ startDate: 'asc' }, { id: 'asc' }],
        ...cursorArgs(query),
      });
      return toCursorPage(events.map(withTranslations), query.limit);
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

      return withTranslations(event);
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
}

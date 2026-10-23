import { Injectable, NotFoundException } from '@nestjs/common';
import type { Event } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { EventTranslationsSchema, EventType } from '@viratec/contracts';

const withTranslations = (event: Event) => ({
  ...event,
  translations: event.translations ? EventTranslationsSchema.parse(event.translations) : null,
});

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(type?: EventType) {
    const events = await this.prisma.event.findMany({
      where: type ? { type } : undefined,
      orderBy: { startDate: 'asc' },
    });
    return events.map(withTranslations);
  }

  async findById(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return withTranslations(event);
  }

  async create(dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
  }
}

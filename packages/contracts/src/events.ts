import { z } from 'zod';
import { EventType, FacultyDivision } from './enums.js';

export const EventTextSchema = z.object({
  meta: z.string(),
  title: z.string(),
  description: z.string(),
  actionLabel: z.string(),
});

export type EventText = z.infer<typeof EventTextSchema>;

export const EventTranslationsSchema = z.object({ en: EventTextSchema, uk: EventTextSchema });

export type EventTranslations = z.infer<typeof EventTranslationsSchema>;

export const EventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().min(10),
  type: z.nativeEnum(EventType),
  faculty: z.nativeEnum(FacultyDivision),
  location: z.string().min(2),
  isOnline: z.boolean().default(false),
  startDate: z.date(),
  endDate: z.date(),
  capacity: z.number().int().positive().optional(),
  registrationLink: z.string().url().optional(),
  translations: EventTranslationsSchema.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type EventDto = z.infer<typeof EventSchema>;

export const CreateEventSchema = EventSchema.omit({
  id: true,
  translations: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateEventDto = z.infer<typeof CreateEventSchema>;

import { z } from 'zod';
import type { ContentLocaleKey } from './content.js';
import {
  EventJoinAccess,
  EventStatus,
  EventType,
  FacultyDivision,
  type StaffRole,
} from './enums.js';

export const EVENT_JOIN_LIMITS = {
  defaultOpensMinutesBefore: 10,
  maxOpensMinutesBefore: 120,
} as const;

export const MEETING_PLATFORMS = ['zoom', 'teams', 'meet'] as const;

export type MeetingPlatform = (typeof MEETING_PLATFORMS)[number];

const hostMatches = (hostname: string, domain: string) =>
  hostname === domain || hostname.endsWith(`.${domain}`);

const MEETING_PLATFORM_MATCHERS: Record<MeetingPlatform, (hostname: string) => boolean> = {
  zoom: (hostname) => hostMatches(hostname, 'zoom.us'),
  teams: (hostname) =>
    hostMatches(hostname, 'teams.microsoft.com') || hostMatches(hostname, 'teams.live.com'),
  meet: (hostname) => hostname === 'meet.google.com',
};

export const meetingPlatformOf = (url: string | null | undefined): MeetingPlatform | null => {
  if (!url || !URL.canParse(url)) return null;
  const { protocol, hostname } = new URL(url);
  if (protocol !== 'https:') return null;
  return (
    MEETING_PLATFORMS.find((platform) => MEETING_PLATFORM_MATCHERS[platform](hostname)) ?? null
  );
};

export const isMeetingUrl = (url: string) => meetingPlatformOf(url) !== null;

export const eventJoinOpensAt = (startDate: Date, opensMinutesBefore: number) =>
  new Date(startDate.getTime() - opensMinutesBefore * 60_000);

export const EventTextSchema = z.object({
  meta: z.string(),
  title: z.string(),
  description: z.string(),
  actionLabel: z.string(),
});

export type EventText = z.infer<typeof EventTextSchema>;

export const EventTranslationsSchema = z.object({
  en: EventTextSchema,
  uk: EventTextSchema.optional(),
  de: EventTextSchema.optional(),
  fr: EventTextSchema.optional(),
  ar: EventTextSchema.optional(),
});

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
  status: z.nativeEnum(EventStatus),
  joinAccess: z.nativeEnum(EventJoinAccess),
  joinOpensMinutesBefore: z.number().int().min(0),
  meetingPlatform: z.enum(MEETING_PLATFORMS).nullable(),
  recordingUrl: z.string().url().nullable(),
  cancelReason: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type EventDto = z.infer<typeof EventSchema>;

export const CreateEventSchema = EventSchema.omit({
  id: true,
  translations: true,
  status: true,
  joinAccess: true,
  joinOpensMinutesBefore: true,
  meetingPlatform: true,
  recordingUrl: true,
  cancelReason: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateEventDto = z.infer<typeof CreateEventSchema>;

export const EVENT_LIST_SCOPES = ['upcoming', 'past'] as const;

export type EventListScope = (typeof EVENT_LIST_SCOPES)[number];

export type EventAccessState =
  | 'NOT_YET'
  | 'OPEN'
  | 'ENDED'
  | 'CANCELLED'
  | 'NO_MEETING'
  | 'SIGN_IN_REQUIRED'
  | 'SUBSCRIPTION_REQUIRED';

export interface EventAccessDto {
  state: EventAccessState;
  opensAt: string;
  meetingUrl: string | null;
  registered: boolean;
  spotsLeft: number | null;
}

export interface EventRegistrationRequestDto {
  locale: ContentLocaleKey;
  timeZone: string;
}

export interface EventAttendeeDto {
  id: string;
  name: string;
  email: string;
  staffRole: StaffRole;
  subscribedAt: string | null;
  joinedAt: string | null;
}

export interface EventAttendeesDto {
  subscribed: number;
  joined: number;
  dailyMailLimit: number;
  attendees: EventAttendeeDto[];
}

export interface EventUnsubscribeRequestDto {
  token: string;
}

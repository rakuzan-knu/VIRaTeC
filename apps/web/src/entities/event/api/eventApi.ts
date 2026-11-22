import {
  EVENT_JOIN_LIMITS,
  EventJoinAccess,
  EventStatus,
  type EventAccessDto,
  type EventListScope,
  type RecordData,
} from '@viratec/contracts';
import { api } from '@/shared/api/apiClient';
import { previewRecords } from '@/shared/lib';
import type { EventResponse } from '../model/types';

const mergeDraft = (event: EventResponse, data: Partial<EventResponse>): EventResponse => {
  const merged = { ...event, ...data };
  const text = merged.translations?.en;
  return text ? { ...merged, title: text.title, description: text.description } : merged;
};

export const EVENT_PREVIEW = {
  resource: 'event',
  keyOf: (event: EventResponse) => event.id,
  merge: (event: EventResponse, data: RecordData) =>
    mergeDraft(event, data as Partial<EventResponse>),
} as const;

const previewNewEvents = (events: EventResponse[]) =>
  previewRecords(events, {
    ...EVENT_PREVIEW,
    create: (id, data) =>
      mergeDraft(
        {
          id,
          title: '',
          description: '',
          type: 'WORKSHOP' as EventResponse['type'],
          faculty: 'FIT' as EventResponse['faculty'],
          location: '',
          isOnline: false,
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          translations: null,
          status: EventStatus.SCHEDULED,
          joinAccess: EventJoinAccess.EVERYONE,
          joinOpensMinutesBefore: EVENT_JOIN_LIMITS.defaultOpensMinutesBefore,
          meetingPlatform: null,
          recordingUrl: null,
          cancelReason: null,
        },
        data as Partial<EventResponse>,
      ),
  });

export const fetchEvents = async (scope: EventListScope): Promise<EventResponse[]> => {
  const events = await api.get<EventResponse[]>(`/events?scope=${scope}`);
  return scope === 'upcoming' ? previewNewEvents(events) : events;
};

export const fetchEvent = (eventId: string) =>
  api.get<EventResponse>(`/events/${encodeURIComponent(eventId)}`);

export const fetchEventAccess = (eventId: string, userId: string | null) => {
  const path = `/events/${encodeURIComponent(eventId)}/access`;
  return userId
    ? api.get<EventAccessDto>(path, { cache: 'no-store' })
    : api.get<EventAccessDto>(`${path}/guest`);
};

export const fetchMyEvents = () =>
  api.get<EventResponse[]>('/users/me/events', { cache: 'no-store' });

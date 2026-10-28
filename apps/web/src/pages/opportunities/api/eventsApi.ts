import type { EventDto, RecordData } from '@viratec/contracts';
import { api } from '@/shared/api/apiClient';
import { previewRecords } from '@/shared/lib';

export type EventResponse = Omit<EventDto, 'startDate' | 'endDate' | 'createdAt' | 'updatedAt'> & {
  startDate: string;
  endDate: string;
};

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

export const fetchEvents = async (): Promise<EventResponse[]> =>
  previewRecords(await api.get<EventResponse[]>('/events'), {
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
        },
        data as Partial<EventResponse>,
      ),
  });

import type { EventDto } from '@viratec/contracts';

export type EventResponse = Omit<EventDto, 'startDate' | 'endDate' | 'createdAt' | 'updatedAt'> & {
  startDate: string;
  endDate: string;
};

export interface LocalizedEvent extends EventResponse {
  meta: string;
  actionLabel: string;
}

export type EventPhase = 'upcoming' | 'live' | 'ended' | 'cancelled';

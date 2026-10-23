import type { EventDto } from '@viratec/contracts';
import { api } from '@/shared/api/apiClient';

export type EventResponse = Omit<EventDto, 'startDate' | 'endDate' | 'createdAt' | 'updatedAt'> & {
  startDate: string;
  endDate: string;
};

export const fetchEvents = (): Promise<EventResponse[]> => api.get<EventResponse[]>('/events');

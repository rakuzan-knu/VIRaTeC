import type { EventRegistrationRequestDto } from '@viratec/contracts';
import type { EventResponse } from '@/entities/event';
import { api } from '@/shared/api/apiClient';

const registrationPath = (eventId: string) => `/events/${encodeURIComponent(eventId)}/registration`;

export const registerForEventRequest = (eventId: string, body: EventRegistrationRequestDto) =>
  api.put<{ registered: boolean }>(registrationPath(eventId), body);

export const unregisterFromEventRequest = (eventId: string) =>
  api.delete<{ registered: boolean }>(registrationPath(eventId));

export const fetchUnsubscribePreview = (token: string) =>
  api.get<{ event: EventResponse | null }>(
    `/events/unsubscribe?token=${encodeURIComponent(token)}`,
    { cache: 'no-store' },
  );

export const unsubscribeByTokenRequest = (token: string) =>
  api.post<{ success: boolean }>('/events/unsubscribe', { token });

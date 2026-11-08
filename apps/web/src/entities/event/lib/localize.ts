import { EventStatus } from '@viratec/contracts';
import type { Locale } from '@/shared/i18n';
import type { EventPhase, EventResponse, LocalizedEvent } from '../model/types';

export const localizeEvent = (event: EventResponse, locale: Locale): LocalizedEvent => {
  const text = event.translations?.[locale] ?? event.translations?.en;
  return {
    ...event,
    title: text?.title || event.title,
    description: text?.description || event.description,
    meta: text?.meta ?? '',
    actionLabel: text?.actionLabel ?? '',
  };
};

export const getEventPhase = (
  event: Pick<EventResponse, 'status' | 'startDate' | 'endDate'>,
  now: number,
): EventPhase => {
  if (event.status === EventStatus.CANCELLED) return 'cancelled';
  if (now >= Date.parse(event.endDate)) return 'ended';
  return now >= Date.parse(event.startDate) ? 'live' : 'upcoming';
};

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ROUTES } from '@/shared/config/routes';
import { INTL_LOCALE, defineMessages, useLocale, type Locale } from '@/shared/i18n';
import { fetchEvents, type EventResponse } from '../api/eventsApi';
import type { Opportunity } from './content';

const eventKeys = {
  all: ['events'] as const,
  upcoming: () => [...eventKeys.all, 'upcoming'] as const,
};

const FALLBACK_ACTION = defineMessages({ en: 'Ask to join', uk: 'Долучитися' });

const NO_EVENTS: Opportunity[] = [];

const toOpportunity = (event: EventResponse, locale: Locale): Opportunity => {
  const text = event.translations?.[locale];
  const date = new Intl.DateTimeFormat(INTL_LOCALE[locale], { dateStyle: 'long' }).format(
    new Date(event.startDate),
  );

  return {
    meta: text?.meta ?? `${date} · ${event.location}`,
    title: text?.title ?? event.title,
    description: text?.description ?? event.description,
    actionLabel: text?.actionLabel ?? FALLBACK_ACTION[locale],
    ...(event.registrationLink ? { href: event.registrationLink } : { to: ROUTES.CONTACT }),
  };
};

export function useUpcomingEvents() {
  const locale = useLocale();
  const select = useCallback(
    (events: EventResponse[]) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return events
        .filter((event) => new Date(event.endDate) >= today)
        .map((event) => toOpportunity(event, locale));
    },
    [locale],
  );
  const query = useQuery({
    queryKey: eventKeys.upcoming(),
    queryFn: fetchEvents,
    select,
    staleTime: 5 * 60_000,
  });

  return query.data ?? NO_EVENTS;
}

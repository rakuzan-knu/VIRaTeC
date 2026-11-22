import { EventStatus } from '@viratec/contracts';
import { useEvents, type LocalizedEvent } from '@/entities/event';
import { buildEventPath } from '@/shared/config/routes';
import { INTL_LOCALE, defineMessages, useLocale, type Locale } from '@/shared/i18n';
import type { Opportunity } from './content';

const FALLBACK_ACTION = defineMessages({
  en: 'View event',
  uk: 'Переглянути подію',
  de: 'Veranstaltung ansehen',
  fr: 'Voir l’événement',
  ar: 'عرض الفعالية',
});

const NO_EVENTS: LocalizedEvent[] = [];

const toOpportunity = (event: LocalizedEvent, locale: Locale): Opportunity => {
  const date = new Intl.DateTimeFormat(INTL_LOCALE[locale], { dateStyle: 'long' }).format(
    new Date(event.startDate),
  );

  return {
    meta: event.meta || `${date} · ${event.location}`,
    title: event.title,
    description: event.description,
    actionLabel: event.actionLabel || FALLBACK_ACTION[locale],
    ...(event.registrationLink
      ? { href: event.registrationLink }
      : { to: buildEventPath(event.id) }),
  };
};

export function useUpcomingEvents() {
  const locale = useLocale();
  const { data = NO_EVENTS } = useEvents('upcoming');

  return data
    .filter((event) => event.status !== EventStatus.CANCELLED)
    .map((event) => toOpportunity(event, locale));
}

import { buildEventPath } from '@/shared/config/routes';
import { absoluteUrl } from '@/shared/config/seo';
import { ENV } from '@/shared/config/env';
import type { LocalizedEvent } from '../model/types';

const toCalendarDate = (value: string) =>
  new Date(value)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');

const escapeIcsText = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

const eventPageUrl = (event: LocalizedEvent) => absoluteUrl(buildEventPath(event.id), ENV.SITE_URL);

export const googleCalendarUrl = (event: LocalizedEvent) => {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toCalendarDate(event.startDate)}/${toCalendarDate(event.endDate)}`,
    details: `${event.description}\n\n${eventPageUrl(event)}`,
    location: event.isOnline ? eventPageUrl(event) : event.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const icsDownloadHref = (event: LocalizedEvent) => {
  const url = eventPageUrl(event);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VIRaTeC//Events//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@viratec`,
    `DTSTAMP:${toCalendarDate(new Date().toISOString())}`,
    `DTSTART:${toCalendarDate(event.startDate)}`,
    `DTEND:${toCalendarDate(event.endDate)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(`${event.description}\n\n${url}`)}`,
    `LOCATION:${escapeIcsText(event.isOnline ? url : event.location)}`,
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join('\r\n'))}`;
};

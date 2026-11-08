import { EventType, type MeetingPlatform } from '@viratec/contracts';
import { INTL_LOCALE, defineMessages, useLocalized, type Locale } from '@/shared/i18n';
import type { EventPhase, EventResponse } from '../model/types';

export const MEETING_PLATFORM_NAMES: Record<MeetingPlatform, string> = {
  zoom: 'Zoom',
  teams: 'Microsoft Teams',
  meet: 'Google Meet',
};

interface EventLabels {
  type: Record<EventType, string>;
  phase: Record<EventPhase, string>;
}

const EVENT_LABELS = defineMessages<EventLabels>({
  en: {
    type: {
      [EventType.HACKATHON]: 'Hackathon',
      [EventType.CONFERENCE]: 'Conference',
      [EventType.WORKSHOP]: 'Workshop',
      [EventType.SEMINAR]: 'Seminar',
      [EventType.MEETUP]: 'Meetup',
    },
    phase: { upcoming: 'Upcoming', live: 'Live now', ended: 'Ended', cancelled: 'Cancelled' },
  },
  uk: {
    type: {
      [EventType.HACKATHON]: 'Хакатон',
      [EventType.CONFERENCE]: 'Конференція',
      [EventType.WORKSHOP]: 'Воркшоп',
      [EventType.SEMINAR]: 'Семінар',
      [EventType.MEETUP]: 'Зустріч',
    },
    phase: { upcoming: 'Незабаром', live: 'Триває', ended: 'Завершено', cancelled: 'Скасовано' },
  },
  de: {
    type: {
      [EventType.HACKATHON]: 'Hackathon',
      [EventType.CONFERENCE]: 'Konferenz',
      [EventType.WORKSHOP]: 'Workshop',
      [EventType.SEMINAR]: 'Seminar',
      [EventType.MEETUP]: 'Treffen',
    },
    phase: { upcoming: 'Demnächst', live: 'Läuft', ended: 'Beendet', cancelled: 'Abgesagt' },
  },
  fr: {
    type: {
      [EventType.HACKATHON]: 'Hackathon',
      [EventType.CONFERENCE]: 'Conférence',
      [EventType.WORKSHOP]: 'Atelier',
      [EventType.SEMINAR]: 'Séminaire',
      [EventType.MEETUP]: 'Rencontre',
    },
    phase: { upcoming: 'À venir', live: 'En cours', ended: 'Terminé', cancelled: 'Annulé' },
  },
  ar: {
    type: {
      [EventType.HACKATHON]: 'هاكاثون',
      [EventType.CONFERENCE]: 'مؤتمر',
      [EventType.WORKSHOP]: 'ورشة عمل',
      [EventType.SEMINAR]: 'ندوة',
      [EventType.MEETUP]: 'لقاء',
    },
    phase: { upcoming: 'قريبًا', live: 'جارٍ الآن', ended: 'انتهى', cancelled: 'أُلغي' },
  },
});

export const useEventLabels = () => useLocalized(EVENT_LABELS);

export const formatEventDateTime = (
  event: Pick<EventResponse, 'startDate'>,
  locale: Locale,
  timeZone?: string,
) =>
  new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
    timeZone,
  }).format(new Date(event.startDate));

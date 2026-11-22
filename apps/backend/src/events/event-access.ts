import { EventJoinAccess, EventNotificationKind, EventStatus, type Event } from '@prisma/client';
import {
  EventTranslationsSchema,
  eventJoinOpensAt,
  meetingPlatformOf,
  type EventAccessState,
} from '@viratec/contracts';

export const toPublicEvent = ({ meetingUrl, scheduleVersion: _version, ...event }: Event) => ({
  ...event,
  meetingPlatform: meetingPlatformOf(meetingUrl),
  translations: event.translations ? EventTranslationsSchema.parse(event.translations) : null,
});

export type PublicEvent = ReturnType<typeof toPublicEvent>;

export type EventAccessFields = Pick<
  Event,
  'status' | 'startDate' | 'endDate' | 'meetingUrl' | 'joinOpensMinutesBefore' | 'joinAccess'
>;

export interface EventViewer {
  signedIn: boolean;
  registered: boolean;
}

export function resolveEventAccess(
  event: EventAccessFields,
  { signedIn, registered }: EventViewer,
  now: Date,
): EventAccessState {
  if (event.status === EventStatus.CANCELLED) return 'CANCELLED';
  if (now >= event.endDate) return 'ENDED';
  if (!event.meetingUrl) return 'NO_MEETING';
  if (now < eventJoinOpensAt(event.startDate, event.joinOpensMinutesBefore)) return 'NOT_YET';
  if (event.joinAccess === EventJoinAccess.EVERYONE) return 'OPEN';
  if (!signedIn) return 'SIGN_IN_REQUIRED';
  if (event.joinAccess === EventJoinAccess.REGISTERED || registered) return 'OPEN';
  return 'SUBSCRIPTION_REQUIRED';
}

type EventSchedule = Pick<Event, 'startDate' | 'status'>;

export function eventPublishOutcome(
  previous: EventSchedule,
  next: EventSchedule & Pick<Event, 'endDate'>,
  now: Date,
) {
  const cancelled =
    previous.status === EventStatus.SCHEDULED && next.status === EventStatus.CANCELLED;
  const restored =
    previous.status === EventStatus.CANCELLED && next.status === EventStatus.SCHEDULED;
  const moved = previous.startDate.getTime() !== next.startDate.getTime();
  const versionChanged = cancelled || restored || moved;

  const notify = () => {
    if (!versionChanged || next.endDate <= now) return null;
    if (cancelled) return EventNotificationKind.CANCELLED;
    return next.status === EventStatus.SCHEDULED ? EventNotificationKind.RESCHEDULED : null;
  };

  return { versionChanged, notification: notify() };
}

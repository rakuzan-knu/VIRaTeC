import {
  MEETING_PLATFORM_NAMES,
  formatEventDateTime,
  getEventPhase,
  useEventAccess,
  useEventLabels,
  type LocalizedEvent,
} from '@/entities/event';
import { useSessionStore } from '@/entities/session';
import { JoinMeetingPanel } from '@/features/join-event';
import { EventRegistrationButton } from '@/features/register-for-event';
import { useLocale } from '@/shared/i18n';
import { FactsCard, type Fact } from '@/shared/ui/facts-card';
import { ButtonArrow, linkButtonClassName } from '@/shared/ui/link-button';
import { PageSection } from '@/shared/ui/page-section';
import { useEventDetailMessages } from '../model/messages';
import { AddToCalendar } from './AddToCalendar';

export function EventBody({ event }: { event: LocalizedEvent }) {
  const t = useEventDetailMessages();
  const locale = useLocale();
  const labels = useEventLabels();
  const userId = useSessionStore((state) => state.user?.id ?? null);
  const { data: access } = useEventAccess(event.id, userId);
  const phase = getEventPhase(event, Date.now());
  const paragraphs = event.description.split(/\n{2,}/).filter(Boolean);
  const platform = event.meetingPlatform ? MEETING_PLATFORM_NAMES[event.meetingPlatform] : null;
  const isActive = phase === 'upcoming' || phase === 'live';

  const facts: Fact[] = [
    { label: t.date, value: formatEventDateTime(event, locale) },
    { label: t.type, value: labels.type[event.type] },
    {
      label: t.format,
      value: event.isOnline ? [t.online, platform].filter(Boolean).join(' · ') : '',
    },
    { label: t.place, value: event.isOnline ? '' : event.location },
    {
      label: t.seatsLeft,
      value: isActive && access?.spotsLeft != null ? String(access.spotsLeft) : '',
    },
  ].filter((fact) => fact.value.length > 0);

  return (
    <PageSection containerClassName="lg:flex-row lg:items-start lg:gap-16">
      <div className="flex flex-1 flex-col gap-5">
        {phase === 'cancelled' && (
          <div className="flex flex-col gap-1 rounded-[20px] border border-state-error/40 bg-state-error/10 p-5">
            <p className="font-medium text-text-primary">{t.cancelledTitle}</p>
            {event.cancelReason && (
              <p className="text-[15px] leading-[22px] text-viratec-soft">{event.cancelReason}</p>
            )}
          </div>
        )}
        <h2 className="font-display text-2xl leading-[30px] font-medium tracking-[-0.02em] text-white lg:text-[32px] lg:leading-[38px]">
          {t.about}
        </h2>
        {paragraphs.map((paragraph) => (
          <p
            key={paragraph}
            className="text-base leading-[26px] whitespace-pre-line text-viratec-muted lg:text-[17px] lg:leading-7"
          >
            {paragraph}
          </p>
        ))}
      </div>
      <FactsCard
        title={t.facts}
        facts={facts}
        actions={
          <div className="flex flex-col gap-4">
            <JoinMeetingPanel event={event} />
            {isActive && !event.registrationLink && <EventRegistrationButton eventId={event.id} />}
            {isActive && event.registrationLink && (
              <a
                href={event.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className={linkButtonClassName({
                  variant: 'secondary',
                  size: 'md',
                  className: 'w-full',
                })}
              >
                {t.register}
                <ButtonArrow size="md" />
              </a>
            )}
            {phase === 'upcoming' && <AddToCalendar event={event} />}
          </div>
        }
      />
    </PageSection>
  );
}

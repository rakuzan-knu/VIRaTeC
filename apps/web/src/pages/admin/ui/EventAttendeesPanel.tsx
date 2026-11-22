import { StaffRole } from '@viratec/contracts';
import { cn } from '@/shared/lib';
import { useAdminMessages } from '../model/messages';
import { useEventAttendees } from '../model/queries';
import { attendeesCsvHref } from '../lib/attendeesCsv';

const BADGE_CLASS = 'rounded-full bg-white/8 px-2 py-0.5 text-[12px] text-text-muted';

export function EventAttendeesPanel({ eventId }: { eventId: string }) {
  const t = useAdminMessages().eventAttendees;
  const { data, isPending, isError } = useEventAttendees(eventId, true);
  const roleLabel = (role: StaffRole) =>
    role === StaffRole.OWNER ? t.owner : role === StaffRole.ADMIN ? t.admin : null;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-white/8 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h4 className="text-label font-medium text-text-primary">{t.title}</h4>
          {data && (
            <p className="text-[13px] text-text-muted">{t.summary(data.subscribed, data.joined)}</p>
          )}
        </div>
        {data && data.attendees.length > 0 && (
          <a
            href={attendeesCsvHref(data, t.csvHeader, roleLabel)}
            download="event-subscribers.csv"
            className="text-[14px] text-viratec-cyan underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
          >
            {t.exportCsv}
          </a>
        )}
      </header>
      {data && data.subscribed > data.dailyMailLimit && (
        <p role="status" className="rounded-xl bg-state-error/10 p-3 text-[14px] text-text-primary">
          {t.mailWarning(data.dailyMailLimit, data.subscribed)}
        </p>
      )}
      {isPending && (
        <p role="status" className="text-[14px] text-text-muted">
          {t.loading}
        </p>
      )}
      {isError && (
        <p role="alert" className="text-[14px] text-state-error">
          {t.error}
        </p>
      )}
      {data?.attendees.length === 0 && <p className="text-[14px] text-text-muted">{t.empty}</p>}
      {data && data.attendees.length > 0 && (
        <ul className="flex max-h-[280px] flex-col divide-y divide-white/8 overflow-y-auto">
          {data.attendees.map((attendee) => {
            const role = roleLabel(attendee.staffRole);
            return (
              <li key={attendee.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
                <span className="text-[14px] text-text-primary">{attendee.name}</span>
                <span className="text-[13px] break-all text-text-muted">{attendee.email}</span>
                {role && <span className={BADGE_CLASS}>{role}</span>}
                {attendee.subscribedAt && <span className={BADGE_CLASS}>{t.subscriber}</span>}
                {attendee.joinedAt && (
                  <span className={cn(BADGE_CLASS, 'text-viratec-cyan')}>{t.joined}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

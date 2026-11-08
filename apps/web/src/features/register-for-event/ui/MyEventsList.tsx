import { Link } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import {
  formatEventDateTime,
  getEventPhase,
  useEventLabels,
  useMyEvents,
  type LocalizedEvent,
} from '@/entities/event';
import { useSessionStore } from '@/entities/session';
import { ROUTES, buildEventPath } from '@/shared/config/routes';
import { useLocale } from '@/shared/i18n';
import { linkButtonClassName } from '@/shared/ui/link-button';
import { useRegistrationMessages } from '../model/messages';

const isFinished = (event: LocalizedEvent, now: number) => {
  const phase = getEventPhase(event, now);
  return phase === 'ended' || phase === 'cancelled';
};

export function MyEventsList() {
  const t = useRegistrationMessages();
  const locale = useLocale();
  const labels = useEventLabels();
  const userId = useSessionStore((state) => state.user?.id ?? null);
  const { data: events, isPending, isError } = useMyEvents(userId);

  if (isPending) {
    return (
      <p className="flex items-center gap-2 text-sm text-viratec-muted">
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        {t.list.loading}
      </p>
    );
  }

  if (isError || !events) {
    return (
      <p role="alert" className="text-sm text-state-error">
        {t.list.error}
      </p>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 py-2">
        <div className="flex flex-col gap-1.5">
          <p className="font-display text-xl font-medium text-white">{t.list.emptyTitle}</p>
          <p className="max-w-[52ch] text-[15px] leading-6 text-viratec-muted">
            {t.list.emptyDescription}
          </p>
        </div>
        <Link
          to={ROUTES.EVENTS}
          className={linkButtonClassName({ variant: 'secondary', size: 'md' })}
        >
          {t.list.browse}
        </Link>
      </div>
    );
  }

  const now = Date.now();
  const groups = [
    { title: t.list.upcoming, entries: events.filter((event) => !isFinished(event, now)) },
    { title: t.list.past, entries: events.filter((event) => isFinished(event, now)) },
  ].filter((group) => group.entries.length > 0);

  return (
    <div className="flex flex-col gap-6">
      {groups.map(({ title, entries }) => (
        <section key={title} className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-viratec-subtle">
            {title} <span className="text-viratec-muted">· {entries.length}</span>
          </h3>
          <ul className="flex flex-col divide-y divide-white/8 overflow-hidden rounded-[20px] border border-white/10 bg-white/3">
            {entries.map((event) => (
              <li key={event.id} className="flex flex-col gap-1 p-4">
                <Link
                  to={buildEventPath(event.id)}
                  className="text-[15px] leading-6 font-medium text-white underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
                >
                  {event.title}
                </Link>
                <span className="text-xs text-viratec-subtle">
                  {formatEventDateTime(event, locale)} · {labels.phase[getEventPhase(event, now)]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

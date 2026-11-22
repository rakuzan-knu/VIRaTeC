import { CalendarPlus } from 'lucide-react';
import { googleCalendarUrl, icsDownloadHref, type LocalizedEvent } from '@/entities/event';
import { useEventDetailMessages } from '../model/messages';

const LINK_CLASS =
  'text-[14px] leading-6 text-viratec-cyan underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime';

export function AddToCalendar({ event }: { event: LocalizedEvent }) {
  const t = useEventDetailMessages();

  return (
    <div className="flex flex-col gap-1 border-t border-white/8 pt-4">
      <span className="flex items-center gap-2 text-[13px] leading-[18px] text-viratec-subtle">
        <CalendarPlus aria-hidden="true" className="size-4" />
        {t.addToCalendar}
      </span>
      <div className="flex flex-wrap gap-x-4">
        <a
          href={googleCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className={LINK_CLASS}
        >
          {t.googleCalendar}
        </a>
        <a href={icsDownloadHref(event)} download="viratec-event.ics" className={LINK_CLASS}>
          {t.downloadIcs}
        </a>
      </div>
    </div>
  );
}

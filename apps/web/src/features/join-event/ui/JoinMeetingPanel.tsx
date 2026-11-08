import { Link, useLocation } from 'react-router-dom';
import { MEETING_PLATFORM_NAMES, type LocalizedEvent } from '@/entities/event';
import { ROUTES } from '@/shared/config/routes';
import { ButtonArrow, linkButtonClassName } from '@/shared/ui/link-button';
import { useJoinMessages } from '../model/messages';
import { useJoinEvent } from '../model/useJoinEvent';

const MESSAGE_CLASS = 'text-[15px] leading-[22px] text-viratec-soft';

const pad = (value: number) => String(value).padStart(2, '0');

const formatClock = (remainingMs: number, formatDays: (count: number) => string) => {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const clock = [
    Math.floor((totalSeconds % 86_400) / 3600),
    Math.floor((totalSeconds % 3600) / 60),
    totalSeconds % 60,
  ]
    .map(pad)
    .join(':');
  return days > 0 ? `${formatDays(days)} ${clock}` : clock;
};

export function JoinMeetingPanel({ event }: { event: LocalizedEvent }) {
  const t = useJoinMessages();
  const location = useLocation();
  const { access, remainingMs, onJoin } = useJoinEvent(event.id);

  if (!access) return null;

  const platform = event.meetingPlatform ? MEETING_PLATFORM_NAMES[event.meetingPlatform] : null;

  return (
    <div aria-live="polite" className="flex flex-col gap-2">
      {access.state === 'OPEN' && access.meetingUrl && (
        <a
          href={access.meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onJoin}
          className={linkButtonClassName({ className: 'w-full whitespace-normal text-center' })}
        >
          {t.join(platform)}
          <ButtonArrow />
        </a>
      )}
      {access.state === 'NOT_YET' && (
        <div className="flex flex-col gap-1 rounded-[20px] border border-white/10 bg-white/4 p-4">
          <span className="text-[13px] leading-[18px] text-viratec-subtle">
            {remainingMs > 0 ? t.opensIn : t.opening}
          </span>
          {remainingMs > 0 && (
            <span
              role="timer"
              aria-live="off"
              className="font-display text-[32px] leading-10 font-medium text-viratec-accent tabular-nums"
            >
              {formatClock(remainingMs, t.days)}
            </span>
          )}
          <span className="text-[13px] leading-[18px] text-viratec-subtle">
            {t.opensBefore(event.joinOpensMinutesBefore)}
          </span>
        </div>
      )}
      {access.state === 'SIGN_IN_REQUIRED' && (
        <Link
          to={ROUTES.LOGIN}
          state={{ from: `${location.pathname}${location.search}` }}
          className={linkButtonClassName({ className: 'w-full' })}
        >
          {t.signIn}
        </Link>
      )}
      {access.state === 'SUBSCRIPTION_REQUIRED' && (
        <p className={MESSAGE_CLASS}>{t.subscribeFirst}</p>
      )}
      {access.state === 'NO_MEETING' && event.isOnline && (
        <p className={MESSAGE_CLASS}>{t.linkSoon}</p>
      )}
      {access.state === 'CANCELLED' && <p className={MESSAGE_CLASS}>{t.cancelled}</p>}
      {access.state === 'ENDED' && <p className={MESSAGE_CLASS}>{t.ended}</p>}
      {access.state === 'ENDED' && event.recordingUrl && (
        <a
          href={event.recordingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={linkButtonClassName({ variant: 'secondary', size: 'md', className: 'w-full' })}
        >
          {t.watchRecording}
          <ButtonArrow size="md" />
        </a>
      )}
    </div>
  );
}

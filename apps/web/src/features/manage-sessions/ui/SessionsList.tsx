import { Laptop, LoaderCircle, MonitorSmartphone, Smartphone, Tablet } from 'lucide-react';
import { INTL_LOCALE, defineMessages, useLocale, useLocalized } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { parseUserAgent, type DeviceKind } from '../lib/parseUserAgent';
import { useRevokeSession, useSessions } from '../model/useSessions';

const SESSIONS_MESSAGES = defineMessages({
  en: {
    loading: 'Loading sessions…',
    error: 'Could not load your sessions.',
    unknownDevice: 'Unknown device',
    on: (browser: string, os: string) => `${browser} on ${os}`,
    thisDevice: 'This device',
    signOut: 'Sign out',
    signOutLabel: (device: string) => `Sign out ${device}`,
    active: (when: string) => `Active ${when}`,
    activeNow: 'Active now',
    signedIn: (date: string) => `Signed in ${date}`,
    revokeError: 'Could not sign out that session. Please try again.',
  },
  uk: {
    loading: 'Завантажуємо сеанси…',
    error: 'Не вдалося завантажити сеанси.',
    unknownDevice: 'Невідомий пристрій',
    on: (browser: string, os: string) => `${browser} на ${os}`,
    thisDevice: 'Цей пристрій',
    signOut: 'Вийти',
    signOutLabel: (device: string) => `Завершити сеанс: ${device}`,
    active: (when: string) => `Активність ${when}`,
    activeNow: 'Активний зараз',
    signedIn: (date: string) => `Вхід ${date}`,
    revokeError: 'Не вдалося завершити сеанс. Спробуйте ще раз.',
  },
});

const DEVICE_ICONS: Record<DeviceKind, typeof Laptop> = {
  desktop: Laptop,
  mobile: Smartphone,
  tablet: Tablet,
  unknown: MonitorSmartphone,
};

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

const RECENT_SECONDS = 120;

function useDateFormatters() {
  const locale = INTL_LOCALE[useLocale()];
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const absolute = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return {
    secondsAgo: (iso: string) => Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000),
    relative: (iso: string) => {
      const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
      const [unit, size] = RELATIVE_UNITS.find(([, unitSeconds]) => seconds >= unitSeconds) ?? [
        'minute',
        60,
      ];
      return relative.format(-Math.max(1, Math.round(seconds / size)), unit);
    },
    absolute: (iso: string) => absolute.format(new Date(iso)),
  };
}

export function SessionsList() {
  const t = useLocalized(SESSIONS_MESSAGES);
  const { data: sessions, isPending, isError } = useSessions();
  const revoke = useRevokeSession();
  const format = useDateFormatters();

  if (isPending) {
    return (
      <p className="flex items-center gap-2 text-sm text-viratec-muted">
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        {t.loading}
      </p>
    );
  }

  if (isError || !sessions) {
    return (
      <p role="alert" className="text-sm text-state-error">
        {t.error}
      </p>
    );
  }

  const ordered = [...sessions].sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent));

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col divide-y divide-white/8 overflow-hidden rounded-[20px] border border-white/10 bg-white/3">
        {ordered.map((session) => {
          const device = parseUserAgent(session.userAgent);
          const Icon = DEVICE_ICONS[device.kind];
          const name =
            device.browser && device.os
              ? t.on(device.browser, device.os)
              : (device.browser ?? device.os ?? t.unknownDevice);
          const activity =
            session.isCurrent || format.secondsAgo(session.lastUsedAt) < RECENT_SECONDS
              ? t.activeNow
              : t.active(format.relative(session.lastUsedAt));
          const isRevoking = revoke.isPending && revoke.variables?.id === session.id;
          return (
            <li key={session.id} className="flex items-center gap-3 p-4">
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-full',
                  session.isCurrent ? 'bg-viratec-lime text-viratec-ink' : 'bg-white/8 text-white',
                )}
              >
                <Icon aria-hidden="true" className="size-[18px]" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-white">
                  {name}
                  {session.isCurrent && (
                    <span className="rounded-full bg-viratec-lime/14 px-2.5 py-0.5 text-xs font-medium text-viratec-accent">
                      {t.thisDevice}
                    </span>
                  )}
                </span>
                <span className="text-sm text-viratec-subtle">
                  {[activity, session.ipAddress, t.signedIn(format.absolute(session.createdAt))]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => revoke.mutate(session)}
                disabled={revoke.isPending}
                aria-label={t.signOutLabel(name)}
                className="shrink-0 cursor-pointer rounded-full border border-white/22 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRevoking ? (
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  t.signOut
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {revoke.isError && (
        <p role="alert" className="text-sm text-state-error">
          {t.revokeError}
        </p>
      )}
    </div>
  );
}

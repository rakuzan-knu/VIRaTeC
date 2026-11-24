import { useEffect, useState } from 'react';
import { INTL_LOCALE, useLocale } from '@/shared/i18n';
import { useGlobeMessages } from '../model/messages';

const REFRESH_MS = 15_000;

interface GlobeLocalTimeProps {
  timeZone: string;
}

export function GlobeLocalTime({ timeZone }: GlobeLocalTimeProps) {
  const t = useGlobeMessages();
  const locale = useLocale();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), REFRESH_MS);
    return () => window.clearInterval(timer);
  }, []);

  const time = new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(now);

  return (
    <p className="text-sm leading-5">
      <span className="text-viratec-subtle">{t.localTime}: </span>
      <time dateTime={new Date(now).toISOString()} className="text-white tabular-nums">
        {time}
      </time>
    </p>
  );
}

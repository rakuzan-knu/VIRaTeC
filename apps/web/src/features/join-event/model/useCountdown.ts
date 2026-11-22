import { useEffect, useState } from 'react';

const TICK_MS = 1000;

export function useCountdown(target: string | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return;
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, [target]);

  return target ? Math.max(0, Date.parse(target) - now) : 0;
}

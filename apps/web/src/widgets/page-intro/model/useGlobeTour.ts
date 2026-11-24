import { useEffect, useEffectEvent, useState } from 'react';

const TOUR_STEP_MS = 6000;

export function useGlobeTour(onStep: () => void) {
  const [isTouring, setIsTouring] = useState(false);
  const step = useEffectEvent(onStep);

  useEffect(() => {
    if (!isTouring) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) step();
    }, TOUR_STEP_MS);
    return () => window.clearInterval(timer);
  }, [isTouring]);

  return { isTouring, setIsTouring };
}

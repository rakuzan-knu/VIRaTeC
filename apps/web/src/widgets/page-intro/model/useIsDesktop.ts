import { useSyncExternalStore } from 'react';

const DESKTOP_QUERY = '(min-width: 64rem)';

function subscribe(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

const getSnapshot = () => window.matchMedia(DESKTOP_QUERY).matches;

const getServerSnapshot = () => true;

export const useIsDesktop = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

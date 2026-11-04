import { useSyncExternalStore } from 'react';

const VIDEO_MEDIA_QUERY = '(min-width: 1024px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } };

function subscribeToMediaQueries(onChange: () => void) {
  const queries = [VIDEO_MEDIA_QUERY, REDUCED_MOTION_QUERY].map((query) =>
    window.matchMedia(query),
  );
  queries.forEach((query) => query.addEventListener('change', onChange));
  return () => queries.forEach((query) => query.removeEventListener('change', onChange));
}

function getCanPlayVideo() {
  const saveData = (navigator as NavigatorWithConnection).connection?.saveData === true;
  return (
    !saveData &&
    window.matchMedia(VIDEO_MEDIA_QUERY).matches &&
    !window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

function getServerCanPlayVideo() {
  return false;
}

export function useCanPlayHeroVideo() {
  return useSyncExternalStore(subscribeToMediaQueries, getCanPlayVideo, getServerCanPlayVideo);
}

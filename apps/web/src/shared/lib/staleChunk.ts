const RELOAD_KEY = 'viratec_stale_chunk_reload';
const RELOAD_COOLDOWN_MS = 10_000;
const STALE_CHUNK_PATTERN =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS/i;

export const isStaleChunkError = (error: unknown): boolean =>
  error instanceof Error && STALE_CHUNK_PATTERN.test(error.message);

export const reloadForStaleChunk = (): boolean => {
  try {
    const lastReload = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - lastReload < RELOAD_COOLDOWN_MS) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
};

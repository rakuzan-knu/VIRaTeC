import { setTimeout as sleep } from 'node:timers/promises';

export async function withMinimumDuration<T>(minimumMs: number, task: () => Promise<T>) {
  const startedAt = Date.now();
  try {
    return await task();
  } finally {
    const remaining = minimumMs - (Date.now() - startedAt);
    if (remaining > 0) await sleep(remaining);
  }
}

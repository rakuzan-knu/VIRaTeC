import assert from 'node:assert/strict';
import { test } from 'node:test';
import { withMinimumDuration } from '../dist/common/timing/minimum-duration.js';

const elapsed = async (task: () => Promise<unknown>) => {
  const startedAt = Date.now();
  await task().catch(() => undefined);
  return Date.now() - startedAt;
};

test('fast work is padded to the minimum duration', async () => {
  let result: unknown;
  const duration = await elapsed(async () => {
    result = await withMinimumDuration(120, async () => 'done');
  });
  assert.equal(result, 'done');
  assert.ok(duration >= 115, `took ${duration}ms`);
});

test('failures are padded too, so errors do not answer faster', async () => {
  const duration = await elapsed(() =>
    withMinimumDuration(120, async () => {
      throw new Error('boom');
    }),
  );
  assert.ok(duration >= 115, `took ${duration}ms`);
  await assert.rejects(
    withMinimumDuration(10, async () => {
      throw new Error('boom');
    }),
    /boom/,
  );
});

test('slow work is not delayed further', async () => {
  const duration = await elapsed(() =>
    withMinimumDuration(50, () => new Promise((resolve) => setTimeout(resolve, 150))),
  );
  assert.ok(duration < 250, `took ${duration}ms`);
});

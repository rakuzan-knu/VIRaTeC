import assert from 'node:assert/strict';
import test from 'node:test';
import { isMeetingUrl, meetingPlatformOf, EventRecordSchema } from '@viratec/contracts';
import { buildMimeMessage } from '../dist/auth/mail.client.js';
import {
  eventPublishOutcome,
  resolveEventAccess,
  toPublicEvent,
} from '../dist/events/event-access.js';
import { buildEventMail } from '../dist/events/event-mail.js';
import {
  createUnsubscribeToken,
  readUnsubscribeToken,
} from '../dist/events/event-unsubscribe-token.js';
import { EventNotificationsService } from '../dist/events/event-notifications.service.js';
import {
  EventDispatchScheduler,
  SCHEDULING_HORIZON_MS,
} from '../dist/events/event-dispatch.scheduler.js';

const START = new Date('2026-12-01T10:00:00.000Z');
const END = new Date('2026-12-01T12:00:00.000Z');
const MEETING_URL = 'https://us02web.zoom.us/j/123456789?pwd=secret';
const KEY = Buffer.alloc(32, 7);

const event = (overrides: Record<string, unknown> = {}) => ({
  status: 'SCHEDULED',
  startDate: START,
  endDate: END,
  meetingUrl: MEETING_URL,
  joinOpensMinutesBefore: 10,
  joinAccess: 'EVERYONE',
  ...overrides,
});

const guest = { signedIn: false, registered: false };
const member = { signedIn: true, registered: false };
const subscriber = { signedIn: true, registered: true };
const beforeOpen = new Date('2026-12-01T09:49:59.000Z');
const afterOpen = new Date('2026-12-01T09:50:00.000Z');

test('the meeting link is closed until the opening time and open to everyone after it', () => {
  assert.equal(resolveEventAccess(event(), guest, beforeOpen), 'NOT_YET');
  assert.equal(resolveEventAccess(event(), guest, afterOpen), 'OPEN');
});

test('restricted events ask guests to sign in and members to subscribe', () => {
  const registered = event({ joinAccess: 'REGISTERED' });
  const subscribed = event({ joinAccess: 'SUBSCRIBED' });
  assert.equal(resolveEventAccess(registered, guest, afterOpen), 'SIGN_IN_REQUIRED');
  assert.equal(resolveEventAccess(registered, member, afterOpen), 'OPEN');
  assert.equal(resolveEventAccess(subscribed, member, afterOpen), 'SUBSCRIPTION_REQUIRED');
  assert.equal(resolveEventAccess(subscribed, subscriber, afterOpen), 'OPEN');
});

test('cancelled, finished and link-less events never open', () => {
  assert.equal(resolveEventAccess(event({ status: 'CANCELLED' }), guest, afterOpen), 'CANCELLED');
  assert.equal(resolveEventAccess(event(), guest, END), 'ENDED');
  assert.equal(resolveEventAccess(event({ meetingUrl: null }), guest, afterOpen), 'NO_MEETING');
});

test('the public event never exposes the meeting link', () => {
  const published = toPublicEvent({
    ...event(),
    id: 'id',
    title: 'Title',
    description: 'Description',
    type: 'WORKSHOP',
    faculty: 'FIT',
    location: 'Online',
    isOnline: true,
    capacity: null,
    registrationLink: null,
    translations: null,
    recordingUrl: null,
    cancelReason: null,
    scheduleVersion: 3,
    createdAt: START,
    updatedAt: START,
  } as never);
  assert.equal(JSON.stringify(published).includes('zoom.us/j'), false);
  assert.equal('scheduleVersion' in published, false);
  assert.equal(published.meetingPlatform, 'zoom');
});

test('only real meeting hosts over https are accepted', () => {
  assert.equal(meetingPlatformOf('https://meet.google.com/abc-defg-hij'), 'meet');
  assert.equal(meetingPlatformOf('https://teams.microsoft.com/l/meetup-join/1'), 'teams');
  assert.equal(isMeetingUrl('http://zoom.us/j/1'), false);
  assert.equal(isMeetingUrl('https://zoom.us.evil.example/j/1'), false);
  assert.equal(isMeetingUrl('https://evil-zoom.us/j/1'), false);
});

test('event drafts saved before meetings existed stay valid', () => {
  const parsed = EventRecordSchema.parse({
    type: 'WORKSHOP',
    faculty: 'FIT',
    location: 'Room 40',
    isOnline: false,
    startDate: START.toISOString(),
    endDate: END.toISOString(),
    capacity: null,
    registrationLink: null,
    translations: { en: { meta: '', title: 'Title', description: 'Text', actionLabel: '' } },
  });
  assert.equal(parsed.meetingUrl, null);
  assert.equal(parsed.joinOpensMinutesBefore, 10);
  assert.equal(parsed.joinAccess, 'EVERYONE');
  assert.equal(parsed.status, 'SCHEDULED');
});

test('publishing notifies subscribers only about a new time or a cancellation', () => {
  const now = new Date('2026-11-20T00:00:00.000Z');
  const previous = { startDate: START, status: 'SCHEDULED' };
  const same = { startDate: START, endDate: END, status: 'SCHEDULED' };
  const moved = { ...same, startDate: new Date('2026-12-02T10:00:00.000Z') };
  const cancelled = { ...same, status: 'CANCELLED' };

  assert.deepEqual(eventPublishOutcome(previous as never, same as never, now), {
    versionChanged: false,
    notification: null,
  });
  assert.deepEqual(eventPublishOutcome(previous as never, moved as never, now), {
    versionChanged: true,
    notification: 'RESCHEDULED',
  });
  assert.deepEqual(eventPublishOutcome(previous as never, cancelled as never, now), {
    versionChanged: true,
    notification: 'CANCELLED',
  });
  assert.deepEqual(
    eventPublishOutcome({ startDate: START, status: 'CANCELLED' } as never, same as never, now),
    { versionChanged: true, notification: 'RESCHEDULED' },
  );
});

test('finished events are not announced', () => {
  const after = new Date('2026-12-05T00:00:00.000Z');
  assert.equal(
    eventPublishOutcome(
      { startDate: START, status: 'SCHEDULED' } as never,
      { startDate: START, endDate: END, status: 'CANCELLED' } as never,
      after,
    ).notification,
    null,
  );
});

test('unsubscribe tokens resist tampering', () => {
  const token = createUnsubscribeToken(KEY, 'registration-1');
  assert.equal(readUnsubscribeToken(KEY, token), 'registration-1');
  assert.equal(readUnsubscribeToken(KEY, token.replace('registration-1', 'registration-2')), null);
  assert.equal(readUnsubscribeToken(Buffer.alloc(32, 8), token), null);
  assert.equal(readUnsubscribeToken(KEY, 'garbage'), null);
});

const mailInput = {
  kind: 'JOIN_OPEN',
  locale: 'uk',
  timeZone: 'Europe/Kyiv',
  title: 'Воркшоп\n<script>',
  startDate: START,
  cancelReason: null,
  meetingUrl: MEETING_URL,
  pageUrl: 'https://viratec.example/events/1',
  unsubscribeUrl: 'https://viratec.example/events/unsubscribe?token=a.b',
} as const;

test('the link email carries the meeting link and escapes the title', () => {
  const mail = buildEventMail(mailInput);
  assert.match(mail.subject, /^Можна заходити: Воркшоп <script>$/);
  assert.ok(mail.text.includes(MEETING_URL));
  assert.ok(mail.html.includes('&lt;script&gt;'));
  assert.equal(mail.html.includes('<script>'), false);
  assert.match(mail.text, /GMT\+2|EET/);
});

test('reschedule and cancellation emails link to the page, not the meeting', () => {
  const moved = buildEventMail({ ...mailInput, kind: 'RESCHEDULED' });
  const cancelled = buildEventMail({ ...mailInput, kind: 'CANCELLED', cancelReason: 'Хвороба' });
  assert.equal(moved.text.includes(MEETING_URL), false);
  assert.equal(cancelled.text.includes(MEETING_URL), false);
  assert.ok(cancelled.text.includes('Хвороба'));
});

test('every locale builds an email and unknown locales fall back to English', () => {
  for (const locale of ['en', 'uk', 'de', 'fr', 'ar']) {
    assert.ok(buildEventMail({ ...mailInput, locale }).html.includes(`lang="${locale}"`));
  }
  assert.ok(buildEventMail({ ...mailInput, locale: 'xx' }).html.includes('lang="en"'));
  assert.ok(buildEventMail({ ...mailInput, locale: 'ar' }).html.includes('dir="rtl"'));
});

test('MIME messages stay plain without html and become alternative with it', () => {
  const plain = buildMimeMessage('VIRaTeC <a@example.invalid>', {
    to: 'b@example.invalid',
    subject: 'Hi',
    text: 'Body',
  });
  assert.match(plain, /^Content-Type: text\/plain; charset=UTF-8$/m);

  const rich = buildMimeMessage('VIRaTeC <a@example.invalid>', {
    to: 'b@example.invalid',
    subject: 'Hi',
    text: 'Body',
    html: '<p>Body</p>',
    headers: { 'List-Unsubscribe': '<https://example.invalid/u>' },
  });
  assert.match(rich, /^Content-Type: multipart\/alternative; boundary=/m);
  assert.match(rich, /^List-Unsubscribe: <https:\/\/example\.invalid\/u>$/m);
  assert.match(rich, /^Content-Type: text\/html; charset=UTF-8$/m);

  assert.throws(() =>
    buildMimeMessage('VIRaTeC <a@example.invalid>', {
      to: 'b@example.invalid',
      subject: 'Hi',
      text: 'Body',
      headers: { 'List-Unsubscribe': '<x>\r\nBcc: all@example.invalid' },
    }),
  );
});

interface FakeNotification {
  id: string;
  kind: string;
  scheduleVersion: number;
  registration: {
    id: string;
    locale: string;
    timeZone: string;
    event: Record<string, unknown>;
    user: { email: string; isBlocked: boolean };
  };
}

const notification = (
  id: string,
  overrides: Partial<FakeNotification> = {},
  eventOverrides: Record<string, unknown> = {},
  isBlocked = false,
): FakeNotification => ({
  id,
  kind: 'JOIN_OPEN',
  scheduleVersion: 1,
  registration: {
    id: `registration-${id}`,
    locale: 'en',
    timeZone: 'Europe/Kyiv',
    user: { email: `${id}@example.invalid`, isBlocked },
    event: {
      id: 'event',
      title: 'Workshop',
      translations: null,
      status: 'SCHEDULED',
      startDate: new Date(Date.now() + 5 * 60_000),
      endDate: new Date(Date.now() + 60 * 60_000),
      meetingUrl: MEETING_URL,
      cancelReason: null,
      scheduleVersion: 1,
      ...eventOverrides,
    },
  },
  ...overrides,
});

function dispatcher(
  pending: FakeNotification[],
  sentRecently = 0,
  failFor?: string,
  stillPending = 0,
) {
  const scheduled: string[] = [];
  const mailed: Record<string, string>[] = [];
  const sent: string[] = [];
  const updated: string[] = [];
  const deleted: string[] = [];
  let claims = 0;
  const prisma = {
    event: { findMany: async () => [] },
    eventRegistration: { findMany: async () => [] },
    eventNotification: {
      count: async ({ where }: { where: { sentAt: unknown } }) =>
        where.sentAt === null ? stillPending : sentRecently,
      createMany: async () => ({ count: 0 }),
      findMany: async ({ where }: { where: { id: { in: string[] } } }) =>
        pending.filter((item) => where.id.in.includes(item.id)),
      update: async ({ where }: { where: { id: string } }) => {
        updated.push(where.id);
      },
      delete: async ({ where }: { where: { id: string } }) => {
        deleted.push(where.id);
      },
    },
    $queryRaw: async (_sql: TemplateStringsArray, ...values: unknown[]) => {
      claims += 1;
      if (claims > 1) return [];
      const limit = values.find((value) => typeof value === 'number' && value !== 5) as number;
      return pending.slice(0, limit ?? pending.length).map((item) => ({ id: item.id }));
    },
  };
  const mail = {
    buildLink: (path: string) => `https://viratec.example${path}`,
    send: async ({ to, headers }: { to: string; headers: Record<string, string> }) => {
      if (to === failFor) throw new Error('Gmail is down');
      mailed.push(headers);
      sent.push(to);
    },
  };
  const config = {
    getOrThrow: (key: string) => (key === 'cron.eventMailDailyLimit' ? 400 : KEY),
  };
  const scheduler = {
    scheduleAt: async (_when: Date, id: string) => {
      scheduled.push(id);
    },
    scheduleOpeningWithinHorizon: async (event: { id: string }) => {
      scheduled.push(`open-${event.id}`);
    },
  };
  const service = new EventNotificationsService(
    prisma as never,
    config as never,
    mail as never,
    scheduler as never,
  );
  return { service, sent, updated, deleted, scheduled, mailed, prisma };
}

test('dispatch sends due emails and marks them as sent', async () => {
  const { service, sent, updated } = dispatcher([notification('a'), notification('b')]);
  const result = await service.dispatch();
  assert.deepEqual(sent, ['a@example.invalid', 'b@example.invalid']);
  assert.deepEqual(updated, ['a', 'b']);
  assert.equal(result.sent, 2);
});

test('dispatch respects the daily limit', async () => {
  const { service, sent } = dispatcher([notification('a')], 400);
  const result = await service.dispatch();
  assert.deepEqual(sent, []);
  assert.equal(result.limitReached, true);
});

test('dispatch drops stale notifications instead of sending them', async () => {
  const { service, sent, deleted } = dispatcher([
    notification('moved', { scheduleVersion: 1 }, { scheduleVersion: 2 }),
    notification('over', {}, { endDate: new Date(Date.now() - 1000) }),
    notification('cancelled', {}, { status: 'CANCELLED' }),
    notification('blocked', {}, {}, true),
  ]);
  await service.dispatch();
  assert.deepEqual(sent, []);
  assert.deepEqual(deleted, ['moved', 'over', 'cancelled', 'blocked']);
});

test('a failed delivery stops the run and is not marked as sent', async () => {
  const { service, sent, updated } = dispatcher(
    [notification('a'), notification('b'), notification('c')],
    0,
    'b@example.invalid',
  );
  await service.dispatch();
  assert.deepEqual(sent, ['a@example.invalid']);
  assert.deepEqual(updated, ['a']);
});

test('event emails offer one-click unsubscribe', async () => {
  const { service, mailed } = dispatcher([notification('a')]);
  await service.dispatch();
  assert.equal(mailed[0]['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');
  assert.match(mailed[0]['List-Unsubscribe'], /\/api\/v1\/events\/unsubscribe\/one-click/);
});

test('a run with work left schedules its own continuation', async () => {
  const { service, scheduled } = dispatcher([], 0, undefined, 3);
  await service.dispatch();
  assert.equal(scheduled.length, 1);
  assert.match(scheduled[0], /^event-backlog-/);
});

test('a finished run schedules nothing, so the database can sleep', async () => {
  const { service, scheduled } = dispatcher([notification('a')]);
  await service.dispatch();
  assert.deepEqual(scheduled, []);
});

test('the daily run plans upcoming openings', async () => {
  const { service, scheduled, prisma } = dispatcher([]);
  let eventQueries = 0;
  prisma.event.findMany = async () => {
    eventQueries += 1;
    return (eventQueries === 1 ? [{ id: 'soon' }] : []) as never;
  };
  const result = await service.runDaily();
  assert.deepEqual(scheduled, ['open-soon']);
  assert.equal(result.planned, 1);
});

const schedulerWith = (cron: Record<string, string>) =>
  new EventDispatchScheduler({
    getOrThrow: (key: string) => (key === 'cron' ? cron : 'https://viratec.example'),
  } as never);

const opening = (opensInMs: number) => ({
  id: 'event',
  startDate: new Date(Date.now() + opensInMs + 10 * 60_000),
  joinOpensMinutesBefore: 10,
  scheduleVersion: 2,
});

test('openings are published to QStash at the exact moment with the secret forwarded', async () => {
  const calls: { url: string; headers: Record<string, string> }[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (url: string, init: { headers: Record<string, string> }) => {
    calls.push({ url, headers: init.headers });
    return new Response('{}', { status: 200 });
  }) as never;
  try {
    const scheduler = schedulerWith({
      secret: 'cron-secret',
      qstashToken: 'q-token',
      qstashUrl: 'https://qstash.upstash.io',
    });
    const event = opening(60 * 60_000);
    await scheduler.scheduleOpeningWithinHorizon(event, new Date());
    assert.equal(calls.length, 1);
    assert.equal(
      calls[0].url,
      'https://qstash.upstash.io/v2/publish/https://viratec.example/api/v1/internal/event-notifications/dispatch',
    );
    assert.equal(calls[0].headers['Upstash-Method'], 'GET');
    assert.equal(calls[0].headers['Upstash-Forward-Authorization'], 'Bearer cron-secret');
    assert.equal(
      calls[0].headers['Upstash-Not-Before'],
      String(Math.ceil((event.startDate.getTime() - 10 * 60_000) / 1000)),
    );

    calls.length = 0;
    await scheduler.scheduleOpeningWithinHorizon(
      opening(SCHEDULING_HORIZON_MS + 60_000),
      new Date(),
    );
    assert.equal(calls.length, 0);
  } finally {
    globalThis.fetch = original;
  }
});

test('scheduling is skipped without a token and never throws', async () => {
  const original = globalThis.fetch;
  let called = 0;
  globalThis.fetch = (async () => {
    called += 1;
    throw new Error('network');
  }) as never;
  try {
    await schedulerWith({ secret: 's', qstashToken: '', qstashUrl: 'https://q' }).scheduleAt(
      new Date(),
      'a',
    );
    assert.equal(called, 0);
    await schedulerWith({ secret: 's', qstashToken: 't', qstashUrl: 'https://q' }).scheduleAt(
      new Date(),
      'a',
    );
    assert.equal(called, 1);
  } finally {
    globalThis.fetch = original;
  }
});

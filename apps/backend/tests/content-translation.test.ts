import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { hasCode } from './support.ts';
import { TranslationService } from '../dist/content/translation.service.js';

interface SentRequest {
  url: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
}

const actor = { id: 'editor-1' };
const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const setup = (apiKey: string, reply: { stop_reason: string; text: string }) => {
  const sent: SentRequest[] = [];
  const limits: string[] = [];
  globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
    sent.push({
      url: String(input),
      headers: init?.headers as Record<string, string>,
      body: JSON.parse(String(init?.body)) as Record<string, unknown>,
    });
    return new Response(
      JSON.stringify({
        stop_reason: reply.stop_reason,
        content: [{ type: 'text', text: reply.text }],
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  };
  const config = { get: () => apiKey };
  const rateLimit = { consume: async (key: string) => void limits.push(key) };
  return { service: new TranslationService(config, rateLimit), sent, limits };
};

test('translation explains when the API key is not configured', async () => {
  const { service, sent } = setup('', { stop_reason: 'end_turn', text: '' });
  await assert.rejects(
    service.translate(actor, { from: 'uk', to: 'en', texts: ['Привіт'] }),
    hasCode(503, 'TRANSLATION_NOT_CONFIGURED'),
  );
  assert.equal(sent.length, 0);
});

test('translation sends one structured request and returns the texts in order', async () => {
  const { service, sent, limits } = setup('test-key', {
    stop_reason: 'end_turn',
    text: JSON.stringify({ translations: ['Let us research together', '500+ students'] }),
  });
  const result = await service.translate(actor, {
    from: 'uk',
    to: 'en',
    texts: ['Створюймо дослідження разом', '500+ студентів'],
  });

  assert.deepEqual(result, { translations: ['Let us research together', '500+ students'] });
  assert.deepEqual(limits, ['translate:editor-1']);
  const [request] = sent;
  assert.equal(request?.url, 'https://api.anthropic.com/v1/messages');
  assert.equal(request?.headers['x-api-key'], 'test-key');
  assert.equal(request?.headers['anthropic-version'], '2026-10-21');
  assert.equal(request?.body.model, 'claude-sonnet-5-5');
  assert.equal(request?.body.fallbacks, 'default');
  assert.equal('temperature' in (request?.body ?? {}), false);
});

test('a refused translation is reported separately from an outage', async () => {
  const { service } = setup('test-key', { stop_reason: 'refusal', text: '' });
  await assert.rejects(
    service.translate(actor, { from: 'en', to: 'uk', texts: ['Hello'] }),
    hasCode(422, 'TRANSLATION_REFUSED'),
  );
});

test('a reply with the wrong number of texts is never returned', async () => {
  const { service } = setup('test-key', {
    stop_reason: 'end_turn',
    text: JSON.stringify({ translations: ['One'] }),
  });
  await assert.rejects(
    service.translate(actor, { from: 'en', to: 'uk', texts: ['One', 'Two'] }),
    hasCode(503, 'TRANSLATION_UNAVAILABLE'),
  );
});

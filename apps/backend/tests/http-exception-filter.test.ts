import assert from 'node:assert/strict';
import { test } from 'node:test';
import { UnauthorizedException } from '@nestjs/common';
import { AllExceptionsFilter } from '../dist/common/filters/http-exception.filter.js';

interface FilterBody {
  statusCode: number;
  error: { message: string };
}

function captureResponse(exception: unknown) {
  const filter = new AllExceptionsFilter();
  filter.logger = { error() {} };
  const captured: { statusCode?: number; body?: FilterBody } = {};
  const reply = {
    status(value: number) {
      captured.statusCode = value;
      return this;
    },
    send(value: FilterBody) {
      captured.body = value;
    },
  };
  filter.catch(exception, {
    switchToHttp: () => ({
      getResponse: () => reply,
      getRequest: () => ({ method: 'GET', url: '/api/v1/auth/me' }),
    }),
  });
  const { statusCode, body } = captured;
  assert.ok(body);
  return { statusCode, body };
}

test('unauthenticated requests preserve the HTTP 401 response', () => {
  const result = captureResponse(new UnauthorizedException());
  assert.equal(result.statusCode, 401);
  assert.equal(result.body.statusCode, 401);
});

test('HTTP errors from a separate bundled NestJS copy preserve their status', () => {
  const result = captureResponse({
    getStatus: () => 403,
    getResponse: () => ({ message: 'Forbidden', statusCode: 403 }),
  });
  assert.equal(result.statusCode, 403);
  assert.equal(result.body.error.message, 'Forbidden');
});

test('unexpected errors return a generic 500 without exposing internals', () => {
  const result = captureResponse(new Error('private database details'));
  assert.equal(result.statusCode, 500);
  assert.equal(result.body.error.message, 'Internal server error');
  assert.ok(!JSON.stringify(result.body).includes('private database details'));
});

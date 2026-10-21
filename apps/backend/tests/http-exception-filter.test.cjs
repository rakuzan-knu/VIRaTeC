const assert = require('node:assert/strict');
const { test } = require('node:test');
const { UnauthorizedException } = require('@nestjs/common');
const { AllExceptionsFilter } = require('../dist/common/filters/http-exception.filter.js');

function captureResponse(exception) {
  const filter = new AllExceptionsFilter();
  filter.logger = { error() {} };
  let statusCode;
  let body;
  const reply = {
    status(value) {
      statusCode = value;
      return this;
    },
    send(value) {
      body = value;
    },
  };
  filter.catch(exception, {
    switchToHttp: () => ({
      getResponse: () => reply,
      getRequest: () => ({ method: 'GET', url: '/api/v1/auth/me' }),
    }),
  });
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

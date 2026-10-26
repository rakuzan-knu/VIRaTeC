import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hasStatus } from './support.ts';
import { detectImageType, parseAvatarImage } from '../dist/users/avatar.js';

const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]);
const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBPVP8 ')]);
const toDataUrl = (type: string, buffer: Buffer) =>
  `data:${type};base64,${buffer.toString('base64')}`;

test('detects supported images by their signature', () => {
  assert.equal(detectImageType(png), 'image/png');
  assert.equal(detectImageType(jpeg), 'image/jpeg');
  assert.equal(detectImageType(webp), 'image/webp');
  assert.equal(detectImageType(Buffer.from('<svg onload="alert(1)">')), null);
});

test('accepts an image whose content matches its declared type', () => {
  const { data, mimeType } = parseAvatarImage(toDataUrl('image/webp', webp));
  assert.equal(mimeType, 'image/webp');
  assert.deepEqual(data, webp);
});

test('rejects content that does not match the declared type', () => {
  assert.throws(() => parseAvatarImage(toDataUrl('image/png', jpeg)), hasStatus(400));
  assert.throws(
    () => parseAvatarImage(toDataUrl('image/png', Buffer.from('<svg/>'))),
    hasStatus(400),
  );
});

test('rejects values that are not base64 image data URLs', () => {
  assert.throws(() => parseAvatarImage('https://example.invalid/avatar.png'), hasStatus(400));
});

test('rejects images over the size limit', () => {
  const large = Buffer.concat([png, Buffer.alloc(512 * 1024)]);
  assert.throws(() => parseAvatarImage(toDataUrl('image/png', large)), hasStatus(413));
});

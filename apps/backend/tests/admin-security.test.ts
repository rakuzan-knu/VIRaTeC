import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hasCode, hasStatus } from './support.ts';
import { randomBytes } from 'node:crypto';
import argon2 from 'argon2';
import {
  base32Encode,
  generateTotp,
  verifyTotp,
  encryptSecret,
  decryptSecret,
} from '../dist/security/crypto.js';
import { effectiveStaff } from '../dist/security/staff.js';
import { toAccount } from '../dist/security/account.js';
import { StaffGuard } from '../dist/common/guards/staff.guard.js';
import { AdminService } from '../dist/admin/admin.service.js';
import { AuthService } from '../dist/auth/auth.service.js';

const RFC_SECRET = base32Encode(Buffer.from('12345678901234567890'));

test('TOTP matches the RFC 6238 SHA-1 test vector', () => {
  assert.equal(generateTotp(RFC_SECRET, 1), '287082');
  assert.equal(generateTotp(RFC_SECRET, Math.floor(1111111109 / 30)), '081804');
});

test('a TOTP code cannot be replayed within its window', () => {
  const now = 59_000;
  const step = verifyTotp(RFC_SECRET, '287082', null, now);
  assert.equal(step, 1);
  assert.equal(verifyTotp(RFC_SECRET, '287082', step, now), null);
  assert.equal(verifyTotp(RFC_SECRET, '000000', null, now), null);
  assert.equal(verifyTotp(RFC_SECRET, '28708', null, now), null);
});

test('encrypted secrets round-trip and reject tampering', () => {
  const key = randomBytes(32);
  const payload = encryptSecret('JBSWY3DPEHPK3PXP', key);
  assert.notEqual(payload.includes('JBSWY3DPEHPK3PXP'), true);
  assert.equal(decryptSecret(payload, key), 'JBSWY3DPEHPK3PXP');
  const parts = payload.split(':');
  parts[3] = Buffer.from('tampered').toString('base64url');
  assert.throws(() => decryptSecret(parts.join(':'), key));
  assert.throws(() => decryptSecret(payload, randomBytes(32)));
});

const baseUser = {
  id: 'user-1',
  email: 'user@example.invalid',
  name: 'User',
  role: 'STUDENT',
  passwordHash: 'hash',
  googleId: null,
  twoFactorSecret: 'v1:secret',
  twoFactorPendingSecret: 'v1:pending',
  twoFactorLastStep: 42,
  twoFactorEnabled: true,
  isBlocked: false,
  staffRole: 'ADMIN',
  permissions: ['DASHBOARD_VIEW'],
  staffExpiresAt: null,
};

test('accounts never expose two-factor secrets or internal flags', () => {
  const account = toAccount(baseUser);
  for (const field of [
    'passwordHash',
    'googleId',
    'twoFactorSecret',
    'twoFactorPendingSecret',
    'twoFactorLastStep',
    'isBlocked',
  ]) {
    assert.equal(field in account, false, `${field} leaked`);
  }
  assert.equal(account.twoFactorEnabled, true);
  assert.equal(account.staffRole, 'ADMIN');
  assert.deepEqual(account.permissions, ['DASHBOARD_VIEW']);
});

test('expired administrator access is treated as no access', () => {
  const expired = effectiveStaff({ ...baseUser, staffExpiresAt: new Date(Date.now() - 1000) });
  assert.deepEqual(expired, { staffRole: 'NONE', permissions: [] });
  const owner = effectiveStaff({ ...baseUser, staffRole: 'OWNER', permissions: [] });
  assert.equal(owner.staffRole, 'OWNER');
  assert.ok(owner.permissions.includes('AUDIT_VIEW'));
});

const guardContext = (user: object, metadata: Record<string, unknown> = {}) => ({
  switchToHttp: () => ({ getRequest: () => ({ user }) }),
  getHandler: () => 'handler',
  getClass: () => 'class',
  metadata,
});

const reflector = (metadata: Record<string, unknown>) => ({
  getAllAndOverride: (key: string) => metadata[key],
});

const staffUser = {
  id: 'admin-1',
  staffRole: 'ADMIN',
  permissions: ['DASHBOARD_VIEW'],
  twoFactorEnabled: true,
  mfaVerifiedAt: new Date(),
  elevatedUntil: null,
};

const expectCode = (fn: () => unknown, code: string) => assert.throws(fn, hasCode(403, code));

test('the staff guard enforces role, 2FA, permissions, ownership and step-up', () => {
  const guard = (metadata: Record<string, unknown>) => new StaffGuard(reflector(metadata));

  expectCode(
    () => guard({}).canActivate(guardContext({ ...staffUser, staffRole: 'NONE' })),
    'ADMIN_ACCESS_REQUIRED',
  );
  expectCode(
    () => guard({}).canActivate(guardContext({ ...staffUser, twoFactorEnabled: false })),
    'MFA_SETUP_REQUIRED',
  );
  expectCode(
    () => guard({}).canActivate(guardContext({ ...staffUser, mfaVerifiedAt: null })),
    'MFA_REVERIFY_REQUIRED',
  );
  expectCode(
    () =>
      guard({}).canActivate(
        guardContext({ ...staffUser, mfaVerifiedAt: new Date(Date.now() - 13 * 3600_000) }),
      ),
    'MFA_REVERIFY_REQUIRED',
  );
  expectCode(
    () => guard({ 'staff:permissions': ['USERS_MANAGE'] }).canActivate(guardContext(staffUser)),
    'PERMISSION_DENIED',
  );
  expectCode(
    () => guard({ 'staff:owner': true }).canActivate(guardContext(staffUser)),
    'OWNER_REQUIRED',
  );
  expectCode(
    () => guard({ 'staff:stepUp': true }).canActivate(guardContext(staffUser)),
    'STEP_UP_REQUIRED',
  );

  assert.equal(
    guard({ 'staff:permissions': ['DASHBOARD_VIEW'] }).canActivate(guardContext(staffUser)),
    true,
  );
  assert.equal(
    guard({ 'staff:stepUp': true }).canActivate(
      guardContext({ ...staffUser, elevatedUntil: new Date(Date.now() + 60_000) }),
    ),
    true,
  );
});

test('administrators cannot change themselves, the owner or other administrators', async () => {
  const users: Record<string, typeof baseUser> = {
    'owner-1': { ...baseUser, id: 'owner-1', staffRole: 'OWNER' },
    'admin-2': { ...baseUser, id: 'admin-2', staffRole: 'ADMIN' },
  };
  const prisma = {
    user: { findUnique: async ({ where }: { where: { id: string } }) => users[where.id] ?? null },
  };
  const service = new AdminService(prisma, { record: async () => {} });
  const admin = { ...staffUser, id: 'admin-1' };

  for (const target of ['owner-1', 'admin-2']) {
    await assert.rejects(service.revokeAccess(admin, target, {}), hasStatus(403));
  }
  await assert.rejects(
    service.revokeAccess({ ...staffUser, id: 'owner-1', staffRole: 'OWNER' }, 'owner-1', {}),
    hasStatus(403),
  );
});

test('a password alone never opens a session when 2FA is enabled', async () => {
  const passwordHash = await argon2.hash('CorrectHorse1!');
  let tokensIssued = 0;
  let challenges = 0;
  const service = new AuthService(
    {
      user: {
        findUnique: async () => ({ ...baseUser, passwordHash, staffRole: 'NONE' }),
      },
      mfaChallenge: {
        deleteMany: async () => ({ count: 0 }),
        create: async () => {
          challenges++;
          return {};
        },
      },
      refreshToken: {
        create: async () => {
          tokensIssued++;
          return {};
        },
        deleteMany: async () => ({ count: 0 }),
      },
    },
    { signAsync: async () => 'token' },
    { get: () => undefined },
  );

  const result = await service.login({ email: baseUser.email, password: 'CorrectHorse1!' });
  assert.equal(result.mfaRequired, true);
  assert.equal(typeof result.challengeToken, 'string');
  assert.equal('accessToken' in result, false);
  assert.equal(tokensIssued, 0);
  assert.equal(challenges, 1);
});

test('suspended accounts cannot sign in even with the right password', async () => {
  const passwordHash = await argon2.hash('CorrectHorse1!');
  const service = new AuthService(
    { user: { findUnique: async () => ({ ...baseUser, passwordHash, isBlocked: true }) } },
    {},
    { get: () => undefined },
  );
  await assert.rejects(
    service.login({ email: baseUser.email, password: 'CorrectHorse1!' }),
    hasStatus(403),
  );
});

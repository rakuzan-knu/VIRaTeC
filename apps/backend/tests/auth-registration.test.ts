import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hasStatus } from './support.ts';
import { AuthService } from '../dist/auth/auth.service.js';

interface CreatedUserData {
  email: string;
  role?: string;
  passwordHash: string;
  termsVersion: string;
  termsAcceptedAt: Date;
}

interface StoredUser extends CreatedUserData {
  id: string;
  role: string;
}

for (const role of ['ADMIN', 'PROFESSOR', 'RESEARCHER']) {
  test(`public registration cannot grant ${role} privileges`, async () => {
    let databaseCalls = 0;
    const service = new AuthService(
      {
        user: {
          findUnique: async () => {
            databaseCalls++;
            return null;
          },
        },
      },
      {},
      {},
    );

    await assert.rejects(
      service.register({
        email: 'registration@example.invalid',
        password: 'RegistrationTest123!',
        name: 'Registration Test',
        role,
        acceptTerms: true,
      }),
      hasStatus(403),
    );
    assert.equal(databaseCalls, 0);
  });
}

for (const role of [undefined, 'STUDENT', 'PARTNER']) {
  test(`public registration preserves the ${role ?? 'default student'} account flow`, async () => {
    let storedUser: StoredUser | undefined;
    let tokenCount = 0;
    const service = new AuthService(
      {
        user: {
          findUnique: async () => null,
          create: async ({ data }: { data: CreatedUserData }) => {
            storedUser = { ...data, id: 'registration-test', role: data.role ?? 'STUDENT' };
            return storedUser;
          },
        },
        refreshToken: { create: async () => ({}), deleteMany: async () => ({ count: 0 }) },
      },
      { signAsync: async () => `token-${++tokenCount}` },
      { get: () => undefined },
    );

    const result = await service.register({
      email: 'Registration@Example.invalid',
      password: 'RegistrationTest123!',
      name: 'Registration Test',
      role,
      acceptTerms: true,
    });

    assert.ok(storedUser);
    assert.equal(storedUser.email, 'registration@example.invalid');
    assert.equal(storedUser.termsVersion, '1.1');
    assert.ok(storedUser.termsAcceptedAt instanceof Date);
    assert.equal(result.user.role, role ?? 'STUDENT');
    assert.equal(result.user.passwordHash, undefined);
    assert.ok(storedUser.passwordHash.startsWith('$argon2'));
    assert.ok(result.accessToken);
    assert.ok(result.refreshToken);
  });
}

test('public registration requires accepting the terms', async () => {
  let databaseCalls = 0;
  const service = new AuthService(
    {
      user: {
        findUnique: async () => {
          databaseCalls++;
          return null;
        },
      },
    },
    {},
    {},
  );

  await assert.rejects(
    service.register({
      email: 'registration@example.invalid',
      password: 'RegistrationTest123!',
      name: 'Registration Test',
    }),
    hasStatus(400),
  );
  assert.equal(databaseCalls, 0);
});

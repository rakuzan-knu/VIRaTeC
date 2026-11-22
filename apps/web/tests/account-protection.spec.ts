import { expect, test, type Page } from '@playwright/test';

const googleSdk = `
  let configuration;
  window.google = { accounts: { id: {
    initialize(options) { configuration = options; },
    renderButton(parent, options) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Google ' + options.text + ' ' + options.locale;
      button.onclick = () => configuration.callback({ credential: 'fixture-only-credential' });
      parent.append(button);
    }
  } } };
`;

const fixture = '/tests/fixtures/auth.html';
const controls = `${fixture}?start=/account-controls`;

const account = (overrides: Record<string, unknown> = {}) => ({
  id: 'A',
  name: 'Account A',
  email: 'a@example.test',
  role: 'STUDENT',
  faculty: 'FIT',
  createdAt: '2026-01-01T00:00:00.000Z',
  emailVerified: true,
  hasPassword: true,
  hasGoogle: false,
  twoFactorEnabled: false,
  termsVersion: '1.1',
  pendingEmail: null,
  ...overrides,
});

const apiError = (code: string) => ({ error: { code, message: 'Raw backend message' } });

const stubBase = async (page: Page) => {
  await page.route('https://accounts.google.com/gsi/client*', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: googleSdk }),
  );
  await page.route('**/api/v1/**', (route) => route.fulfill({ json: {} }));
};

test.beforeEach(({ page }) => stubBase(page));

const signIn = async (page: Page, user: ReturnType<typeof account>) => {
  await page.addInitScript(() => localStorage.setItem('viratec_locale', 'en'));
  await page.route('**/api/v1/auth/google', (route) => route.fulfill({ json: { user } }));
  await page.goto(controls);
  await page.getByRole('button', { name: /^Google signin_with/ }).click();
  await expect(page.getByRole('heading', { name: 'Account controls' })).toBeVisible();
};

test('a first-time visitor gets Ukrainian whatever the browser language is', async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: 'de-DE' });
  const page = await context.newPage();
  await stubBase(page);
  await page.goto(fixture);
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  await context.close();
});

test('registration sends the role the person selected', async ({ page }) => {
  const bodies: unknown[] = [];
  await page.addInitScript(() => localStorage.setItem('viratec_locale', 'en'));
  await page.route('**/api/v1/auth/register', (route) => {
    bodies.push(route.request().postDataJSON());
    return route.fulfill({ json: { user: account({ role: 'PROFESSOR' }) } });
  });
  await page.goto(fixture);
  await page.getByRole('link', { name: 'Create an account', exact: true }).click();
  await page.getByLabel('Full name').fill('Role Person');
  await page.getByLabel(/email/i).fill('role@example.test');
  await page.getByLabel('Your role').selectOption('PROFESSOR');
  await page.getByLabel(/^password$/i).fill('Password123');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Create new account' }).click();
  await expect.poll(() => bodies.length).toBe(1);
  expect(bodies[0]).toMatchObject({ role: 'PROFESSOR', acceptTerms: true });
});

test('outdated terms block the account until accepted', async ({ page }) => {
  await page.route('**/api/v1/auth/terms/accept', (route) => route.fulfill({ json: account() }));
  await signIn(page, account({ termsVersion: '1.0' }));
  const dialog = page.getByRole('dialog', { name: 'Our terms have changed' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'I accept' }).click();
  await expect(dialog).toHaveCount(0);
});

test('accepted terms show no dialog', async ({ page }) => {
  await signIn(page, account());
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('changing the email asks for the password and shows the pending address', async ({ page }) => {
  const bodies: unknown[] = [];
  await page.route('**/api/v1/auth/email/change', (route) => {
    bodies.push(route.request().postDataJSON());
    return route.fulfill({ json: account({ pendingEmail: 'new@example.test' }) });
  });
  await signIn(page, account());
  await page.getByLabel('New email address').fill('new@example.test');
  await page.getByRole('button', { name: 'Send confirmation link' }).click();
  await expect(page.getByText('Enter your password')).toBeVisible();
  expect(bodies).toEqual([]);
  await page.getByLabel('Your password').first().fill('Password123');
  await page.getByRole('button', { name: 'Send confirmation link' }).click();
  await expect(page.getByText(/Waiting for confirmation of new@example.test/)).toBeVisible();
  expect(bodies[0]).toMatchObject({ newEmail: 'new@example.test', password: 'Password123' });
});

test('an email in use is explained without the raw server text', async ({ page }) => {
  await page.route('**/api/v1/auth/email/change', (route) =>
    route.fulfill({ status: 409, json: apiError('EMAIL_TAKEN') }),
  );
  await signIn(page, account());
  await page.getByLabel('New email address').fill('taken@example.test');
  await page.getByLabel('Your password').first().fill('Password123');
  await page.getByRole('button', { name: 'Send confirmation link' }).click();
  await expect(page.getByRole('alert')).toHaveText('This email address is already in use.');
});

const openDeletion = async (page: Page) => {
  await page.getByRole('button', { name: 'Delete account…' }).click();
  await page.getByLabel('Type a@example.test to confirm').fill('a@example.test');
};

test('deletion with two-step verification needs the code', async ({ page }) => {
  const bodies: unknown[] = [];
  await page.route('**/api/v1/users/me', (route) => {
    bodies.push(route.request().postDataJSON());
    return route.fulfill({ status: 403, json: apiError('TWO_FACTOR_INVALID') });
  });
  await signIn(page, account({ twoFactorEnabled: true }));
  await openDeletion(page);
  await page.getByLabel('Your password').last().fill('Password123');
  const submit = page.getByRole('button', { name: 'Delete permanently' });
  await expect(submit).toBeDisabled();
  await page.getByLabel('Two-step verification code').last().fill('123456');
  await submit.click();
  await expect(page.getByRole('alert')).toHaveText('The code is incorrect or expired.');
  expect(bodies[0]).toMatchObject({ password: 'Password123', code: '123456' });
});

test('the last owner is told to transfer ownership', async ({ page }) => {
  await page.route('**/api/v1/users/me', (route) =>
    route.fulfill({ status: 409, json: apiError('LAST_OWNER') }),
  );
  await signIn(page, account());
  await openDeletion(page);
  await page.getByLabel('Your password').last().fill('Password123');
  await page.getByRole('button', { name: 'Delete permanently' }).click();
  await expect(page.getByRole('alert')).toContainText('Transfer ownership');
});

test('a Google-only account confirms deletion through Google', async ({ page }) => {
  const bodies: unknown[] = [];
  await page.route('**/api/v1/users/me', (route) => {
    bodies.push(route.request().postDataJSON());
    return route.fulfill({ json: { success: true } });
  });
  await signIn(page, account({ hasPassword: false, hasGoogle: true }));
  await openDeletion(page);
  const submit = page.getByRole('button', { name: 'Delete permanently' });
  await expect(submit).toBeDisabled();
  await page
    .getByRole('button', { name: /^Google continue_with/ })
    .last()
    .click();
  await expect(page.getByText('Google account confirmed.')).toBeVisible();
  await submit.click();
  await expect.poll(() => bodies.length).toBe(1);
  expect(bodies[0]).toMatchObject({ googleCredential: 'fixture-only-credential' });
});

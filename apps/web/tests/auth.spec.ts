import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// This SDK stub exercises our UI contract, never Google authentication itself.
const googleSdk = `
  let configuration;
  window.google = { accounts: { id: {
    initialize(options) { configuration = options; },
    renderButton(parent, options) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Google ' + options.text + ' ' + options.locale;
      button.style.cssText = 'height:40px;max-width:100%;color:#111;background:#fff;border:1px solid #555';
      button.style.width = options.width + 'px';
      button.onclick = () => configuration.callback({ credential: 'fixture-only-credential' });
      parent.append(button);
    }
  } } };
`;

const fixture = '/tests/fixtures/auth.html';
const googleButton = (page: Page) => page.getByRole('button', { name: /^Google / });
const user = (id: string) => ({
  id,
  name: `Account ${id}`,
  email: `${id}@example.test`,
  role: 'STUDENT',
  faculty: 'FIT',
  createdAt: '2026-01-01T00:00:00.000Z',
  emailVerified: true,
  hasPassword: false,
  hasGoogle: true,
});

test.use({ locale: 'en-GB' });

test.beforeEach(async ({ page, locale }) => {
  await page.addInitScript(
    (value) => localStorage.setItem('viratec_locale', value),
    locale?.startsWith('uk') ? 'uk' : 'en',
  );
  await page.route('https://accounts.google.com/gsi/client*', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: googleSdk }),
  );
  await page.route('**/api/v1/**', (route) =>
    route.fulfill({ json: route.request().url().endsWith('/sessions') ? [] : {} }),
  );
});

test('Google registration and login keep the protected destination across both form links', async ({
  page,
}) => {
  await page.route('**/api/v1/auth/google', (route) =>
    route.fulfill({ json: { user: user('B') } }),
  );
  await page.goto(fixture);
  await page.getByRole('link', { name: 'Create an account', exact: true }).click();
  await expect(googleButton(page)).toHaveText('Google signup_with en');
  await page.getByRole('link', { name: 'Log in', exact: true }).click();
  await expect(googleButton(page)).toHaveText('Google signin_with en');
  await page.getByRole('link', { name: 'Create an account', exact: true }).click();
  await googleButton(page).click();
  await expect(page.getByRole('heading', { name: 'Private destination' })).toBeVisible();
  await expect(page.getByText('/private?section=security', { exact: true })).toBeVisible();
});

for (const failure of ['network', 'missing-api'] as const) {
  test(`Google SDK ${failure} failure can be retried without reloading`, async ({ page }) => {
    let loads = 0;
    await page.route('https://accounts.google.com/gsi/client*', async (route) => {
      loads += 1;
      expect(new URL(route.request().url()).searchParams.get('hl')).toBe('en');
      if (loads === 1) {
        if (failure === 'network') await route.abort();
        else await route.fulfill({ contentType: 'application/javascript', body: '' });
      } else await route.fulfill({ contentType: 'application/javascript', body: googleSdk });
    });
    await page.goto(fixture);
    await expect(page.getByRole('alert')).toContainText('could not be loaded');
    await page.getByRole('button', { name: 'Try again', exact: true }).click();
    await expect(googleButton(page)).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
    expect(loads).toBe(2);
  });
}

test.describe('Ukrainian errors', () => {
  test.use({ locale: 'uk-UA' });
  test('Google errors are localized and collision offers password recovery', async ({ page }) => {
    await page.route('**/api/v1/auth/google', (route) =>
      route.fulfill({ status: 409, json: { message: 'Raw backend English collision' } }),
    );
    await page.goto(fixture);
    await expect(googleButton(page)).toHaveText('Google signin_with uk');
    await googleButton(page).click();
    await expect(page.getByRole('alert')).toContainText('Увійдіть із паролем');
    await expect(page.getByText('Raw backend English collision')).toHaveCount(0);
    await page.getByRole('link', { name: 'Відновити пароль', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Password recovery' })).toBeVisible();
  });
});

test('CSRF recovery does not falsely report a blocked account', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/v1/auth/google', (route) => {
    attempts += 1;
    return route.fulfill({
      status: 403,
      json: { error: { code: 'CSRF_INVALID', message: 'Invalid or missing CSRF token' } },
    });
  });
  await page.goto(fixture);
  await googleButton(page).click();
  await expect(page.getByRole('alert')).toContainText('Allow site cookies');
  await expect(page.getByRole('alert')).not.toContainText('blocked');
  expect(attempts).toBe(2);
});

test('busy Google sign-in blocks pointer and keyboard duplicate submission', async ({ page }) => {
  let submissions = 0;
  let release: () => void = () => {};
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/v1/auth/google', async (route) => {
    submissions += 1;
    await pending;
    await route.fulfill({ status: 401, json: { message: 'Invalid credential' } });
  });
  await page.goto(fixture);
  await googleButton(page).click();
  await expect(page.locator('[inert]')).toHaveAttribute('aria-busy', 'true');
  await expect(page.getByRole('status')).toHaveText('Signing in…');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  expect(submissions).toBe(1);
  release();
  await expect(page.getByRole('alert')).toContainText('could not verify');
  await expect(googleButton(page)).toBeVisible();
  await expect(page.locator('[inert]')).toHaveCount(0);
});

test('expired account data never appears after Google sign-in as another account', async ({
  page,
}) => {
  let identity = 'A';
  let release: () => void = () => {};
  const pendingB = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/v1/auth/google', (route) =>
    route.fulfill({ json: { user: user(identity) } }),
  );
  await page.route('**/api/v1/auth/refresh', (route) =>
    route.fulfill({ status: 401, json: { message: 'Expired' } }),
  );
  await page.route('**/api/v1/auth/sessions', async (route) => {
    const current = identity;
    if (current === 'B') await pendingB;
    await route.fulfill({ json: [{ id: current, ipAddress: `private-ip-${current}` }] });
  });
  await page.route('**/api/v1/private-test-data', async (route) => {
    const current = identity;
    if (current === 'B') await pendingB;
    await route.fulfill({ json: { text: `private-data-${current}` } });
  });
  await page.goto(fixture);
  await googleButton(page).click();
  await expect(page.getByText('private-ip-A', { exact: true })).toBeVisible();
  await expect(page.getByText('private-data-A', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Expire session' }).click();
  await expect(googleButton(page)).toBeVisible();
  identity = 'B';
  await googleButton(page).click();
  await expect(page.getByText('Account B', { exact: true })).toBeVisible();
  await expect(page.getByText('private-ip-A', { exact: true })).toHaveCount(0);
  await expect(page.getByText('private-data-A', { exact: true })).toHaveCount(0);
  release();
  await expect(page.getByText('private-ip-B', { exact: true })).toBeVisible();
  await expect(page.getByText('private-data-B', { exact: true })).toBeVisible();
});

test('auth forms fit a narrow screen, resize the Google button and pass accessibility checks', async ({
  page,
}, testInfo) => {
  await page.goto(fixture);
  await expect(googleButton(page)).toBeVisible();
  await page.setViewportSize({ width: 320, height: 740 });
  await expect
    .poll(async () => {
      const button = await googleButton(page).boundingBox();
      return button ? button.x + button.width <= 320 : false;
    })
    .toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.getByText('Email address', { exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Email address', exact: true })).toBeFocused();
  await expect(page.getByRole('textbox', { name: 'Email address', exact: true })).toHaveAttribute(
    'autocomplete',
    'email',
  );
  const loginA11y = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(loginA11y.violations).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('login-mobile.png'), fullPage: true });
  await page.getByRole('link', { name: 'Create an account', exact: true }).click();
  await expect(googleButton(page)).toHaveText('Google signup_with en');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  const registerA11y = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(registerA11y.violations).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('register-mobile.png'), fullPage: true });
});

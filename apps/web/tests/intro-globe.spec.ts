import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PARTNERS_PAGE = '/about/global-collaboration-framework';

const openGlobe = async (page: Page, search = '') => {
  await page.route('**/api/v1/**', (route) => route.abort());
  await page.goto(`${PARTNERS_PAGE}${search}`);
};

const pointAt = (page: Page, index: number) =>
  page.locator('.intro-globe-point').nth(index).boundingBox();

test.use({ contextOptions: { reducedMotion: 'reduce' } });

test.describe('desktop', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024);

  test('a point opens its university and Escape closes it', async ({ page }) => {
    await openGlobe(page);
    const surface = page.getByRole('group', { name: 'Глобус університетів-партнерів' });
    await expect(surface).toBeVisible();
    await page.waitForFunction(() =>
      document
        .querySelector('.intro-globe')
        ?.getAnimations()
        .every((item) => item.playState === 'finished'),
    );
    const box = await pointAt(page, 13);
    if (!box) throw new Error('The point is not rendered');
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page).toHaveURL(/partner=ecole-nationale-polytechnique/);
    await expect(page.locator('.intro-globe-card h2')).toHaveText(/Polytechnique/);
    await page.keyboard.press('Escape');
    await expect(page.locator('.intro-globe-card')).toHaveCount(0);
    await expect(page).not.toHaveURL(/partner=/);
    await expect(surface).toBeFocused();
  });

  test('back closes a university opened from the controls', async ({ page }) => {
    await openGlobe(page);
    await page.getByRole('button', { name: 'Переглянути університети' }).click();
    await expect(page).toHaveURL(/partner=university-of-oxford/);
    await page.getByRole('button', { name: 'Наступний університет' }).click();
    await expect(page).toHaveURL(/partner=lancaster-university/);
    await page.goBack();
    await expect(page).not.toHaveURL(/partner=/);
    await expect(page.locator('.intro-globe-card')).toHaveCount(0);
  });

  test('search filters universities and opens the chosen one', async ({ page }) => {
    await openGlobe(page);
    await page.getByRole('button', { name: 'Пошук університетів' }).click();
    const search = page.getByRole('searchbox', { name: 'Пошук університетів' });
    await expect(search).toBeFocused();
    await page.getByRole('button', { name: 'Україна', exact: true }).click();
    await expect(page.locator('.intro-globe-card li')).toHaveCount(2);
    await search.fill('луцьк');
    await page.locator('.intro-globe-card li button').click();
    await expect(page).toHaveURL(/partner=lutsk-national-technical-university/);
  });

  test('the tour walks universities and stops on interaction', async ({ page }) => {
    await openGlobe(page);
    await page.getByRole('button', { name: 'Почати тур' }).click();
    await expect(page).toHaveURL(/partner=university-of-oxford/);
    await expect(page).toHaveURL(/partner=lancaster-university/, { timeout: 8000 });
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Почати тур' })).toBeVisible();
  });

  test('nearby universities collapse into a numbered cluster', async ({ page }) => {
    await openGlobe(page);
    await expect(page.locator('.intro-globe-point[data-cluster] text').first()).toHaveText(/\d/);
  });

  test('the arrow keys rotate the globe', async ({ page }) => {
    await openGlobe(page);
    const surface = page.getByRole('group', { name: 'Глобус університетів-партнерів' });
    const before = await page.locator('.intro-globe-point').nth(13).getAttribute('transform');
    await surface.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.intro-globe-point').nth(13)).not.toHaveAttribute(
      'transform',
      before ?? '',
    );
  });
});

test('a shared link opens the university', async ({ page }) => {
  await openGlobe(page, '?partner=karunya-institute-of-technology-and-sciences');
  await expect(page.getByRole('heading', { name: /Karunya/, level: 2 })).toBeVisible();
});

test('an unknown university in the link is ignored', async ({ page }) => {
  await openGlobe(page, '?partner=nowhere');
  await expect(page.getByRole('button', { name: 'Переглянути університети' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Наступний університет' })).toHaveCount(0);
});

test('a partner card and the globe lead to each other', async ({ page }) => {
  await openGlobe(page);
  await page.getByRole('button', { name: /Показати на глобусі.*Університет Ковентрі/ }).click();
  await expect(page).toHaveURL(/partner=coventry-university/);
  await page.getByRole('button', { name: 'Докладніше про університет' }).click();
  await expect(page).not.toHaveURL(/partner=/);
  await expect(page.locator('#partner-coventry-university')).toBeInViewport();
  await expect(page.locator('#partner-coventry-university')).toBeFocused();
});

test('service pages keep the globe decorative', async ({ page }) => {
  await page.route('**/api/v1/**', (route) => route.abort());
  await page.goto('/no-such-page');
  await expect(page.locator('.intro-globe')).toBeAttached();
  await expect(page.locator('.intro-globe-controls')).toHaveCount(0);
});

test('the layout holds in a right-to-left language', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('viratec_locale', 'ar'));
  await openGlobe(page, '?partner=university-of-oxford');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByText('51.7550° N, 1.2550° W')).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
  ).toBeLessThanOrEqual(0);
});

test('the open globe has no accessibility violations', async ({ page }) => {
  await openGlobe(page, '?partner=university-of-oxford');
  await expect(page.getByRole('button', { name: 'Наступний університет' })).toBeVisible();
  const results = await new AxeBuilder({ page })
    .include('#partner-globe')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

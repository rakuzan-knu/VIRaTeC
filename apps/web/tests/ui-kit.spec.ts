import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixtures/ui-kit.html');
  await page.evaluate(() => document.fonts.ready);
});

test('Figma typography, font loading and geometry are applied', async ({ page }, testInfo) => {
  expect(await page.evaluate(() => document.fonts.check('500 22px "DM Sans"'))).toBe(true);
  expect(await page.evaluate(() => document.fonts.check('16px "Inter"', 'Дослідження'))).toBe(true);
  await expect(page.getByTestId('primary-lg')).toHaveCSS('height', '58px');
  await expect(page.getByTestId('primary-lg')).toHaveCSS('padding-left', '26px');
  await expect(page.getByTestId('primary-md')).toHaveCSS('height', '47px');
  // Chromium rounds a 1.5px stroke to physical pixels at deviceScaleFactor=1.
  await expect(page.getByTestId('secondary-lg')).toHaveCSS('height', /^(60|61)px$/);
  await expect(page.getByTestId('secondary-md')).toHaveCSS('height', /^(49|50)px$/);
  await expect(page.getByRole('heading', { name: 'Card title', exact: true })).toHaveCSS(
    'font-size',
    '22px',
  );
  await expect(page.getByLabel('Email address', { exact: true })).toHaveCSS('height', '51px');
  await expect(page.getByTestId('override-button')).toHaveCSS('padding-left', '8px');
  await expect(page.getByTestId('override-button')).toHaveCSS('font-size', '14px');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(3, 18, 46)');
  await page.screenshot({ path: testInfo.outputPath('ui-kit.png'), fullPage: true });
});

test('tooltip stays hoverable and preserves trigger activation', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Top tooltip', exact: true });
  await trigger.hover();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toHaveText('Search research');
  await tooltip.hover();
  await expect(tooltip).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(tooltip).toHaveCount(0);
  await trigger.click();
  await expect(page.getByRole('status')).toHaveText('Activations: 1');
});

test('busy and disabled buttons prevent duplicate activation without resizing', async ({
  page,
}) => {
  const button = page.getByTestId('busy-button');
  const before = await button.boundingBox();
  await button.click();
  await expect(button).toBeDisabled();
  await expect(button).toHaveAttribute('aria-busy', 'true');
  const after = await button.boundingBox();
  expect(after?.width).toBe(before?.width);
  expect(after?.height).toBe(before?.height);
  await expect(page.getByRole('button', { name: 'Disabled', exact: true })).toBeDisabled();
  await expect(page.getByRole('status')).toHaveText('Activations: 1');
  await page.getByRole('button', { name: 'Reset loading' }).click();
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toHaveText('Activations: 2');
});

test('input label, help and validation descriptions remain associated', async ({ page }) => {
  await page.getByText('Email address', { exact: true }).click();
  await expect(page.getByLabel('Email address', { exact: true })).toBeFocused();
  await expect(page.getByLabel('Email address', { exact: true })).toHaveCSS(
    'border-color',
    'rgb(3, 197, 234)',
  );
  const invalid = page.getByLabel('Invalid email');
  await expect(invalid).toHaveAttribute('aria-invalid', 'true');
  await expect(invalid).toHaveAttribute(
    'aria-describedby',
    'external-help invalid-email-helper invalid-email-error',
  );
  await expect(invalid).toHaveAccessibleDescription(
    /This address will be used for replies.*Use an address containing a domain.*Enter a valid email address/,
  );
});

test('tooltip composes descriptions, preserves refs, opens on focus and dismisses on Escape', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Focus tooltip trigger' }).click();
  const trigger = page.getByRole('button', { name: 'Top tooltip', exact: true });
  await expect(trigger).toBeFocused();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toHaveText('Search research');
  await expect(trigger).toHaveAccessibleDescription(
    'Search the research catalogue. Search research',
  );
  const tip = await tooltip.boundingBox();
  const anchor = await trigger.boundingBox();
  expect(tip!.y + tip!.height).toBeLessThan(anchor!.y);
  await page.keyboard.press('Escape');
  await expect(tooltip).toHaveCount(0);
  await expect(trigger).toHaveAccessibleDescription('Search the research catalogue.');
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('tooltip')).toHaveText('Search publications');
  const bottom = await page.getByRole('tooltip').boundingBox();
  const bottomTrigger = await page.getByRole('button', { name: 'Bottom tooltip' }).boundingBox();
  expect(bottom!.y).toBeGreaterThan(bottomTrigger!.y + bottomTrigger!.height);
});

test('navigation uses links for routes and keyboard buttons for disclosure', async ({ page }) => {
  await expect(page.getByRole('link', { name: 'Contact', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  const about = page.getByRole('button', { name: 'About', exact: true });
  await about.focus();
  await page.keyboard.press('Space');
  await expect(about).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('link', { name: 'About VIRaTeC' })).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(about).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('link', { name: 'About VIRaTeC' })).toBeHidden();
});

test('long content stays inside the viewport and card CTAs align per row', async ({
  page,
}, testInfo) => {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  const cards = page.getByTestId('card-row').locator('article');
  if (testInfo.project.name === 'desktop') {
    const bounds = await cards.evaluateAll((nodes) =>
      nodes.map((node) => ({
        height: node.getBoundingClientRect().height,
        linkBottom: node.querySelector('a')!.getBoundingClientRect().bottom,
      })),
    );
    expect(new Set(bounds.map((bounds) => bounds.height)).size).toBe(1);
    expect(new Set(bounds.map((bounds) => bounds.linkBottom)).size).toBe(1);
  }
  await page.getByRole('button', { name: 'Long tooltip' }).focus();
  const tip = page.getByRole('tooltip');
  await expect(tip).toBeVisible();
  const bounds = await tip.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByTestId('primary-lg')).toHaveCSS('transition-duration', '0s');
  await expect(page.locator('html')).not.toHaveCSS('scrollbar-color', 'auto');
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(page.locator('html')).toHaveCSS('scrollbar-color', 'auto');
});

test('default and open tooltip states pass WCAG 2.2 AA automated checks', async ({ page }) => {
  const scan = () =>
    new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect((await scan()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Top tooltip', exact: true }).focus();
  await expect(page.getByRole('tooltip')).toBeVisible();
  expect((await scan()).violations).toEqual([]);
});

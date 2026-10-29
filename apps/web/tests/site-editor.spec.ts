import { expect, test, type Page, type Route } from '@playwright/test';
import {
  SESSION_HINT_STORAGE_KEY,
  SITE_EDITOR_INTRO_STORAGE_KEY,
} from '../src/shared/config/storageKeys';

interface SentRequest {
  method: string;
  path: string;
  body: unknown;
}

const STAFF_USER = {
  id: '6f1c2a34-5b6d-4e7f-8a9b-0c1d2e3f4a5b',
  email: 'editor@viratec.test',
  name: 'Olena Editor',
  role: 'STAFF',
  faculty: 'FIT',
  skills: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  studyLevel: null,
  studyYear: null,
  institution: null,
  country: null,
  languages: [],
  links: {},
  openTo: [],
  visibility: 'PUBLIC',
  showEmail: false,
  hasPassword: true,
  hasGoogle: false,
  twoFactorEnabled: true,
  staffRole: 'EDITOR',
  permissions: ['CONTENT_VIEW', 'CONTENT_EDIT', 'CONTENT_PUBLISH', 'MEDIA_MANAGE'],
  staffExpiresAt: null,
};

const CHANGE = {
  id: '0b6f3d1e-2c4a-4b5e-9f8d-7a6b5c4d3e2f',
  resourceType: 'ENTRY',
  resourceId: 'hero-entry',
  contentTypeId: 'card',
  label: 'Card: Research together',
  isNew: false,
  fieldIds: ['title'],
  isDeleted: false,
  updatedAt: '2026-10-29T09:00:00.000Z',
  actor: { id: STAFF_USER.id, name: STAFF_USER.name },
};

const json = (route: Route, data: unknown, status = 200) =>
  route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(status < 400 ? { data } : data),
  });

const mockApi = async (page: Page, options: { changes?: unknown[] } = {}) => {
  const sent: SentRequest[] = [];
  await page.route(/\/api\/v1\//, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^.*\/api\/v1/, '');
    const method = request.method();
    const raw = request.postData();
    sent.push({ method, path, body: raw ? (JSON.parse(raw) as unknown) : null });

    if (path === '/auth/csrf') return json(route, { csrfToken: 'test-csrf' });
    if (path === '/auth/me') return json(route, STAFF_USER);
    if (path === '/admin/content/changes') return json(route, options.changes ?? []);
    if (path === '/admin/content/presence') return json(route, []);
    if (path === '/admin/content/translate') {
      const body = JSON.parse(raw ?? '{}') as { texts?: string[] };
      return json(route, { translations: (body.texts ?? []).map((text) => `EN ${text}`) });
    }
    if (path === '/admin/content/revisions') return json(route, []);
    if (path === '/admin/content/publish')
      return json(route, { published: [CHANGE.id], failed: [] });
    if (path.startsWith('/admin/content/entries/')) {
      return json(route, {
        id: 'hero-entry',
        contentTypeId: 'card',
        version: 3,
        publishedVersion: 2,
        updatedAt: '2026-10-29T09:00:00.000Z',
        fields: { title: { 'en-US': 'Research together', uk: 'Досліджуймо разом' } },
        locales: { en: 'en-US', uk: 'uk' },
      });
    }
    if (path === '/admin/records/publication' && method === 'POST') {
      const body = JSON.parse(raw ?? '{}') as { data?: Record<string, unknown> };
      return json(route, {
        resource: 'publication',
        key: 'new-post',
        updatedAt: '2026-10-29T10:00:00.000Z',
        data: body.data ?? {},
        published: null,
        hasDraft: true,
        isNew: true,
        isDeleted: false,
      });
    }
    if (path === '/content/entries' || path === '/admin/content/preview') {
      return json(route, { error: { message: 'off' } }, 503);
    }
    return json(route, []);
  });
  return sent;
};

const openEditor = async (page: Page) => {
  await page.addInitScript(
    ({ sessionKey, introKey }) => {
      try {
        window.localStorage.setItem('viratec_locale', 'uk');
        window.localStorage.setItem(sessionKey, '1');
        window.localStorage.setItem(introKey, '1');
      } catch {
        return;
      }
    },
    { sessionKey: SESSION_HINT_STORAGE_KEY, introKey: SITE_EDITOR_INTRO_STORAGE_KEY },
  );
  await page.goto('/?edit', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: /Інші дії|More actions/ })).toBeVisible({
    timeout: 60_000,
  });
};

test.describe('site editor', () => {
  test.describe.configure({ timeout: 120_000 });
  test('a staff user opens the editor from the edit link', async ({ page }) => {
    await mockApi(page);
    await openEditor(page);
    await expect(page.getByRole('button', { name: /Додати проєкт|Add a project/ })).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Пошук по сайту|Search the site/ }),
    ).toBeVisible();
  });

  test('Ctrl+K opens the site search', async ({ page }) => {
    await mockApi(page);
    await openEditor(page);
    await page.keyboard.press('Control+k');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('searchbox').or(dialog.getByRole('combobox'))).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });

  test('the wizard creates a post from a template and translates it', async ({ page }) => {
    const sent = await mockApi(page);
    await openEditor(page);
    await page.getByRole('button', { name: /Додати проєкт|Add a project/ }).click();
    await page.getByRole('menuitem', { name: /публікац|publication/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('radio')).toHaveCount(4);
    await dialog.getByText(/Звіт про подію|Event report/).click();
    await dialog.getByRole('button', { name: /Далі|Next/ }).click();

    await dialog.getByRole('textbox').first().fill('Хакатон VIRaTeC 2026');
    await dialog.getByRole('button', { name: /Далі|Next/ }).click();
    await dialog.getByRole('textbox').first().fill('Як пройшов осінній хакатон');
    await dialog.getByRole('button', { name: /Далі|Next/ }).click();
    await dialog.getByRole('button', { name: /Далі|Next/ }).click();

    await expect(dialog.getByRole('checkbox')).toBeChecked();
    await dialog.getByRole('button', { name: /Створити|Create/ }).click();

    await expect
      .poll(() => sent.some((item) => item.path === '/admin/records/publication'))
      .toBe(true);
    const translate = sent.find((item) => item.path === '/admin/content/translate');
    expect(translate?.body).toMatchObject({
      texts: ['Хакатон VIRaTeC 2026', 'Як пройшов осінній хакатон'],
    });
    const created = sent.find((item) => item.path === '/admin/records/publication');
    expect(created?.body).toMatchObject({
      data: {
        type: 'EVENT',
        content: {
          en: { title: 'EN Хакатон VIRaTeC 2026', excerpt: 'EN Як пройшов осінній хакатон' },
        },
      },
    });
  });

  test('publishing shows the review of changes first', async ({ page }) => {
    const sent = await mockApi(page, { changes: [CHANGE] });
    await openEditor(page);
    await page.getByRole('button', { name: /Показати всім \(1\)|Show to everyone \(1\)/ }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(CHANGE.label);
    expect(sent.some((item) => item.path === '/admin/content/publish')).toBe(false);

    await dialog.getByRole('button', { name: /Показати всім|Show to everyone/ }).click();
    await expect.poll(() => sent.some((item) => item.path === '/admin/content/publish')).toBe(true);
  });
});

import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const REAL_KEY = 'source-to-recall-gate:captures:v1';
const DEMO_KEY = `demo:${REAL_KEY}`;

async function openClean(page: Page, path = '/') {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto(path);
  await expect(page.locator('.gate-app .loading-state')).toHaveCount(0);
}

async function openLicensedDemo(page: Page) {
  await page.route('https://api.sociobot.in/api/v1/products/source-to-recall-gate/verify**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null })
  }));
  await openClean(page, '/demo/?license=claim-test-license');
  await expect(page.locator('[data-license-status]')).toContainText('Press Pass active');
}

test('has route metadata, accessible landmarks, and a designed 404', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  const routes = [
    ['/', 'Source-to-Recall Gate — Make recall prompts'],
    ['/demo/', 'Demo — Source-to-Recall Gate'],
    ['/privacy/', 'Privacy — Source-to-Recall Gate'],
    ['/terms/', 'Terms — Source-to-Recall Gate']
  ] as const;
  for (const [route, title] of routes) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('img:not([alt])')).toHaveCount(0);
    if (await page.locator('.gate-app').count()) await expect(page.locator('.gate-app .loading-state')).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
  expect(browserErrors).toEqual([]);

  const missing = await page.goto('/this-page-does-not-exist');
  expect(missing?.status()).toBe(404);
  await expect(page).toHaveTitle('Page not found — Source-to-Recall Gate');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Find the page you need');
  await expect(page.getByRole('link', { name: 'Return home' })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
  const missingResults = await new AxeBuilder({ page }).analyze();
  expect(missingResults.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
});

test('opens the direct demo query and every internal page or download', async ({ page, request }) => {
  await page.goto('/?demo=1');
  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(page.locator('[data-total-count]')).toHaveText('3');

  await page.goto('/');
  const hrefs = await page.locator('a[href]').evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href));
  const origin = new URL(page.url()).origin;
  const internal = [...new Set(hrefs.filter((href) => new URL(href).origin === origin).map((href) => new URL(href).pathname))];
  for (const path of internal) {
    const response = await request.get(path);
    expect(response.ok(), `${path} returned ${response.status()}`).toBe(true);
  }
});

test('@claim:demo-isolation loads, resets, and exits sample data without changing real data', async ({ page }) => {
  await openClean(page);
  const sentinel = [{ id: 'real-sentinel', passage: 'My private real passage', sourceTitle: '', sourceUrl: '', createdAt: '2026-09-01T00:00:00.000Z', paraphrase: '', cue: '', useCase: '' }];
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: REAL_KEY, value: sentinel });
  await page.getByRole('link', { name: /Try it with sample data/ }).click();

  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('[data-total-count]')).toHaveText('3');
  await expect(page.locator('[data-source-passage]')).toContainText('Retrieval practice');
  await page.locator('#cue').fill('Changed only inside the demo');
  await page.getByRole('button', { name: 'Save decisions' }).click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#cue')).toHaveValue('What must happen before retrieval practice can help?');

  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/#gate$/);
  const state = await page.evaluate(({ realKey, demoKey }) => ({ real: localStorage.getItem(realKey), demo: localStorage.getItem(demoKey) }), { realKey: REAL_KEY, demoKey: DEMO_KEY });
  expect(JSON.parse(state.real ?? '[]')).toEqual(sentinel);
  expect(state.demo).toBeNull();
  await expect(page.locator('[data-total-count]')).toHaveText('1');
});

test('@claim:three-decisions keeps export unavailable until all three answers exist', async ({ page }) => {
  await openClean(page, '/demo/');
  const csv = page.getByRole('button', { name: 'CSV' });
  await expect(csv).toBeEnabled();
  await page.locator('#cue').fill('');
  await expect(csv).toBeDisabled();
  await page.locator('#cue').fill('What should happen before retrieval practice?');
  const event = page.waitForEvent('download');
  await csv.click();
  const text = await readFile(await (await event).path() as string, 'utf8');
  expect(text).toContain('What should happen before retrieval practice?');
  expect(text).toContain('Testing memory helps after I have made sense of the idea.');
});

test('@claim:individual-exports downloads complete Markdown, CSV, and Anki TSV files', async ({ page }) => {
  await openClean(page, '/demo/');
  for (const [name, extension, evidence] of [
    ['Markdown', '.md', '# What must happen before retrieval practice can help?'],
    ['CSV', '.csv', '"Cue","Paraphrase"'],
    ['Anki TSV', '.tsv', '\tsource-to-recall-gate']
  ] as const) {
    const event = page.waitForEvent('download');
    await page.getByRole('button', { name }).click();
    const download = await event;
    expect(download.suggestedFilename()).toContain(extension);
    expect(await readFile(await download.path() as string, 'utf8')).toContain(evidence);
  }
});

test('@claim:local-privacy sends no study content off origin during the free demo flow', async ({ page }) => {
  const requests: Array<{ url: string; method: string; type: string; body: string | null }> = [];
  page.on('request', (request) => requests.push({ url: request.url(), method: request.method(), type: request.resourceType(), body: request.postData() }));
  await openClean(page, '/demo/');
  await expect(page.locator('input[type="email"], input[type="password"]')).toHaveCount(1);
  await expect(page.locator('#license-token')).toBeHidden();
  await page.locator('#paraphrase').fill('A private edited answer');
  await page.getByRole('button', { name: 'Save decisions' }).click();
  const event = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Markdown' }).click();
  await event;
  expect([...new Set(requests.map((value) => new URL(value.url).origin))]).toEqual(['http://127.0.0.1:4173']);
  expect(requests.filter((value) => ['fetch', 'xhr', 'eventsource'].includes(value.type))).toEqual([]);
  expect(requests.every((value) => value.method === 'GET' && !value.body)).toBe(true);
  expect(requests.some((value) => value.url.includes('A%20private%20edited%20answer'))).toBe(false);
  const stored = await page.evaluate((key) => localStorage.getItem(key), DEMO_KEY);
  expect(stored).toContain('A private edited answer');
});

test('@claim:offline-reload keeps the complete sample tool usable offline', async ({ browser, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto(`${baseURL}/demo/`);
    await expect(page.locator('[data-total-count]')).toHaveText('3');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
    await expect(page.locator('[data-network]')).toContainText('Offline');
    await expect(page.locator('[data-total-count]')).toHaveText('3');
  } finally {
    await context.close();
  }
});

test('@claim:press-pass-activation accepts a valid returned license without touching real license storage', async ({ page }) => {
  await openLicensedDemo(page);
  await expect(page).toHaveURL(/\/demo\/$/);
  const keys = await page.evaluate(() => ({ demo: localStorage.getItem('demo:sb_license:source-to-recall-gate'), real: localStorage.getItem('sb_license:source-to-recall-gate') }));
  expect(keys).toEqual({ demo: 'claim-test-license', real: null });
  await expect(page.getByRole('button', { name: 'Export ready prompts' })).toBeEnabled();
});

test('@claim:batch-export downloads every ready sample prompt', async ({ page }) => {
  await openLicensedDemo(page);
  await page.locator('#batch-format').selectOption('csv');
  const event = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export ready prompts' }).click();
  const text = await readFile(await (await event).path() as string, 'utf8');
  expect(text).toContain('What must happen before retrieval practice can help?');
  expect(text).toContain('Why can harder practice improve later recall?');
  expect(text).not.toContain('Interleaving asks learners');
});

test('@claim:backup-download downloads all local passages as valid JSON', async ({ page }) => {
  await openLicensedDemo(page);
  const event = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download local backup' }).click();
  const backup = JSON.parse(await readFile(await (await event).path() as string, 'utf8')) as { version: number; captures: unknown[] };
  expect(backup.version).toBe(1);
  expect(backup.captures).toHaveLength(3);
});

test('@claim:backup-restore restores valid local backup data', async ({ page }) => {
  await openLicensedDemo(page);
  const restored = {
    id: 'restored-prompt', passage: 'A restored passage', sourceTitle: 'Backup file', sourceUrl: '', createdAt: '2026-09-06T00:00:00.000Z',
    paraphrase: 'A restored answer', cue: 'What was restored?', useCase: 'When moving this data to a new browser.'
  };
  await page.locator('[data-restore-backup]').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ version: 1, captures: [restored] })) });
  await expect(page.locator('[data-toast-copy]')).toHaveText('Restored 1 passage from backup.');
  await expect(page.locator('[data-total-count]')).toHaveText('1');
  await page.reload();
  await expect(page.getByRole('button', { name: /Ready What was restored/ })).toBeVisible();
});

test('rejects an invalid backup without changing the current passages', async ({ page }) => {
  await openLicensedDemo(page);
  const invalid = { version: 1, captures: [{ id: 'broken', passage: 'Missing required fields' }] };
  await page.locator('[data-restore-backup]').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(invalid)) });
  await expect(page.locator('[data-toast-copy]')).toHaveText('That file is not a valid Source-to-Recall Gate backup.');
  await expect(page.locator('[data-total-count]')).toHaveText('3');
  await page.reload();
  await expect(page.locator('[data-total-count]')).toHaveText('3');
});

test('@claim:extension-download delivers an installable ZIP file', async ({ page }) => {
  await openClean(page);
  const event = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Get extension' }).click();
  const download = await event;
  const bytes = await readFile(await download.path() as string);
  expect(download.suggestedFilename()).toBe('source-to-recall-gate-chrome.zip');
  expect(bytes.subarray(0, 4).toString('ascii')).toBe('PK\x03\x04');
});

test('@claim:delete-local-data removes every passage and keeps the empty state after reload', async ({ page }) => {
  await openClean(page, '/demo/');
  await page.getByRole('button', { name: 'Delete all local data' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Keep my passages' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-total-count]')).toHaveText('3');
  await page.getByRole('button', { name: 'Delete all local data' }).click();
  await page.getByRole('button', { name: 'Delete all local data', exact: true }).last().click();
  await expect(page.locator('[data-total-count]')).toHaveText('0');
  await page.reload();
  await expect(page.locator('[data-total-count]')).toHaveText('0');
  await expect(page.getByText('No passages yet.')).toBeVisible();
});

test('@claim:local-persistence handles boundary input, export persistence, and undo recovery', async ({ page }) => {
  await openClean(page);
  await page.locator('#capture-passage').fill('No');
  await page.getByRole('button', { name: /Add passage/ }).click();
  await expect(page.locator('[data-capture-error]')).toContainText('at least 3 characters');
  await page.locator('#capture-passage').fill('x'.repeat(4000));
  await page.getByRole('button', { name: /Add passage/ }).click();
  await expect(page.locator('[data-source-passage]')).toHaveText('x'.repeat(4000));
  await page.locator('#paraphrase').fill('A boundary-length passage is accepted.');
  await page.locator('#cue').fill('What length is accepted?');
  await page.locator('#use-case').fill('When checking imported study notes.');
  await page.getByRole('button', { name: 'CSV' }).click();
  await page.reload();
  await page.getByRole('button', { name: /Ready What length is accepted/ }).click();
  await page.getByRole('button', { name: 'Discard passage' }).click();
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.locator('#cue')).toHaveValue('What length is accepted?');
});

test('rejects duplicate and over-limit passages, then accepts corrected input', async ({ page }) => {
  await openClean(page);
  const passage = 'A selected passage about spacing short study sessions.';
  await page.locator('#capture-passage').fill(passage);
  await page.locator('#capture-url').fill('javascript:alert(1)');
  await page.getByRole('button', { name: /Add passage/ }).click();
  await expect(page.locator('[data-source-byline]')).toContainText('Saved passage');

  await page.locator('#capture-passage').fill(passage);
  await page.locator('#capture-url').fill('javascript:alert(1)');
  await page.getByRole('button', { name: /Add passage/ }).click();
  await expect(page.locator('[data-capture-error]')).toHaveText('That passage is already saved.');

  await page.locator('#capture-passage').evaluate((element) => {
    const field = element as HTMLTextAreaElement;
    field.value = 'x'.repeat(4001);
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('#capture-url').fill('');
  await page.getByRole('button', { name: /Add passage/ }).click();
  await expect(page.locator('[data-capture-error]')).toContainText('under 4,000 characters');
  await page.locator('#capture-passage').fill('A corrected passage is accepted.');
  await page.getByRole('button', { name: /Add passage/ }).click();
  await expect(page.locator('[data-total-count]')).toHaveText('2');
});

test('keeps key text at 16px, supports reduced motion, keyboard focus, and mobile width', async ({ page }, testInfo) => {
  await openClean(page, '/demo/');
  const sizes = await page.locator('.field label, .field-meta, .license-status, .trust-line').evaluateAll((elements) => elements.map((element) => parseFloat(getComputedStyle(element).fontSize)));
  expect(sizes.every((size) => size >= 16)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reducedDuration = await page.locator('.button').first().evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration));
  expect(reducedDuration).toBeLessThanOrEqual(0.001);
  const reset = page.getByRole('button', { name: 'Reset demo' });
  await reset.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(reset).toBeFocused();
  const focus = await reset.evaluate((element) => ({ width: getComputedStyle(element).outlineWidth, style: getComputedStyle(element).outlineStyle }));
  expect(focus).toEqual({ width: '3px', style: 'solid' });
  if (testInfo.project.name === 'mobile-390') {
    const width = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(width.scroll).toBeLessThanOrEqual(width.client);
  }
});

test('shows the job, audience, first action, and facts before scrolling', async ({ page }) => {
  await openClean(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Turn highlights into recall prompts');
  await expect(page.getByText(/For students who want useful study prompts/)).toBeVisible();
  await expect(page.getByRole('link', { name: /Try it with sample data/ })).toBeVisible();
  const bottom = await page.locator('.trust-line').evaluate((element) => element.getBoundingClientRect().bottom);
  const viewport = await page.evaluate(() => innerHeight);
  expect(bottom).toBeLessThanOrEqual(viewport);
});

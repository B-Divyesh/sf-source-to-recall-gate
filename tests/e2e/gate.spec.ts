import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('has a valid accessible document and legal routes', async ({ page }) => {
  await expect(page).toHaveTitle(/Source-to-Recall Gate/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('img:not([alt])')).toHaveCount(0);
  await expect(page.locator('.gate-app .loading-state')).toHaveCount(0);

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);

  for (const route of ['/privacy/', '/terms/']) {
    await page.goto(route);
    await expect(page.locator('main h1')).toHaveCount(1);
    const legalResults = await new AxeBuilder({ page }).analyze();
    expect(legalResults.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
});

test('captures, gates, persists, and exports a selected passage', async ({ page }) => {
  await page.locator('#capture-passage').fill('Retrieval practice only works well after the learner has first encoded the idea.');
  await page.locator('#capture-title').fill('Learning notes');
  await page.getByRole('button', { name: /Add to gate/ }).click();

  await expect(page.locator('[data-source-passage]')).toContainText('Retrieval practice');
  await expect(page.getByRole('button', { name: 'Markdown' })).toBeDisabled();
  await page.locator('#paraphrase').fill('Make sense of an idea before practicing retrieval.');
  await page.locator('#cue').fill('What comes before retrieval practice?');
  await page.locator('#use-case').fill('When I convert lecture highlights into cards.');
  await expect(page.getByRole('button', { name: 'Markdown' })).toBeEnabled();

  await page.locator('#use-case').press(process.platform === 'darwin' ? 'Meta+Enter' : 'Control+Enter');
  await expect(page.locator('[data-toast-copy]')).toContainText('ready to export');
  await page.reload();
  await page.getByRole('button', { name: /Ready What comes before retrieval practice/ }).click();
  await expect(page.locator('#cue')).toHaveValue('What comes before retrieval practice?');

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Markdown' }).click();
  await expect((await download).suggestedFilename()).toMatch(/\.md$/);
});

test('fits a 390px viewport without page-level horizontal overflow', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-390');
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width);
  await expect(page.getByRole('link', { name: /Try the local gate/ })).toBeVisible();
});

test('reopens the complete gate offline after first load', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await expect(page.locator('[data-network]')).toContainText('Offline');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/don’t save/i);
  await expect(page.locator('#capture-passage')).toBeVisible();
  await context.setOffline(false);
});

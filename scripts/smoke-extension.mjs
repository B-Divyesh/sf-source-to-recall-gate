import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const extensionPath = resolve('.output/chrome-mv3');
const manifest = JSON.parse(await readFile(resolve(extensionPath, 'manifest.json'), 'utf8'));
if (manifest.manifest_version !== 3 || manifest.options_ui?.open_in_tab !== true) {
  throw new Error('The packaged extension manifest is missing the expected MV3 full-tab options page.');
}

const context = await chromium.launchPersistentContext('', {
  channel: 'chromium',
  headless: true,
  args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
});

try {
  let workers = context.serviceWorkers();
  if (!workers.length) workers = [await context.waitForEvent('serviceworker', { timeout: 15_000 })];
  const extensionId = new URL(workers[0].url()).host;
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(`chrome-extension://${extensionId}/options.html`);
  await page.waitForSelector('#capture-passage');
  if (await page.locator('h1').count() !== 1 || errors.length) {
    throw new Error(`Extension smoke test failed: ${errors.join('; ') || 'invalid heading structure'}`);
  }
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  if (await page.locator('h1').count() !== 1) throw new Error('Popup must have exactly one h1.');
  console.log('Extension smoke passed: MV3 service worker, options workbench, popup, and console.');
} finally {
  await context.close();
}

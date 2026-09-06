import '../src/styles.css';
import { discardDemoLicense } from '../src/license';
import { discardDemoCaptures, resetDemoCaptures } from '../src/storage';
import { mountWorkbench } from '../src/workbench';

const query = new URLSearchParams(location.search);
if (location.pathname === '/' && query.get('demo') === '1') {
  location.replace('/demo/');
} else {
  const root = document.querySelector<HTMLElement>('.gate-app');
  const paidRoot = document.querySelector<HTMLElement>('[data-paid-root]') ?? undefined;
  const demo = document.body.dataset.demo === 'true';
  if (root) {
    const openTool = () => void mountWorkbench(root, { demo, paidRoot });
    const idle = (window as Window & { requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number }).requestIdleCallback;
    if (demo) openTool();
    else if (idle) idle.call(window, openTool, { timeout: 800 });
    else globalThis.setTimeout(openTool, 120);
  }

  document.querySelector<HTMLButtonElement>('[data-reset-demo]')?.addEventListener('click', async () => {
    await resetDemoCaptures();
    location.reload();
  });
  document.querySelector<HTMLAnchorElement>('[data-start-real]')?.addEventListener('click', () => {
    discardDemoCaptures();
    discardDemoLicense();
  });
}

if ('serviceWorker' in navigator && (location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname))) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
}

import '../src/styles.css';
import { mountWorkbench } from '../src/workbench';

const root = document.querySelector<HTMLElement>('.gate-app');
if (root) {
  const openPress = () => void mountWorkbench(root);
  const idle = (window as Window & { requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number }).requestIdleCallback;
  if (idle) idle.call(window, openPress, { timeout: 800 });
  else globalThis.setTimeout(openPress, 120);
}

if ('serviceWorker' in navigator && (location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname))) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
}

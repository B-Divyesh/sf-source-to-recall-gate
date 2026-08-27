import '../src/styles.css';
import { mountWorkbench } from '../src/workbench';

const root = document.querySelector<HTMLElement>('.gate-app');
if (root) mountWorkbench(root);

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
}

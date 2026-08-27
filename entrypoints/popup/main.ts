import './style.css';

const status = document.querySelector<HTMLElement>('[data-status]')!;
const capture = document.querySelector<HTMLButtonElement>('[data-capture]')!;

capture.addEventListener('click', async () => {
  capture.disabled = true;
  status.textContent = 'Reading your selection…';
  const result = await chrome.runtime.sendMessage({ type: 'capture-active-selection' }) as { ok: boolean; message: string };
  status.textContent = result.message;
  status.classList.toggle('error', !result.ok);
  if (!result.ok) capture.disabled = false;
  else window.close();
});

document.querySelector<HTMLButtonElement>('[data-open]')!.addEventListener('click', () => chrome.runtime.openOptionsPage());

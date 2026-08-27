import type { Capture } from './types';

const CAPTURE_KEY = 'source-to-recall-gate:captures:v1';

function extensionStore(): chrome.storage.StorageArea | undefined {
  return globalThis.chrome?.storage?.local;
}

async function readValue<T>(key: string, fallback: T): Promise<T> {
  const extension = extensionStore();
  if (extension) {
    const value = await extension.get(key);
    return (value[key] as T | undefined) ?? fallback;
  }
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) as T : fallback;
}

async function writeValue<T>(key: string, value: T): Promise<void> {
  const extension = extensionStore();
  if (extension) {
    await extension.set({ [key]: value });
    return;
  }
  localStorage.setItem(key, JSON.stringify(value));
}

export async function getCaptures(): Promise<Capture[]> {
  const captures = await readValue<Capture[]>(CAPTURE_KEY, []);
  return captures
    .filter((item) => item && typeof item.id === 'string' && typeof item.passage === 'string')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveCaptures(captures: Capture[]): Promise<void> {
  await writeValue(CAPTURE_KEY, captures);
}

export async function addCapture(capture: Capture): Promise<void> {
  const captures = await getCaptures();
  if (captures.some((item) => item.passage === capture.passage && item.sourceUrl === capture.sourceUrl)) {
    throw new Error('That passage is already waiting in your gate.');
  }
  await saveCaptures([capture, ...captures]);
}

export async function upsertCapture(capture: Capture): Promise<void> {
  const captures = await getCaptures();
  const index = captures.findIndex((item) => item.id === capture.id);
  if (index === -1) captures.unshift(capture);
  else captures[index] = capture;
  await saveCaptures(captures);
}

export async function removeCapture(id: string): Promise<Capture | undefined> {
  const captures = await getCaptures();
  const removed = captures.find((item) => item.id === id);
  await saveCaptures(captures.filter((item) => item.id !== id));
  return removed;
}

export async function clearCaptures(): Promise<void> {
  await saveCaptures([]);
}

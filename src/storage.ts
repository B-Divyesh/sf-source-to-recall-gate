import { isStoredCapture, type Capture } from './types';

export type StorageNamespace = 'real' | 'demo';

const CAPTURE_KEY = 'source-to-recall-gate:captures:v1';
export const DEMO_CAPTURE_KEY = `demo:${CAPTURE_KEY}`;

const SAMPLE_CAPTURES: Capture[] = [
  {
    id: 'demo-retrieval-practice',
    passage: 'Retrieval practice strengthens access to knowledge, but it cannot replace the work of first understanding what an idea means.',
    sourceTitle: 'Learning science seminar notes',
    sourceUrl: 'https://example.edu/learning-science/retrieval-practice',
    createdAt: '2026-09-05T14:30:00.000Z',
    paraphrase: 'Testing memory helps after I have made sense of the idea.',
    cue: 'What must happen before retrieval practice can help?',
    useCase: 'When I turn a lecture highlight into an Anki prompt.'
  },
  {
    id: 'demo-desirable-difficulty',
    passage: 'A learning task can feel harder during practice and still produce better long-term retention than an easier task.',
    sourceTitle: 'Cognitive psychology reading',
    sourceUrl: 'https://example.edu/psychology/desirable-difficulties',
    createdAt: '2026-09-04T10:15:00.000Z',
    paraphrase: 'Easy practice is not always the practice that lasts.',
    cue: 'Why can harder practice improve later recall?',
    useCase: 'When I choose between rereading notes and testing myself.'
  },
  {
    id: 'demo-interleaving',
    passage: 'Interleaving asks learners to choose between problem types instead of repeating one known procedure in a block.',
    sourceTitle: 'Statistics study guide',
    sourceUrl: 'https://example.edu/statistics/interleaving',
    createdAt: '2026-09-03T08:00:00.000Z',
    paraphrase: '',
    cue: '',
    useCase: ''
  }
];

function keyFor(namespace: StorageNamespace): string {
  return namespace === 'demo' ? DEMO_CAPTURE_KEY : CAPTURE_KEY;
}

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

export async function getCaptures(namespace: StorageNamespace = 'real'): Promise<Capture[]> {
  const captures = await readValue<Capture[]>(keyFor(namespace), []);
  return captures
    .filter(isStoredCapture)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveCaptures(captures: Capture[], namespace: StorageNamespace = 'real'): Promise<void> {
  await writeValue(keyFor(namespace), captures);
}

export async function addCapture(capture: Capture, namespace: StorageNamespace = 'real'): Promise<void> {
  const captures = await getCaptures(namespace);
  if (captures.some((item) => item.passage === capture.passage && item.sourceUrl === capture.sourceUrl)) {
    throw new Error('That passage is already saved.');
  }
  await saveCaptures([capture, ...captures], namespace);
}

export async function upsertCapture(capture: Capture, namespace: StorageNamespace = 'real'): Promise<void> {
  const captures = await getCaptures(namespace);
  const index = captures.findIndex((item) => item.id === capture.id);
  if (index === -1) captures.unshift(capture);
  else captures[index] = capture;
  await saveCaptures(captures, namespace);
}

export async function removeCapture(id: string, namespace: StorageNamespace = 'real'): Promise<Capture | undefined> {
  const captures = await getCaptures(namespace);
  const removed = captures.find((item) => item.id === id);
  await saveCaptures(captures.filter((item) => item.id !== id), namespace);
  return removed;
}

export async function clearCaptures(namespace: StorageNamespace = 'real'): Promise<void> {
  await saveCaptures([], namespace);
}

export async function ensureDemoCaptures(): Promise<void> {
  if (localStorage.getItem(DEMO_CAPTURE_KEY) === null) {
    await saveCaptures(structuredClone(SAMPLE_CAPTURES), 'demo');
  }
}

export async function resetDemoCaptures(): Promise<void> {
  await saveCaptures(structuredClone(SAMPLE_CAPTURES), 'demo');
}

export function discardDemoCaptures(): void {
  localStorage.removeItem(DEMO_CAPTURE_KEY);
}

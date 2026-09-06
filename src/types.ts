export type Capture = {
  id: string;
  passage: string;
  sourceTitle: string;
  sourceUrl: string;
  createdAt: string;
  paraphrase: string;
  cue: string;
  useCase: string;
  exportedAt?: string;
};

export type CaptureInput = Pick<Capture, 'passage' | 'sourceTitle' | 'sourceUrl'>;

export const FIELD_LIMITS = {
  passage: 4000,
  sourceTitle: 200,
  sourceUrl: 2000,
  decision: 1000
} as const;

export function isReady(capture: Capture): boolean {
  return [capture.paraphrase, capture.cue, capture.useCase].every((value) => value.trim().length > 0);
}

export function createCapture(input: CaptureInput): Capture {
  const passage = input.passage.trim();
  if (passage.length < 3) throw new Error('Select or paste a passage with at least 3 characters.');
  if (passage.length > FIELD_LIMITS.passage) throw new Error(`Keep the passage under ${FIELD_LIMITS.passage.toLocaleString()} characters.`);
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    passage,
    sourceTitle: input.sourceTitle.trim().slice(0, FIELD_LIMITS.sourceTitle),
    sourceUrl: normalizeUrl(input.sourceUrl),
    createdAt: new Date().toISOString(),
    paraphrase: '',
    cue: '',
    useCase: ''
  };
}

export function normalizeUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return '';
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function isDate(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

export function isStoredCapture(value: unknown): value is Capture {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<Capture>;
  const strings = [item.id, item.passage, item.sourceTitle, item.sourceUrl, item.createdAt, item.paraphrase, item.cue, item.useCase];
  if (!strings.every((entry) => typeof entry === 'string')) return false;
  if (!item.id || item.id.length > 256 || item.passage!.trim().length < 3 || item.passage!.length > FIELD_LIMITS.passage) return false;
  if (item.sourceTitle!.length > FIELD_LIMITS.sourceTitle || item.sourceUrl!.length > FIELD_LIMITS.sourceUrl) return false;
  if ([item.paraphrase, item.cue, item.useCase].some((entry) => entry!.length > FIELD_LIMITS.decision)) return false;
  if (!isDate(item.createdAt!)) return false;
  if (item.sourceUrl && normalizeUrl(item.sourceUrl) !== item.sourceUrl) return false;
  return item.exportedAt === undefined || (typeof item.exportedAt === 'string' && isDate(item.exportedAt));
}

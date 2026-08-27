import { describe, expect, it } from 'vitest';
import { serializeCaptures } from './export';
import { createCapture, isReady, normalizeUrl, type Capture } from './types';

function readyCapture(overrides: Partial<Capture> = {}): Capture {
  return {
    id: 'card-1',
    passage: 'Retrieval strengthens access, not initial understanding.',
    sourceTitle: 'Study notes',
    sourceUrl: 'https://example.com/notes',
    createdAt: '2026-08-27T12:00:00.000Z',
    paraphrase: 'Practice recalling after first making sense of an idea.',
    cue: 'What must happen before retrieval practice?',
    useCase: 'When turning lecture notes into an Anki prompt.',
    ...overrides
  };
}

describe('capture gate', () => {
  it('creates a normalized local draft', () => {
    const capture = createCapture({ passage: '  A useful idea.  ', sourceTitle: ' Notes ', sourceUrl: 'https://example.com' });
    expect(capture.passage).toBe('A useful idea.');
    expect(capture.sourceTitle).toBe('Notes');
    expect(capture.sourceUrl).toBe('https://example.com/');
    expect(isReady(capture)).toBe(false);
  });

  it('requires all three learner decisions', () => {
    expect(isReady(readyCapture())).toBe(true);
    expect(isReady(readyCapture({ useCase: ' ' }))).toBe(false);
  });

  it('rejects unsafe and malformed source protocols', () => {
    expect(normalizeUrl('javascript:alert(1)')).toBe('');
    expect(normalizeUrl('not a url')).toBe('');
  });
});

describe('export formats', () => {
  it('refuses to export a draft', () => {
    expect(() => serializeCaptures([readyCapture({ cue: '' })], 'csv')).toThrow(/Finish/);
  });

  it('escapes CSV cells and includes a header', () => {
    const output = serializeCaptures([readyCapture({ cue: 'Why “retrieve”, now?' })], 'csv');
    expect(output).toContain('"Cue","Paraphrase"');
    expect(output).toContain('"Why “retrieve”, now?"');
  });

  it('produces three-column Anki TSV without raw newlines in fields', () => {
    const output = serializeCaptures([readyCapture({ useCase: 'During\na review' })], 'anki');
    const row = output.trim().split('\t');
    expect(row).toHaveLength(3);
    expect(row[1]).toContain('<br>');
    expect(row[2]).toBe('source-to-recall-gate');
  });

  it('creates readable Markdown for multiple cards', () => {
    const output = serializeCaptures([readyCapture(), readyCapture({ id: 'card-2', cue: 'A second cue?' })], 'markdown');
    expect(output).toContain('# What must happen before retrieval practice?');
    expect(output).toContain('\n\n---\n\n');
  });
});

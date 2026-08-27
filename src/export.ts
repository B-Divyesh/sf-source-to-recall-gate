import type { Capture } from './types';
import { isReady } from './types';

export type ExportFormat = 'markdown' | 'csv' | 'anki';

function assertReady(captures: Capture[]): void {
  if (!captures.length) throw new Error('Choose at least one ready prompt to export.');
  if (captures.some((capture) => !isReady(capture))) {
    throw new Error('Finish the paraphrase, cue, and use-case before export.');
  }
}

function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function tsvCell(value: string): string {
  return value.replaceAll('\t', ' ').replaceAll(/\r?\n/g, '<br>');
}

function safeMarkdown(value: string): string {
  return value.replaceAll('\r', '').trim();
}

export function serializeCaptures(captures: Capture[], format: ExportFormat): string {
  assertReady(captures);
  if (format === 'markdown') {
    return captures.map((item) => [
      `# ${safeMarkdown(item.cue)}`,
      '',
      `**In my words:** ${safeMarkdown(item.paraphrase)}`,
      '',
      `**Use it when:** ${safeMarkdown(item.useCase)}`,
      '',
      '> ' + safeMarkdown(item.passage).replaceAll('\n', '\n> '),
      item.sourceTitle ? `\nSource: ${safeMarkdown(item.sourceTitle)}${item.sourceUrl ? ` — ${item.sourceUrl}` : ''}` : ''
    ].filter(Boolean).join('\n')).join('\n\n---\n\n') + '\n';
  }
  if (format === 'csv') {
    const header = ['Cue', 'Paraphrase', 'Use case', 'Source passage', 'Source title', 'Source URL'];
    return [header, ...captures.map((item) => [item.cue, item.paraphrase, item.useCase, item.passage, item.sourceTitle, item.sourceUrl])]
      .map((row) => row.map(csvCell).join(','))
      .join('\r\n') + '\r\n';
  }
  return captures.map((item) => [
    tsvCell(item.cue),
    tsvCell(`<strong>In my words:</strong> ${item.paraphrase}<br><br><strong>Use it when:</strong> ${item.useCase}<br><br><blockquote>${item.passage}</blockquote>${item.sourceTitle ? `<br><small>${item.sourceTitle}</small>` : ''}`),
    'source-to-recall-gate'
  ].join('\t')).join('\n') + '\n';
}

export function extensionFor(format: ExportFormat): string {
  return format === 'markdown' ? 'md' : format === 'anki' ? 'tsv' : 'csv';
}

export function mimeFor(format: ExportFormat): string {
  return format === 'markdown' ? 'text/markdown' : format === 'anki' ? 'text/tab-separated-values' : 'text/csv';
}

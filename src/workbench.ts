import { extensionFor, mimeFor, serializeCaptures, type ExportFormat } from './export';
import { CHECKOUT_URL, initializeLicense, restoreLicense, type LicenseState } from './license';
import { addCapture, clearCaptures, getCaptures, removeCapture, saveCaptures, upsertCapture } from './storage';
import { createCapture, FIELD_LIMITS, isReady, type Capture } from './types';

type Filter = 'all' | 'draft' | 'ready';

function select<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing interface element: ${selector}`);
  return element;
}

function download(filename: string, content: string, type: string): void {
  const link = document.createElement('a');
  const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }));
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(date));
}

export async function mountWorkbench(root: HTMLElement): Promise<void> {
  root.innerHTML = `
    <div class="network-note" data-network role="status"></div>
    <section class="capture-strip" aria-labelledby="capture-heading">
      <div class="section-kicker">Intake / 01</div>
      <div class="capture-heading-row">
        <div>
          <h2 id="capture-heading">Capture only what you selected</h2>
          <p>Nothing is uploaded. Add a passage, then decide whether it deserves recall.</p>
        </div>
        <button class="button button-quiet clipboard-button" type="button">Paste from clipboard</button>
      </div>
      <form class="capture-form" novalidate>
        <div class="field field-wide">
          <label for="capture-passage">Selected passage <span aria-hidden="true">*</span></label>
          <textarea id="capture-passage" name="passage" rows="3" maxlength="${FIELD_LIMITS.passage}" required aria-describedby="capture-help"></textarea>
          <div class="field-meta" id="capture-help"><span>3–${FIELD_LIMITS.passage.toLocaleString()} characters</span><span data-capture-count>0</span></div>
        </div>
        <div class="capture-meta">
          <div class="field">
            <label for="capture-title">Source title <span class="optional">Optional</span></label>
            <input id="capture-title" name="title" maxlength="${FIELD_LIMITS.sourceTitle}" autocomplete="off">
          </div>
          <div class="field">
            <label for="capture-url">Source URL <span class="optional">Optional</span></label>
            <input id="capture-url" name="url" type="url" maxlength="${FIELD_LIMITS.sourceUrl}" inputmode="url" autocomplete="url">
          </div>
        </div>
        <div class="form-action-row">
          <p class="form-error" data-capture-error role="alert"></p>
          <button class="button button-primary" type="submit">Add to gate <span aria-hidden="true">→</span></button>
        </div>
      </form>
    </section>

    <section class="workbench" aria-labelledby="workbench-heading">
      <aside class="queue-panel" aria-label="Passage queue">
        <div class="section-kicker">Queue / 02</div>
        <div class="queue-title-row">
          <h2 id="workbench-heading">Decision queue</h2>
          <span class="count-stamp" data-total-count>0</span>
        </div>
        <div class="filter-bar" role="group" aria-label="Filter passages">
          <button type="button" data-filter="all" aria-pressed="true">All</button>
          <button type="button" data-filter="draft" aria-pressed="false">Draft</button>
          <button type="button" data-filter="ready" aria-pressed="false">Ready</button>
        </div>
        <div class="queue-list" data-queue-list></div>
        <div class="queue-empty" data-queue-empty>
          <span class="empty-glyph" aria-hidden="true">∅</span>
          <p><strong>The press is clear.</strong><br>Add one selected passage above or use the browser extension.</p>
        </div>
        <button class="text-button danger-action" type="button" data-clear-all hidden>Delete all local data</button>
      </aside>

      <section class="proof-panel" aria-live="polite">
        <div class="proof-blank" data-proof-blank>
          <div class="proof-number" aria-hidden="true">03</div>
          <h2>Choose a passage to work</h2>
          <p>The gate asks for three small decisions. If you cannot make them, discard the passage instead of creating queue debt.</p>
        </div>
        <form class="proof-form" data-proof-form hidden novalidate>
          <div class="proof-topline">
            <div>
              <div class="section-kicker">Proof / 03</div>
              <p class="source-byline" data-source-byline></p>
            </div>
            <div class="readiness" data-readiness><span class="readiness-mark" aria-hidden="true">0/3</span><span>decisions made</span></div>
          </div>
          <blockquote data-source-passage></blockquote>
          <div class="gate-fields">
            <div class="gate-field" data-field-state="empty">
              <div class="gate-number" aria-hidden="true">1</div>
              <div class="field">
                <label for="paraphrase">Put it in your words <span aria-hidden="true">*</span></label>
                <p id="paraphrase-help">What does this mean without the source’s phrasing?</p>
                <textarea id="paraphrase" name="paraphrase" rows="3" maxlength="${FIELD_LIMITS.decision}" required aria-describedby="paraphrase-help"></textarea>
              </div>
            </div>
            <div class="gate-field" data-field-state="empty">
              <div class="gate-number" aria-hidden="true">2</div>
              <div class="field">
                <label for="cue">Write the recall cue <span aria-hidden="true">*</span></label>
                <p id="cue-help">Ask one question your future self can answer.</p>
                <textarea id="cue" name="cue" rows="2" maxlength="${FIELD_LIMITS.decision}" required aria-describedby="cue-help"></textarea>
              </div>
            </div>
            <div class="gate-field" data-field-state="empty">
              <div class="gate-number" aria-hidden="true">3</div>
              <div class="field">
                <label for="use-case">Name a concrete use-case <span aria-hidden="true">*</span></label>
                <p id="use-case-help">Where would this idea change a choice, explanation, or problem?</p>
                <textarea id="use-case" name="useCase" rows="2" maxlength="${FIELD_LIMITS.decision}" required aria-describedby="use-case-help"></textarea>
              </div>
            </div>
          </div>
          <p class="form-error" data-proof-error role="alert"></p>
          <div class="proof-actions">
            <button class="text-button danger-action" type="button" data-discard>Discard passage</button>
            <div class="proof-save-group">
              <span class="save-hint">Ctrl/⌘ + Enter</span>
              <button class="button button-ink" type="submit">Save decisions</button>
            </div>
          </div>
          <div class="export-drawer" data-export-drawer>
            <div>
              <span class="section-kicker">Output / 04</span>
              <h3>Export this recall prompt</h3>
              <p data-export-help>Complete all three decisions to unlock export.</p>
            </div>
            <div class="export-buttons" role="group" aria-label="Export this prompt">
              <button class="button button-outline" type="button" data-export="markdown" disabled>Markdown</button>
              <button class="button button-outline" type="button" data-export="csv" disabled>CSV</button>
              <button class="button button-outline" type="button" data-export="anki" disabled>Anki TSV</button>
            </div>
          </div>
        </form>
      </section>
    </section>

    <section class="press-pass" id="press-pass" aria-labelledby="pass-heading">
      <div class="pass-copy">
        <span class="section-kicker inverse">Press pass / Optional</span>
        <h2 id="pass-heading">Move a whole ready stack.</h2>
        <p>The free gate always exports one prompt at a time. A <strong>$9 one-time</strong> Press Pass adds batch export and local backup/restore. No subscription.</p>
        <div class="pass-actions">
          <a class="button button-paper" href="${CHECKOUT_URL}" target="_blank" rel="noreferrer">Buy Press Pass — $9</a>
          <span class="license-status" data-license-status role="status">Checking local license…</span>
        </div>
        <details class="restore-license">
          <summary>Have a license? Restore it</summary>
          <form data-license-form>
            <label for="license-token">License token</label>
            <div class="inline-form">
              <input id="license-token" name="license" type="password" autocomplete="off" required>
              <button class="button button-paper-outline" type="submit">Verify license</button>
            </div>
            <p class="license-error" data-license-error role="alert"></p>
          </form>
        </details>
      </div>
      <div class="batch-box">
        <div class="batch-count"><strong data-ready-count>0</strong><span>ready prompts</span></div>
        <label for="batch-format">Batch format</label>
        <select id="batch-format">
          <option value="markdown">Markdown</option>
          <option value="csv">CSV</option>
          <option value="anki">Anki TSV</option>
        </select>
        <button class="button button-paper" type="button" data-batch-export disabled>Export ready stack</button>
        <button class="button button-paper-outline" type="button" data-backup disabled>Download local backup</button>
        <label class="button button-paper-outline upload-label" aria-disabled="true" data-restore-label>Restore local backup<input type="file" accept="application/json,.json" data-restore-backup disabled></label>
      </div>
    </section>

    <dialog class="confirm-dialog" data-clear-dialog aria-labelledby="clear-title">
      <form method="dialog">
        <div class="dialog-mark" aria-hidden="true">!</div>
        <h2 id="clear-title">Delete every local passage?</h2>
        <p>This removes drafts and export-ready prompts from this browser. Download a Press Pass backup first if you need one.</p>
        <div class="dialog-actions">
          <button class="button button-outline" value="cancel">Keep my passages</button>
          <button class="button button-danger" value="confirm">Delete all local data</button>
        </div>
      </form>
    </dialog>
    <div class="toast" data-toast role="status" aria-live="polite" hidden><span data-toast-copy></span><button type="button" data-undo hidden>Undo</button></div>
  `;

  let captures: Capture[] = [];
  let selectedId = '';
  let filter: Filter = 'all';
  let removedForUndo: Capture | undefined;
  let license: LicenseState = { unlocked: false, notice: '', token: '' };
  let toastTimer = 0;

  const queueList = select<HTMLElement>(root, '[data-queue-list]');
  const queueEmpty = select<HTMLElement>(root, '[data-queue-empty]');
  const proofForm = select<HTMLFormElement>(root, '[data-proof-form]');
  const proofBlank = select<HTMLElement>(root, '[data-proof-blank]');
  const captureForm = select<HTMLFormElement>(root, '.capture-form');
  const capturePassage = select<HTMLTextAreaElement>(root, '#capture-passage');
  const captureTitle = select<HTMLInputElement>(root, '#capture-title');
  const captureUrl = select<HTMLInputElement>(root, '#capture-url');
  const captureError = select<HTMLElement>(root, '[data-capture-error]');
  const proofError = select<HTMLElement>(root, '[data-proof-error]');
  const clearDialog = select<HTMLDialogElement>(root, '[data-clear-dialog]');

  function notify(copy: string, undo = false): void {
    const toast = select<HTMLElement>(root, '[data-toast]');
    select<HTMLElement>(root, '[data-toast-copy]').textContent = copy;
    select<HTMLButtonElement>(root, '[data-undo]').hidden = !undo;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { toast.hidden = true; removedForUndo = undefined; }, 8000);
  }

  function updateNetwork(): void {
    const note = select<HTMLElement>(root, '[data-network]');
    note.textContent = navigator.onLine ? '' : 'Offline — capture, decisions, and exports still work locally. License checks will retry when you reconnect.';
    note.hidden = navigator.onLine;
  }

  function updateReadiness(): void {
    const fields = Array.from(proofForm.querySelectorAll<HTMLTextAreaElement>('textarea'));
    const complete = fields.filter((field) => field.value.trim()).length;
    fields.forEach((field) => field.closest<HTMLElement>('.gate-field')!.dataset.fieldState = field.value.trim() ? 'complete' : 'empty');
    const readiness = select<HTMLElement>(root, '[data-readiness]');
    select<HTMLElement>(readiness, '.readiness-mark').textContent = `${complete}/3`;
    readiness.classList.toggle('is-ready', complete === 3);
    const ready = complete === 3;
    root.querySelectorAll<HTMLButtonElement>('[data-export]').forEach((button) => button.disabled = !ready);
    select<HTMLElement>(root, '[data-export-help]').textContent = ready ? 'This prompt is ready. Choose the format that fits your review tool.' : 'Complete all three decisions to unlock export.';
  }

  function currentCapture(): Capture | undefined {
    return captures.find((item) => item.id === selectedId);
  }

  function openCapture(capture: Capture, focus = false): void {
    selectedId = capture.id;
    proofBlank.hidden = true;
    proofForm.hidden = false;
    select<HTMLElement>(root, '[data-source-passage]').textContent = capture.passage;
    const source = capture.sourceTitle || (capture.sourceUrl ? new URL(capture.sourceUrl).hostname : 'Saved passage');
    select<HTMLElement>(root, '[data-source-byline]').textContent = `${source} · captured ${formatDate(capture.createdAt)}`;
    (proofForm.elements.namedItem('paraphrase') as HTMLTextAreaElement).value = capture.paraphrase;
    (proofForm.elements.namedItem('cue') as HTMLTextAreaElement).value = capture.cue;
    (proofForm.elements.namedItem('useCase') as HTMLTextAreaElement).value = capture.useCase;
    updateReadiness();
    renderQueue();
    if (focus) (proofForm.elements.namedItem('paraphrase') as HTMLTextAreaElement).focus();
  }

  function renderQueue(): void {
    const visible = captures.filter((capture) => filter === 'all' || (filter === 'ready' ? isReady(capture) : !isReady(capture)));
    queueList.replaceChildren(...visible.map((capture) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'queue-item';
      button.dataset.selected = String(capture.id === selectedId);
      button.setAttribute('aria-pressed', String(capture.id === selectedId));
      const state = document.createElement('span');
      state.className = `queue-state ${isReady(capture) ? 'ready' : ''}`;
      state.textContent = isReady(capture) ? 'Ready' : 'Draft';
      const copy = document.createElement('span');
      copy.className = 'queue-copy';
      copy.textContent = capture.cue || capture.passage;
      const date = document.createElement('span');
      date.className = 'queue-date';
      date.textContent = formatDate(capture.createdAt);
      button.append(state, copy, date);
      button.addEventListener('click', () => openCapture(capture));
      return button;
    }));
    queueEmpty.hidden = captures.length > 0;
    if (captures.length && !visible.length) {
      queueEmpty.hidden = false;
      queueEmpty.querySelector('p')!.innerHTML = '<strong>No passages in this view.</strong><br>Try another queue filter.';
    } else if (!captures.length) {
      queueEmpty.querySelector('p')!.innerHTML = '<strong>The press is clear.</strong><br>Add one selected passage above or use the browser extension.';
    }
    select<HTMLElement>(root, '[data-total-count]').textContent = String(captures.length);
    select<HTMLElement>(root, '[data-ready-count]').textContent = String(captures.filter(isReady).length);
    select<HTMLButtonElement>(root, '[data-clear-all]').hidden = captures.length === 0;
  }

  async function reload(): Promise<void> {
    captures = await getCaptures();
    renderQueue();
    if (selectedId) {
      const updated = currentCapture();
      if (updated) openCapture(updated);
      else {
        selectedId = '';
        proofForm.hidden = true;
        proofBlank.hidden = false;
      }
    }
  }

  function updateLicenseUi(): void {
    const status = select<HTMLElement>(root, '[data-license-status]');
    status.textContent = license.unlocked ? `✓ Press Pass active${license.notice ? ` · ${license.notice}` : ''}` : (license.notice || 'Free edition · individual exports included');
    status.classList.toggle('is-active', license.unlocked);
    select<HTMLButtonElement>(root, '[data-batch-export]').disabled = !license.unlocked;
    select<HTMLButtonElement>(root, '[data-backup]').disabled = !license.unlocked;
    const restore = select<HTMLInputElement>(root, '[data-restore-backup]');
    restore.disabled = !license.unlocked;
    const label = select<HTMLElement>(root, '[data-restore-label]');
    label.setAttribute('aria-disabled', String(!license.unlocked));
  }

  capturePassage.addEventListener('input', () => select<HTMLElement>(root, '[data-capture-count]').textContent = capturePassage.value.length.toLocaleString());
  captureForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    captureError.textContent = '';
    try {
      const capture = createCapture({ passage: capturePassage.value, sourceTitle: captureTitle.value, sourceUrl: captureUrl.value });
      await addCapture(capture);
      captureForm.reset();
      select<HTMLElement>(root, '[data-capture-count]').textContent = '0';
      await reload();
      openCapture(capture, true);
      notify('Passage added. Make three decisions or discard it.');
    } catch (error) {
      captureError.textContent = error instanceof Error ? error.message : 'Could not save this passage locally.';
      capturePassage.focus();
    }
  });

  select<HTMLButtonElement>(root, '.clipboard-button').addEventListener('click', async () => {
    captureError.textContent = '';
    try {
      capturePassage.value = await navigator.clipboard.readText();
      capturePassage.dispatchEvent(new Event('input'));
      capturePassage.focus();
    } catch {
      captureError.textContent = 'Clipboard access was not granted. Paste into the passage field with Ctrl/⌘ + V.';
      capturePassage.focus();
    }
  });

  root.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((button) => button.addEventListener('click', () => {
    filter = button.dataset.filter as Filter;
    root.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    renderQueue();
  }));

  proofForm.addEventListener('input', updateReadiness);
  proofForm.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      proofForm.requestSubmit();
    }
  });
  proofForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    proofError.textContent = '';
    const capture = currentCapture();
    if (!capture) return;
    const data = new FormData(proofForm);
    capture.paraphrase = String(data.get('paraphrase') ?? '').trim();
    capture.cue = String(data.get('cue') ?? '').trim();
    capture.useCase = String(data.get('useCase') ?? '').trim();
    try {
      await upsertCapture(capture);
      await reload();
      notify(isReady(capture) ? 'Saved. This recall prompt is ready to export.' : 'Draft saved locally.');
    } catch {
      proofError.textContent = 'Could not save locally. Check this browser’s storage settings and try again.';
    }
  });

  root.querySelectorAll<HTMLButtonElement>('[data-export]').forEach((button) => button.addEventListener('click', async () => {
    const capture = currentCapture();
    if (!capture) return;
    const format = button.dataset.export as ExportFormat;
    try {
      download(`recall-${capture.id.slice(0, 8)}.${extensionFor(format)}`, serializeCaptures([capture], format), mimeFor(format));
      capture.exportedAt = new Date().toISOString();
      await upsertCapture(capture);
      notify(`Exported ${format === 'anki' ? 'Anki TSV' : format}.`);
    } catch (error) {
      proofError.textContent = error instanceof Error ? error.message : 'Export failed.';
    }
  }));

  select<HTMLButtonElement>(root, '[data-discard]').addEventListener('click', async () => {
    if (!selectedId) return;
    removedForUndo = await removeCapture(selectedId);
    selectedId = '';
    await reload();
    notify('Passage discarded from this device.', true);
  });

  select<HTMLButtonElement>(root, '[data-undo]').addEventListener('click', async () => {
    if (!removedForUndo) return;
    await addCapture(removedForUndo);
    const restored = removedForUndo;
    removedForUndo = undefined;
    await reload();
    openCapture(restored);
    notify('Passage restored.');
  });

  select<HTMLButtonElement>(root, '[data-clear-all]').addEventListener('click', () => clearDialog.showModal());
  clearDialog.addEventListener('close', async () => {
    if (clearDialog.returnValue !== 'confirm') return;
    await clearCaptures();
    selectedId = '';
    await reload();
    notify('All local passages were deleted.');
  });

  select<HTMLFormElement>(root, '[data-license-form]').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const error = select<HTMLElement>(root, '[data-license-error]');
    error.textContent = '';
    try {
      license = await restoreLicense(String(new FormData(form).get('license') ?? ''));
      updateLicenseUi();
      if (!license.unlocked) error.textContent = license.notice || 'That license could not be verified.';
    } catch {
      error.textContent = 'License verification failed. Check the token and your connection.';
    }
  });

  select<HTMLButtonElement>(root, '[data-batch-export]').addEventListener('click', async () => {
    const ready = captures.filter(isReady);
    if (!license.unlocked) return;
    const format = select<HTMLSelectElement>(root, '#batch-format').value as ExportFormat;
    try {
      download(`recall-ready-stack.${extensionFor(format)}`, serializeCaptures(ready, format), mimeFor(format));
      const exportedAt = new Date().toISOString();
      ready.forEach((capture) => capture.exportedAt = exportedAt);
      await saveCaptures(captures);
      notify(`Exported ${ready.length} ready prompt${ready.length === 1 ? '' : 's'}.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Batch export failed.');
    }
  });

  select<HTMLButtonElement>(root, '[data-backup]').addEventListener('click', () => {
    if (!license.unlocked) return;
    download('source-to-recall-gate-backup.json', JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), captures }, null, 2), 'application/json');
  });

  select<HTMLInputElement>(root, '[data-restore-backup]').addEventListener('change', async (event) => {
    if (!license.unlocked) return;
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const backup = JSON.parse(await file.text()) as { version: number; captures: Capture[] };
      if (backup.version !== 1 || !Array.isArray(backup.captures)) throw new Error();
      const valid = backup.captures.filter((item) => item && typeof item.id === 'string' && typeof item.passage === 'string');
      await saveCaptures(valid);
      selectedId = '';
      await reload();
      notify(`Restored ${valid.length} passage${valid.length === 1 ? '' : 's'} from backup.`);
    } catch {
      notify('That file is not a valid Source-to-Recall Gate backup.');
    } finally {
      input.value = '';
    }
  });

  window.addEventListener('online', updateNetwork);
  window.addEventListener('offline', updateNetwork);
  updateNetwork();
  try {
    await reload();
  } catch {
    queueEmpty.hidden = false;
    queueEmpty.querySelector('p')!.innerHTML = '<strong>Local storage is unavailable.</strong><br>Allow site storage, then reload to use the gate.';
  }
  try {
    license = await initializeLicense();
  } catch {
    license = { unlocked: false, notice: 'License storage is unavailable. Your free tools still work.', token: '' };
  }
  updateLicenseUi();
}

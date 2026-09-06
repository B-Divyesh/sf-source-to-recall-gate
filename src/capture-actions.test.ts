import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleCommand, handleContextMenuClick, handleRuntimeMessage } from './capture-actions';
import { getCaptures } from './storage';

function fakeBrowser(selection = 'A selected passage about testing memory.') {
  const values = new Map<string, unknown>();
  const openOptionsPage = vi.fn(async () => undefined);
  const browser = {
    storage: {
      local: {
        get: async (key: string) => ({ [key]: values.get(key) }),
        set: async (items: Record<string, unknown>) => { Object.entries(items).forEach(([key, value]) => values.set(key, value)); }
      }
    },
    runtime: { openOptionsPage },
    tabs: { query: vi.fn(async () => [{ id: 42, title: 'Learning notes', url: 'https://example.edu/notes' }]) },
    scripting: { executeScript: vi.fn(async () => [{ result: selection }]) }
  };
  vi.stubGlobal('chrome', browser);
  return { browser: browser as never, openOptionsPage };
}

afterEach(() => vi.unstubAllGlobals());

describe('browser capture paths', () => {
  it('@claim:extension-context-menu stores the selected text and opens review', async () => {
    const { browser, openOptionsPage } = fakeBrowser();
    const handled = await handleContextMenuClick(
      { menuItemId: 'save-selection-for-review', selectionText: 'Context menu passage' },
      { id: 42, title: 'Biology notes', url: 'https://example.edu/biology' },
      browser
    );
    const [capture] = await getCaptures();
    expect(handled).toBe(true);
    expect(capture).toMatchObject({ passage: 'Context menu passage', sourceTitle: 'Biology notes' });
    expect(openOptionsPage).toHaveBeenCalledOnce();
  });

  it('@claim:extension-shortcut stores the active selection and opens review', async () => {
    const { browser, openOptionsPage } = fakeBrowser('Keyboard shortcut passage');
    expect(await handleCommand('capture-selection', browser)).toBe(true);
    expect((await getCaptures())[0].passage).toBe('Keyboard shortcut passage');
    expect(openOptionsPage).toHaveBeenCalledOnce();
  });

  it('@claim:extension-toolbar stores the active selection and opens review', async () => {
    const { browser, openOptionsPage } = fakeBrowser('Toolbar passage');
    const result = await handleRuntimeMessage({ type: 'capture-active-selection' }, browser);
    expect(result).toEqual({ ok: true, message: 'Selected text saved for review.' });
    expect((await getCaptures())[0].passage).toBe('Toolbar passage');
    expect(openOptionsPage).toHaveBeenCalledOnce();
  });
});

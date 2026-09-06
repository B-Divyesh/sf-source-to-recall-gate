import { addCapture } from './storage';
import { createCapture } from './types';

type CaptureBrowser = Pick<typeof chrome, 'runtime' | 'scripting' | 'tabs'>;
type MenuInfo = Pick<chrome.contextMenus.OnClickData, 'menuItemId' | 'selectionText'>;
type CaptureTab = Pick<chrome.tabs.Tab, 'id' | 'title' | 'url'>;

export async function storeSelection(text: string, title = '', url = '', browser: CaptureBrowser = chrome): Promise<void> {
  const capture = createCapture({ passage: text, sourceTitle: title, sourceUrl: url });
  await addCapture(capture);
  await browser.runtime.openOptionsPage();
}

export async function captureActiveTab(browser: CaptureBrowser = chrome): Promise<{ ok: boolean; message: string }> {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('No active page found.');
    const [{ result }] = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => globalThis.getSelection?.()?.toString().trim() ?? ''
    });
    if (!result) throw new Error('Select a passage on the page first.');
    await storeSelection(String(result), tab.title ?? '', tab.url ?? '', browser);
    return { ok: true, message: 'Selected text saved for review.' };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Could not save this selection.' };
  }
}

export async function handleContextMenuClick(info: MenuInfo, tab: CaptureTab | undefined, browser: CaptureBrowser = chrome): Promise<boolean> {
  if (info.menuItemId !== 'save-selection-for-review' || !info.selectionText) return false;
  await storeSelection(info.selectionText, tab?.title ?? '', tab?.url ?? '', browser);
  return true;
}

export async function handleCommand(command: string, browser: CaptureBrowser = chrome): Promise<boolean> {
  if (command !== 'capture-selection') return false;
  const result = await captureActiveTab(browser);
  return result.ok;
}

export async function handleRuntimeMessage(message: unknown, browser: CaptureBrowser = chrome): Promise<{ ok: boolean; message: string } | undefined> {
  if ((message as { type?: string } | null)?.type !== 'capture-active-selection') return undefined;
  return captureActiveTab(browser);
}

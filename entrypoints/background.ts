import { addCapture } from '../src/storage';
import { createCapture } from '../src/types';
import { defineBackground } from 'wxt/utils/define-background';

async function storeSelection(text: string, title = '', url = ''): Promise<void> {
  const capture = createCapture({ passage: text, sourceTitle: title, sourceUrl: url });
  await addCapture(capture);
  await chrome.runtime.openOptionsPage();
}

async function captureActiveTab(): Promise<{ ok: boolean; message: string }> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) throw new Error('No active page found.');
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => globalThis.getSelection?.()?.toString().trim() ?? ''
    });
    if (!result) throw new Error('Select a passage on the page first.');
    await storeSelection(result, tab.title ?? '', tab.url ?? '');
    return { ok: true, message: 'Selection sent to the gate.' };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Could not capture this selection.' };
  }
}

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.removeAll(() => chrome.contextMenus.create({
      id: 'send-to-recall-gate',
      title: 'Send selection to Recall Gate',
      contexts: ['selection']
    }));
  });

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== 'send-to-recall-gate' || !info.selectionText) return;
    try {
      await storeSelection(info.selectionText, tab?.title ?? '', tab?.url ?? '');
    } catch (error) {
      console.warn('Source-to-Recall Gate:', error instanceof Error ? error.message : error);
    }
  });

  chrome.commands.onCommand.addListener((command) => {
    if (command === 'capture-selection') void captureActiveTab();
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== 'capture-active-selection') return;
    void captureActiveTab().then(sendResponse);
    return true;
  });
});

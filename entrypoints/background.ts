import { handleCommand, handleContextMenuClick, handleRuntimeMessage } from '../src/capture-actions';
import { defineBackground } from 'wxt/utils/define-background';

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.removeAll(() => chrome.contextMenus.create({
      id: 'save-selection-for-review',
      title: 'Save selection for review',
      contexts: ['selection']
    }));
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    void handleContextMenuClick(info, tab).catch((error) => {
      console.warn('Source-to-Recall Gate:', error instanceof Error ? error.message : error);
    });
  });

  chrome.commands.onCommand.addListener((command) => {
    void handleCommand(command);
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if ((message as { type?: string } | null)?.type !== 'capture-active-selection') return;
    void handleRuntimeMessage(message).then(sendResponse);
    return true;
  });
});

import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: '.',
  outDir: '.output',
  manifest: {
    name: 'Source-to-Recall Gate',
    description: 'Turn selected passages into recall prompts after writing a paraphrase, cue, and use-case.',
    version: '1.0.0',
    permissions: ['storage', 'contextMenus', 'activeTab', 'scripting'],
    host_permissions: ['https://api.sociobot.in/*'],
    action: { default_title: 'Save selected text for review' },
    commands: {
      'capture-selection': {
        suggested_key: { default: 'Alt+Shift+G', mac: 'Alt+Shift+G' },
        description: 'Save the current selection for review'
      }
    },
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      128: 'icon/128.png'
    }
  },
  vite: () => ({ build: { target: 'es2022' } })
});

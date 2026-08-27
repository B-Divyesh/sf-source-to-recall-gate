import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: '.',
  outDir: '.output',
  manifest: {
    name: 'Source-to-Recall Gate',
    description: 'Turn selected passages into personally meaningful recall cues before they become queue debt.',
    version: '1.0.0',
    permissions: ['storage', 'contextMenus', 'activeTab', 'scripting'],
    host_permissions: ['https://api.sociobot.in/*'],
    action: { default_title: 'Send selection to the gate' },
    commands: {
      'capture-selection': {
        suggested_key: { default: 'Alt+Shift+G', mac: 'Alt+Shift+G' },
        description: 'Send the current selection to Source-to-Recall Gate'
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

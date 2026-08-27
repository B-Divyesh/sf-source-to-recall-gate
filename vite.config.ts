import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'site',
  publicDir: '../public',
  build: {
    target: 'es2022',
    outDir: '../dist/site',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'site/index.html'),
        privacy: resolve(import.meta.dirname, 'site/privacy/index.html'),
        terms: resolve(import.meta.dirname, 'site/terms/index.html')
      }
    }
  }
});

import { cp, mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { run } from './run.mjs';

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const archiveName = `${packageJson.name}-${packageJson.version}-chrome.zip`;
const archiveSource = resolve('.output', archiveName);
const archiveDestination = resolve('dist/site/downloads/source-to-recall-gate-chrome.zip');

// WXT's zip command performs a fresh MV3 production build before packaging.
// Use its exact, versioned output name rather than selecting an arbitrary ZIP
// left in .output by an earlier command.
await run('npx', ['wxt', 'zip']);
await run('npx', ['vite', 'build']);
await mkdir(resolve('dist/site/downloads'), { recursive: true });
await cp(archiveSource, archiveDestination);
await run(process.platform === 'win32' ? 'tar' : 'unzip', process.platform === 'win32'
  ? ['-tf', archiveDestination]
  : ['-t', archiveDestination]);

console.log(`Packaged valid MV3 archive at ${archiveDestination}`);

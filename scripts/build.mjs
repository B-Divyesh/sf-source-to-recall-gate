import { cp, mkdir, readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

function run(command, args) {
  return new Promise((ok, fail) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
    child.on('exit', (code) => code === 0 ? ok() : fail(new Error(`${command} exited with ${code}`)));
  });
}

await run('npx', ['vite', 'build']);
await run('npx', ['wxt', 'build']);
await run('npx', ['wxt', 'zip']);

const files = await readdir(resolve('.output'));
const zip = files.find((name) => name.endsWith('-chrome.zip'));
if (!zip) throw new Error('WXT did not produce a Chrome package');
await mkdir(resolve('dist/site/downloads'), { recursive: true });
await cp(resolve('.output', zip), resolve('dist/site/downloads/source-to-recall-gate-chrome.zip'));
console.log(`Packaged dist/site/downloads/source-to-recall-gate-chrome.zip from ${zip}`);

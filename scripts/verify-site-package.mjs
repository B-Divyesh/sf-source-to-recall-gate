import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const archive = resolve('dist/site/downloads/source-to-recall-gate-chrome.zip');
const config = resolve('dist/site/staticwebapp.config.json');
const archiveBytes = await readFile(archive);

if (archiveBytes.subarray(0, 4).toString('ascii') !== 'PK\x03\x04') {
  throw new Error(`${archive} is not a ZIP archive.`);
}
if ((await stat(archive)).size === 0) throw new Error(`${archive} is empty.`);

const testZip = spawnSync('unzip', ['-t', archive], { encoding: 'utf8' });
if (testZip.status !== 0) throw new Error(`ZIP integrity check failed:\n${testZip.stdout}${testZip.stderr}`);

const manifestResult = spawnSync('unzip', ['-p', archive, 'manifest.json'], { encoding: 'utf8' });
if (manifestResult.status !== 0) throw new Error('The packaged ZIP does not contain manifest.json.');
const manifest = JSON.parse(manifestResult.stdout);
if (manifest.manifest_version !== 3) throw new Error('The packaged extension is not Manifest V3.');

const swaConfig = JSON.parse(await readFile(config, 'utf8'));
const route = swaConfig.routes?.find((entry) => entry.route === '/downloads/source-to-recall-gate-chrome.zip');
if (route?.headers?.['Content-Type'] !== 'application/zip') {
  throw new Error('Static deployment config must declare application/zip for the extension download.');
}
if (!swaConfig.navigationFallback?.exclude?.includes('/downloads/*')) {
  throw new Error('Static deployment config must exclude downloads from SPA fallback.');
}

console.log(`Built-output regression passed: valid MV3 ZIP at ${archive} (${archiveBytes.length} bytes).`);

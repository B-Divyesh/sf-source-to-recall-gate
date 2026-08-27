import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { canonicalZipContentDigest } from './zip-content-digest.mjs';

const baseUrl = (process.env.SITE_URL ?? 'https://source-to-recall-gate.sociobot.in').replace(/\/$/, '');
const endpoint = `${baseUrl}/downloads/source-to-recall-gate-chrome.zip`;
const response = await fetch(endpoint, { redirect: 'error' });
const contentType = response.headers.get('content-type') ?? '';
const disposition = response.headers.get('content-disposition') ?? '';
const cacheControl = response.headers.get('cache-control') ?? '';
const liveBytes = Buffer.from(await response.arrayBuffer());

if (!response.ok) throw new Error(`Live download returned HTTP ${response.status}: ${endpoint}`);
if (!contentType.toLowerCase().startsWith('application/zip')) {
  throw new Error(`Live download has ${contentType || 'no'} Content-Type; expected application/zip.`);
}
if (!/attachment/i.test(disposition)) throw new Error('Live download is missing an attachment Content-Disposition.');
if (!/max-age=31536000/.test(cacheControl) || !/immutable/.test(cacheControl)) {
  throw new Error('Live download is missing its immutable one-year cache policy.');
}
if (liveBytes.subarray(0, 4).toString('ascii') !== 'PK\x03\x04') {
  throw new Error('Live download does not begin with ZIP magic bytes.');
}

const localArchive = await readFile(resolve('dist/site/downloads/source-to-recall-gate-chrome.zip'));
const liveArchive = canonicalZipContentDigest(liveBytes);
const localArchiveDigest = canonicalZipContentDigest(localArchive);
if (liveArchive.digest !== localArchiveDigest.digest) {
  throw new Error(
    `Live download content does not match the archive in dist/site. `
    + `Live digest: ${liveArchive.digest}; local digest: ${localArchiveDigest.digest}.`
  );
}

console.log(
  `Live-download regression passed: ${endpoint} serves a ${liveBytes.length}-byte ZIP `
  + `with matching canonical content digest ${liveArchive.digest}.`
);

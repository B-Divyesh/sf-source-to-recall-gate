import { createHash } from 'node:crypto';
import { inflateRawSync } from 'node:zlib';

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
const LOCAL_FILE_SIGNATURE = 0x04034b50;
const MAX_ZIP_COMMENT_LENGTH = 0xffff;

function fail(message) {
  throw new Error(`Invalid ZIP archive: ${message}`);
}

function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) {
    value ^= byte;
    for (let bit = 0; bit < 8; bit += 1) value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
  }
  return (value ^ 0xffffffff) >>> 0;
}

function findEndOfCentralDirectory(bytes) {
  const firstPossibleOffset = Math.max(0, bytes.length - 22 - MAX_ZIP_COMMENT_LENGTH);
  for (let offset = bytes.length - 22; offset >= firstPossibleOffset; offset -= 1) {
    if (bytes.readUInt32LE(offset) === EOCD_SIGNATURE) return offset;
  }
  fail('end-of-central-directory record is missing.');
}

function readFileContents(bytes, entry) {
  if (bytes.readUInt32LE(entry.localOffset) !== LOCAL_FILE_SIGNATURE) {
    fail(`local header for ${entry.name} is missing.`);
  }

  const nameLength = bytes.readUInt16LE(entry.localOffset + 26);
  const extraLength = bytes.readUInt16LE(entry.localOffset + 28);
  const localName = bytes.subarray(entry.localOffset + 30, entry.localOffset + 30 + nameLength).toString('utf8');
  if (localName !== entry.name) fail(`local header path does not match ${entry.name}.`);
  const dataOffset = entry.localOffset + 30 + nameLength + extraLength;
  const dataEnd = dataOffset + entry.compressedSize;
  if (dataEnd > bytes.length) fail(`contents for ${entry.name} are truncated.`);

  const compressed = bytes.subarray(dataOffset, dataEnd);
  let contents;
  if (entry.compression === 0) contents = compressed;
  else if (entry.compression === 8) contents = inflateRawSync(compressed);
  else fail(`${entry.name} uses unsupported compression method ${entry.compression}.`);

  if (contents.length !== entry.uncompressedSize) {
    fail(`${entry.name} has an unexpected uncompressed size.`);
  }
  if (crc32(contents) !== entry.crc) fail(`${entry.name} failed its CRC integrity check.`);
  return contents;
}

/**
 * Returns a deterministic digest of ZIP file paths and uncompressed contents.
 * It deliberately excludes ZIP wrapper metadata such as entry timestamps and
 * compression output, while retaining every file and directory in the archive.
 */
export function canonicalZipContentDigest(bytes) {
  if (!Buffer.isBuffer(bytes)) bytes = Buffer.from(bytes);
  const eocdOffset = findEndOfCentralDirectory(bytes);
  const diskNumber = bytes.readUInt16LE(eocdOffset + 4);
  const centralDisk = bytes.readUInt16LE(eocdOffset + 6);
  const entryCount = bytes.readUInt16LE(eocdOffset + 10);
  const centralSize = bytes.readUInt32LE(eocdOffset + 12);
  const centralOffset = bytes.readUInt32LE(eocdOffset + 16);

  if (diskNumber !== 0 || centralDisk !== 0) fail('multi-disk archives are not supported.');
  if (centralOffset + centralSize > eocdOffset) fail('central directory is out of bounds.');

  const entries = [];
  const names = new Set();
  let offset = centralOffset;
  for (let index = 0; index < entryCount; index += 1) {
    if (offset + 46 > centralOffset + centralSize || bytes.readUInt32LE(offset) !== CENTRAL_DIRECTORY_SIGNATURE) {
      fail('central directory entry is missing.');
    }
    const flags = bytes.readUInt16LE(offset + 8);
    const compression = bytes.readUInt16LE(offset + 10);
    const compressedSize = bytes.readUInt32LE(offset + 20);
    const uncompressedSize = bytes.readUInt32LE(offset + 24);
    const crc = bytes.readUInt32LE(offset + 16);
    const nameLength = bytes.readUInt16LE(offset + 28);
    const extraLength = bytes.readUInt16LE(offset + 30);
    const commentLength = bytes.readUInt16LE(offset + 32);
    const localOffset = bytes.readUInt32LE(offset + 42);
    const headerEnd = offset + 46 + nameLength + extraLength + commentLength;
    if (headerEnd > centralOffset + centralSize) fail('central directory entry is truncated.');
    if (flags & 0x1) fail('encrypted entries are not supported.');

    const name = bytes.subarray(offset + 46, offset + 46 + nameLength).toString('utf8');
    if (!name || name.includes('\\') || name.startsWith('/') || name.split('/').includes('..')) {
      fail(`unsafe entry path ${JSON.stringify(name)}.`);
    }
    if (names.has(name)) fail(`duplicate entry ${name}.`);
    names.add(name);
    entries.push({ name, compression, compressedSize, uncompressedSize, localOffset, crc });
    offset = headerEnd;
  }
  if (offset !== centralOffset + centralSize) fail('central directory size does not match its entries.');

  const digest = createHash('sha256');
  digest.update('source-to-recall-gate:canonical-zip-content:v1\0');
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const contents = readFileContents(bytes, entry);
    digest.update(`${entry.name.endsWith('/') ? 'directory' : 'file'}:${entry.name}\0${contents.length}\0`);
    digest.update(contents);
  }
  return { digest: digest.digest('hex'), entries: entries.map((entry) => entry.name).sort() };
}

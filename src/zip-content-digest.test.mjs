import { describe, expect, it } from 'vitest';
import { canonicalZipContentDigest } from '../scripts/zip-content-digest.mjs';

function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) {
    value ^= byte;
    for (let bit = 0; bit < 8; bit += 1) value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
  }
  return (value ^ 0xffffffff) >>> 0;
}

function storedZip(files, timestamp) {
  const localParts = [];
  const centralParts = [];
  let localOffset = 0;
  for (const [name, value] of files) {
    const filename = Buffer.from(name);
    const contents = Buffer.from(value);
    const crc = crc32(contents);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(timestamp, 10);
    local.writeUInt16LE(timestamp, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(contents.length, 18);
    local.writeUInt32LE(contents.length, 22);
    local.writeUInt16LE(filename.length, 26);
    localParts.push(local, filename, contents);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(timestamp, 12);
    central.writeUInt16LE(timestamp, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(contents.length, 20);
    central.writeUInt32LE(contents.length, 24);
    central.writeUInt16LE(filename.length, 28);
    central.writeUInt32LE(localOffset, 42);
    centralParts.push(central, filename);
    localOffset += local.length + filename.length + contents.length;
  }
  const central = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(central.length, 12);
  end.writeUInt32LE(localOffset, 16);
  return Buffer.concat([...localParts, central, end]);
}

describe('canonical ZIP content digest', () => {
  it('matches archives with identical contents but different wrapper timestamps', () => {
    const files = [['manifest.json', '{"manifest_version":3}'], ['assets/options.css', 'body{}']];
    const early = canonicalZipContentDigest(storedZip(files, 0x1000));
    const later = canonicalZipContentDigest(storedZip(files, 0x8c7f));

    expect(early.digest).toBe(later.digest);
    expect(later.entries).toEqual(['assets/options.css', 'manifest.json']);
  });

  it('changes when a file payload or path changes', () => {
    const original = canonicalZipContentDigest(storedZip([['manifest.json', '{"name":"Gate"}']], 0x1000));
    const changedContents = canonicalZipContentDigest(storedZip([['manifest.json', '{"name":"Other"}']], 0x1000));
    const changedPath = canonicalZipContentDigest(storedZip([['other.json', '{"name":"Gate"}']], 0x1000));

    expect(changedContents.digest).not.toBe(original.digest);
    expect(changedPath.digest).not.toBe(original.digest);
  });

  it('rejects an archive whose payload does not pass ZIP integrity checks', () => {
    const archive = storedZip([['manifest.json', '{"manifest_version":3}']], 0x1000);
    const payloadOffset = 30 + Buffer.byteLength('manifest.json');
    archive[payloadOffset] ^= 1;

    expect(() => canonicalZipContentDigest(archive)).toThrow(/CRC integrity check/);
  });
});

// Entrypoint for the news-image-20261121 entry (Node 22, stdlib only).
//
// What this program does: it takes the entry.png that sits next to this
// file and places an exact copy of it at /output/entry.png. The grader
// runs this program twice and expects both runs to produce identical
// bytes, so the program does no drawing and no randomness — it only
// copies.
//
// Before writing anything it checks the picture:
//   - the file has to exist next to this script,
//   - it has to be a real PNG (the first eight bytes are the PNG magic),
//   - it has to be at most 1 MiB.
// After writing it reads the copy back and compares it byte for byte
// with the original, so a partial or corrupted write fails loudly
// instead of silently passing.
//
// When run outside the grader container, set MAKEFUN_OUTPUT_DIR to pick
// the destination folder:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(HERE, 'entry.png');
const DEST_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const DEST = join(DEST_DIR, 'entry.png');

if (!existsSync(SOURCE)) {
  throw new Error(`entry.png not found next to main.ts (${SOURCE})`);
}

const picture = readFileSync(SOURCE);

const MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const isPng = MAGIC.every((byte, i) => picture[i] === byte);
if (!isPng) {
  throw new Error('entry.png is not a PNG file (bad magic bytes)');
}

const ONE_MIB = 1024 * 1024;
if (picture.length > ONE_MIB) {
  throw new Error(`entry.png is ${picture.length} bytes, over the 1 MiB limit`);
}

mkdirSync(DEST_DIR, { recursive: true });
writeFileSync(DEST, picture);

const back = readFileSync(DEST);
if (!back.equals(picture)) {
  throw new Error('read-back mismatch: the copy differs from entry.png');
}

console.log(`wrote ${DEST} (${back.length} bytes)`);

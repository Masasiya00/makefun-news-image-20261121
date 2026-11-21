// main.ts for make.fun news-image-20261121 (Node 22, standard library only).
// Copies the entry.png beside this file to /output/entry.png, validating it
// first: it must exist, be a PNG (magic bytes), and be at most 1 MiB.
// The grader runs it twice; both runs write the same bytes.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = new URL('./entry.png', import.meta.url);
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const OUT = join(OUT_DIR, 'entry.png');

const buf = readFileSync(SRC);
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!buf.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error('entry.png is not a PNG file');
}
if (buf.length > 1048576) {
  throw new Error(`entry.png is ${buf.length} bytes, over the 1 MiB limit`);
}
copyFileSync(SRC, OUT);
const written = readFileSync(OUT);
if (!written.equals(buf)) {
  throw new Error('read-back mismatch: output differs from entry.png');
}
console.log(`wrote ${OUT} (${written.length} bytes)`);

// news-image-20261121 v7: copy the 1024x1024 front page to the output
// directory, validating it first (PNG, at most 1 MiB, at most
// 1024x1024) and verifying the copy byte for byte.
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const SOURCE = resolve(import.meta.dirname, "entry.png");
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const DEST = join(OUT_DIR, "entry.png");
const MAX_BYTES = 1024 * 1024;
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

if (!existsSync(SOURCE)) {
  throw new Error(`entry image not found: ${SOURCE}`);
}

const size = statSync(SOURCE).size;
if (size > MAX_BYTES) {
  throw new Error(`entry image is ${size} bytes, over the 1 MiB limit`);
}

const data = readFileSync(SOURCE);
if (data.length < 33 || !data.subarray(0, PNG_MAGIC.length).equals(PNG_MAGIC)) {
  throw new Error("entry image is not a PNG file");
}

const width = data.readUInt32BE(16);
const height = data.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`entry image is ${width}x${height}, over the 1024x1024 limit`);
}

mkdirSync(OUT_DIR, { recursive: true });
copyFileSync(SOURCE, DEST);

const written = readFileSync(DEST);
if (written.length !== data.length || !written.equals(data)) {
  throw new Error("output does not match the entry image byte for byte");
}

console.log(`wrote ${DEST} (${written.length} bytes, ${width}x${height})`);

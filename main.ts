import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const SOURCE = resolve(import.meta.dirname, "entry.png");
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const DEST = join(OUT_DIR, "entry.png");
const MAX_BYTES = 1024 * 1024;
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

if (!existsSync(SOURCE)) {
  throw new Error(`missing entry image: ${SOURCE}`);
}

const size = statSync(SOURCE).size;
if (size > MAX_BYTES) {
  throw new Error(`entry image is ${size} bytes, over the 1 MiB limit`);
}

const data = readFileSync(SOURCE);
if (data.length < PNG_MAGIC.length || !data.subarray(0, PNG_MAGIC.length).equals(PNG_MAGIC)) {
  throw new Error("entry image is not a PNG file");
}

mkdirSync(OUT_DIR, { recursive: true });
copyFileSync(SOURCE, DEST);

const written = readFileSync(DEST);
if (written.length !== data.length) {
  throw new Error(`output is ${written.length} bytes, expected ${data.length}`);
}
if (!written.equals(data)) {
  throw new Error("output does not match the entry image byte for byte");
}

console.log(`wrote ${DEST} (${written.length} bytes)`);

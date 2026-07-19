import sharp from 'sharp';
import { readdirSync, unlinkSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'img');
async function conv(dir, w, h) {
  const d = join(ROOT, dir);
  for (const f of readdirSync(d).filter((x) => x.endsWith('.png'))) {
    const src = join(d, f); const out = src.replace(/\.png$/, '.webp');
    await sharp(src).resize(w, h, { fit: 'cover', position: 'centre' }).webp({ quality: 82 }).toFile(out);
    unlinkSync(src);
    console.log(`${dir}/${f} → ${(statSync(out).size/1024).toFixed(0)}KB`);
  }
}
await conv('singers', 512, 512);
await conv('concert', 1200, 630);

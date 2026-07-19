import sharp from 'sharp';
import { readdirSync, unlinkSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'img', 'singers');
for (const sub of ['m','f']) {
  const d = join(ROOT, sub);
  for (const f of readdirSync(d).filter(x=>x.endsWith('.png'))) {
    const src = join(d,f), out = src.replace(/\.png$/,'.webp');
    await sharp(src).resize(512,512,{fit:'cover',position:'centre'}).webp({quality:82}).toFile(out);
    unlinkSync(src);
  }
}
console.log('done');

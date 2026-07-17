// 생성 PNG → 웹용 WebP(1200x630) 변환 후 원본 PNG 삭제 (§11 규격)
import sharp from 'sharp';
import { readdirSync, unlinkSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'img', 'generated');
for (const f of readdirSync(dir).filter((x) => x.endsWith('.png'))) {
  const src = join(dir, f);
  const out = src.replace(/\.png$/, '.webp');
  await sharp(src).resize(1200, 630, { fit: 'cover', position: 'centre' }).webp({ quality: 82 }).toFile(out);
  const kb = (statSync(out).size / 1024).toFixed(0);
  unlinkSync(src);
  console.log(`${f} → ${f.replace('.png', '.webp')} (${kb}KB)`);
}

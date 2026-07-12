// prisma/schema.prisma 의 datasource provider 를 환경변수로 스위치한다.
//   DATABASE_PROVIDER=sqlite (기본, 로컬)  |  postgresql (프로덕션)
// 단일 스키마 유지 → sqlite/postgres 드리프트 방지. generate/migrate 전에 실행.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const provider = (process.env.DATABASE_PROVIDER || 'sqlite').trim();
const allowed = ['sqlite', 'postgresql'];
if (!allowed.includes(provider)) {
  console.error(`[set-db-provider] 허용되지 않은 provider: ${provider} (${allowed.join('|')})`);
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(here, '..', 'prisma', 'schema.prisma');
const src = readFileSync(schemaPath, 'utf8');

// datasource db 블록 안의 provider 라인만 치환
const next = src.replace(
  /(datasource\s+db\s*\{[^}]*?provider\s*=\s*)"[^"]+"/s,
  `$1"${provider}"`,
);

if (next === src) {
  console.log(`[set-db-provider] 변경 없음 (이미 ${provider})`);
} else {
  writeFileSync(schemaPath, next);
  console.log(`[set-db-provider] datasource provider → ${provider}`);
}

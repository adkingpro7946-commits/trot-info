/**
 * 콘텐츠 자동 시드 러너 — Vercel 빌드 단계에서 실행.
 * seed-content.ts + seed-content-batch2..N.ts 를 순차 실행해 Neon(Postgres)에 콘텐츠를 채운다.
 *  - 전부 멱등(slug 기준 upsert)이라 매 배포마다 재실행해도 안전.
 *  - 파괴적 seed.ts(DEMO 데이터, 전역 deleteMany)는 절대 실행하지 않음.
 *  - DATABASE_URL 이 postgres 일 때만 동작(로컬 SQLite/미설정 시 건너뜀).
 *  - 시드 실패해도 exit 0 → 사이트 배포는 계속(비파괴). 실패는 로그로 확인.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const prismaDir = join(root, 'prisma');

const url = process.env.DATABASE_URL || '';
if (!/^postgres(ql)?:\/\//i.test(url)) {
  console.log('ℹ DATABASE_URL이 postgres가 아님 — 콘텐츠 자동시드 건너뜀 (로컬/미설정)');
  process.exit(0);
}

// 실행 대상: seed-content.ts → seed-content-batchN.ts (숫자 오름차순). seed.ts 는 제외.
const batchNums = readdirSync(prismaDir)
  .map((f) => /^seed-content-batch(\d+)\.ts$/.exec(f))
  .filter(Boolean)
  .map((m) => Number(m[1]))
  .sort((a, b) => a - b);

const files = ['seed-content.ts', ...batchNums.map((n) => `seed-content-batch${n}.ts`)];

const tsxBin = join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx');
const runner = existsSync(tsxBin) ? tsxBin : 'npx';
const baseArgs = runner === 'npx' ? ['--no-install', 'tsx'] : [];

console.log(`▶ 콘텐츠 자동시드 시작 — 대상 ${files.length}개`);
let ok = 0;
const failed = [];
for (const f of files) {
  const abs = join(prismaDir, f);
  if (!existsSync(abs)) { console.log(`  - 없음, 건너뜀 ${f}`); continue; }
  const r = spawnSync(runner, [...baseArgs, abs], { cwd: root, env: process.env, stdio: 'inherit' });
  if (r.status === 0) ok++;
  else { failed.push(`${f}(exit ${r.status ?? 'signal'})`); console.error(`  ✖ 실패 ${f}`); }
}
console.log(`\n✔ 콘텐츠 자동시드 완료 — 성공 ${ok}/${files.length}` + (failed.length ? `, 실패: ${failed.join(', ')}` : ''));
process.exit(0); // 비파괴: 시드 실패해도 배포는 계속

/**
 * 콘텐츠 자동 시드 러너 — Vercel 빌드 단계에서 실행.
 * seed-content.ts + seed-content-batch2..N.ts 를 순차 실행해 Neon(Postgres)에 콘텐츠를 채운다.
 *  - 전부 멱등(slug 기준 upsert)이라 매 배포마다 재실행해도 안전.
 *  - 파괴적 seed.ts(DEMO 데이터, 전역 deleteMany)는 절대 실행하지 않음.
 *  - DATABASE_URL 이 postgres 일 때만 동작(로컬 SQLite/미설정 시 건너뜀).
 *  - P2024(커넥션 풀 타임아웃) 방지: 자식에 넘기는 URL에 connection_limit/pool_timeout/connect_timeout 주입.
 *  - 행(hang) 방지: 자식마다 타임아웃 → 죽이고 다음 진행. 실패 시 1회 재시도.
 *  - 시드 실패해도 exit 0 → 사이트 배포는 계속(비파괴). 실패는 로그로 확인.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const prismaDir = join(root, 'prisma');
const statusFile = join(root, 'public', 'seed-status.json');

// 빌드 로그 대신 라이브(/seed-status.json)로 결과 확인용.
function writeStatus(obj) {
  try {
    mkdirSync(dirname(statusFile), { recursive: true });
    writeFileSync(statusFile, JSON.stringify({ ...obj, at: new Date().toISOString() }, null, 2));
  } catch (e) {
    console.error('상태파일 기록 실패:', e.message);
  }
}

const rawUrl = process.env.DATABASE_URL || '';
if (!/^postgres(ql)?:\/\//i.test(rawUrl)) {
  console.log('ℹ DATABASE_URL이 postgres가 아님 — 콘텐츠 자동시드 건너뜀 (로컬/미설정)');
  writeStatus({ skipped: true, reason: 'DATABASE_URL not postgres' });
  process.exit(0);
}

// P2024 방지: 풀링 파라미터 주입한 URL을 자식 프로세스에 전달.
function pooled(url) {
  try {
    const u = new URL(url);
    if (!u.searchParams.has('connection_limit')) u.searchParams.set('connection_limit', '5');
    if (!u.searchParams.has('pool_timeout')) u.searchParams.set('pool_timeout', '60');
    if (!u.searchParams.has('connect_timeout')) u.searchParams.set('connect_timeout', '30');
    return u.toString();
  } catch {
    return url;
  }
}
const childEnv = { ...process.env, DATABASE_URL: pooled(rawUrl), DATABASE_PROVIDER: 'postgresql' };

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
const CHILD_TIMEOUT = 90000; // 자식 1개 최대 90초

function runOnce(abs) {
  return spawnSync(runner, [...baseArgs, abs], {
    cwd: root, env: childEnv, stdio: 'inherit', timeout: CHILD_TIMEOUT, killSignal: 'SIGKILL',
  });
}

console.log(`▶ 콘텐츠 자동시드 시작 — 대상 ${files.length}개 (풀링 URL 적용)`);
let ok = 0;
const failed = [];
let current = null;
writeStatus({ skipped: false, running: true, ok, total: files.length, failed, current });
for (const f of files) {
  const abs = join(prismaDir, f);
  if (!existsSync(abs)) { console.log(`  - 없음, 건너뜀 ${f}`); continue; }
  current = f;
  writeStatus({ skipped: false, running: true, ok, total: files.length, failed, current }); // 진행 중 기록(상한에 죽어도 어디까지 갔는지 확인)
  let r = runOnce(abs);
  if (r.status !== 0) { console.error(`  ↻ 재시도 ${f}`); r = runOnce(abs); } // 1회 재시도
  if (r.status === 0) ok++;
  else { failed.push(`${f}(${r.error?.code || 'exit ' + r.status})`); console.error(`  ✖ 실패 ${f}`); }
  writeStatus({ skipped: false, running: true, ok, total: files.length, failed, current: f });
}
console.log(`\n✔ 콘텐츠 자동시드 완료 — 성공 ${ok}/${files.length}` + (failed.length ? `, 실패: ${failed.join(', ')}` : ''));
writeStatus({ skipped: false, running: false, ok, total: files.length, failed });
process.exit(0); // 비파괴: 시드 실패해도 배포는 계속

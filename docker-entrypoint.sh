#!/bin/sh
set -e

# 배포 시 DB 스키마 동기화(멱등) 후 서버 기동. (docs/deployment.md)
echo "[entrypoint] DB 스키마 동기화 (prisma db push)…"
npx prisma db push --skip-generate --accept-data-loss || {
  echo "[entrypoint] db push 실패 — DATABASE_URL / DB 상태 확인"; exit 1;
}

# 최초 배포 시 관리자 계정 부트스트랩 (멱등). BOOTSTRAP_ADMIN=true 일 때만.
if [ "$BOOTSTRAP_ADMIN" = "true" ]; then
  echo "[entrypoint] 관리자 부트스트랩…"
  node scripts/bootstrap-admin.mjs || echo "[entrypoint] 관리자 부트스트랩 건너뜀/실패(무시)"
fi

echo "[entrypoint] Next.js 서버 시작 (standalone)"
exec node server.js

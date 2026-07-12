# 배포 & 자동화 (deployment.md)

로컬 개발은 **SQLite**, 프로덕션은 **PostgreSQL**을 권장한다.
DB provider는 `DATABASE_PROVIDER` 환경변수 + `scripts/set-db-provider.mjs` 로 단일 스키마에서 스위치한다(드리프트 없음).

## 자동화 구성 요약
1. **배포 자동화(CI)** — `.github/workflows/ci.yml`: push/PR마다 타입체크·린트·빌드.
2. **콘텐츠 파이프라인 자동화(일일 cron)** — 다음 중 **하나** 선택:
   - Vercel: `vercel.json`의 `crons` (KST 06:00).
   - 플랫폼 무관: `.github/workflows/daily-cron.yml` (배포 URL의 `/api/cron` 호출).
   - 자체 호스팅: `docker-compose.yml`의 `ofelia` 스케줄러 또는 호스트 crontab.
3. 자동 발행 마스터 스위치 `AUTO_PUBLISH_ENABLED`는 **기본 false**. 검증 전 켜지 말 것.

---

## A. Vercel 배포 (권장, 관리형)
1. PostgreSQL 준비: Vercel Postgres / Neon / Supabase 등에서 DB 생성 → 연결 문자열 확보.
2. Vercel 프로젝트 생성 후 **환경변수** 설정:
   - `DATABASE_PROVIDER=postgresql`
   - `DATABASE_URL=postgresql://...`
   - `AUTH_SECRET`(48바이트 랜덤), `SITE_URL`(배포 도메인), `SITE_NAME`
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`(최초 1회용), `OPENAI_API_KEY`(선택)
   - `CRON_SECRET` — 설정하면 Vercel Cron이 `Authorization: Bearer <CRON_SECRET>`로 자동 호출.
   - `AUTO_PUBLISH_ENABLED=false`
3. Build Command는 `vercel.json`에 정의됨(provider 스위치 → generate → db push → build).
4. 최초 배포 후 관리자 계정 생성: 로컬에서 프로덕션 DATABASE_URL로
   `npm run bootstrap:admin` 실행(또는 seed 대신 관리자만 생성).
5. 일일 파이프라인은 `vercel.json` cron이 자동 실행.

> `db push --accept-data-loss`는 초기/추가 스키마 동기화용이다. 운영 성숙 단계에서는
> Postgres용 마이그레이션을 생성해 `prisma migrate deploy`로 교체 권장.

## B. Docker Compose 자체 호스팅 (Postgres + 앱 + cron 내장)
```bash
cp .env.example .env      # 값 채우기 (AUTH_SECRET/CRON_SECRET/비밀번호 필수)
docker compose up -d --build
```
- `app` 컨테이너 기동 시 `docker-entrypoint.sh`가 `prisma db push`로 스키마 동기화,
  `BOOTSTRAP_ADMIN=true`면 관리자 계정 생성.
- `cron`(ofelia) 컨테이너가 매일 KST 06:00에 `/api/cron` 호출(도커 소켓 마운트 필요).
- 헬스체크: `GET /api/health` → `{status:'ok', db:'up'}`.
- 앱: `http://localhost:3000`, 관리자: `/admin/login`.

## C. 일반 Node 서버(standalone)
```bash
DATABASE_PROVIDER=postgresql node scripts/set-db-provider.mjs
npx prisma generate && npx prisma db push
npm run build
node .next/standalone/server.js   # PORT, DATABASE_URL 등 env 필요
```
호스트 crontab 예시(자동화):
```
0 21 * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://도메인/api/cron
```

---

## 필수 환경변수 (프로덕션)
| 변수 | 설명 |
|---|---|
| `DATABASE_PROVIDER` | `postgresql` |
| `DATABASE_URL` | Postgres 연결 문자열 |
| `AUTH_SECRET` | 세션 JWT 서명 키(32바이트+ 랜덤) |
| `SITE_URL` | 배포 도메인(canonical/sitemap/RSS) |
| `CRON_SECRET` | `/api/cron` 보호 토큰 |
| `ADMIN_EMAIL`/`ADMIN_PASSWORD` | 최초 관리자 |
| `OPENAI_API_KEY` | (선택) 이미지 생성 |
| `AUTO_PUBLISH_ENABLED` | 기본 `false` |

## 배포 후 점검
- `GET /api/health` 200 확인
- `GET /sitemap.xml`, `/rss.xml`, `/robots.txt` 정상
- `/admin/login` 로그인 → 대시보드
- cron 수동 검증: `curl -H "Authorization: Bearer $CRON_SECRET" https://도메인/api/cron`
  → 스위치 OFF면 `published:0` 확인
- Search Console에 사이트맵 제출

## 보안 체크
- 모든 시크릿은 플랫폼 환경변수/시크릿으로만(코드/깃 금지).
- `ADMIN_PASSWORD`는 최초 로그인 후 변경, `AUTH_SECRET`·`CRON_SECRET`는 강한 랜덤.
- DB 백업 스케줄(Postgres dump) 구성.

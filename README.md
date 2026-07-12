# 트로트 인포 — 트로트 전문 정보 플랫폼

트로트 가수 프로필·공연 일정·방송·신곡·공식 발표를 **공식 출처 기반**으로 정리하는 Next.js 플랫폼.
설계 문서는 [`docs/`](docs/) 참고(아키텍처·콘텐츠 모델·출처/편집/이미지 정책·자동화·SEO·법적 체크리스트·배포).

## 로컬 실행
```bash
npm install
npm run db:migrate      # 최초 1회 (SQLite)
npm run db:seed         # 데모(SAMPLE) 데이터
npm run dev             # http://localhost:3000
```
관리자: `/admin/login` (`.env`의 `ADMIN_EMAIL` / `ADMIN_PASSWORD`).

## Vercel 공개 배포 (요약)
> 전체 배포 옵션(Docker 포함)은 [docs/deployment.md](docs/deployment.md).

1. **GitHub에 코드 올리기**
   ```bash
   git remote add origin https://github.com/<계정>/<레포>.git
   git branch -M main
   git push -u origin main
   ```
2. **Postgres 생성** (예: Neon) → 연결 문자열 복사. 뒤에 `?sslmode=require` 확인.
3. **Vercel → New Project → 레포 Import.** 빌드 명령은 `vercel.json`이 자동 적용.
4. **환경변수 등록** (아래 표). 시크릿 생성:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"  # AUTH_SECRET
   node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"  # CRON_SECRET
   ```
5. **Deploy** → 배포 도메인 확인 후 `SITE_URL`을 그 도메인으로 설정하고 **재배포**.
6. **관리자 계정 생성** (배포 후 1회):
   ```bash
   curl -X POST -H "Authorization: Bearer <CRON_SECRET>" https://<도메인>/api/bootstrap
   ```
7. **점검**: `/api/health`(→ ok), `/sitemap.xml`, `/robots.txt`, `/admin/login`.

### 필수 환경변수
| 변수 | 값 |
|---|---|
| `DATABASE_PROVIDER` | `postgresql` |
| `DATABASE_URL` | Postgres 연결 문자열 |
| `AUTH_SECRET` | 생성한 랜덤 48바이트 |
| `CRON_SECRET` | 생성한 랜덤 24바이트 |
| `SITE_URL` | `https://<배포 도메인>` |
| `SITE_NAME` | `트로트 인포` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | 관리자 계정(최초 부트스트랩용) |
| `AUTO_PUBLISH_ENABLED` | `false` (검증 전 유지) |
| `OPENAI_API_KEY` | (선택) 이미지 생성 |

## 자동화
- **일일 콘텐츠 파이프라인**: `vercel.json`의 cron이 매일 KST 06:00 `/api/cron` 호출.
  (`CRON_SECRET` 설정 시 Vercel이 인증 헤더 자동 전송.)
- **CI**: `.github/workflows/ci.yml` — push마다 타입체크·린트·빌드.
- 자동 발행은 `AUTO_PUBLISH_ENABLED=true` + 품질 85점 + 위험검사 통과 시에만. 기본 OFF.

## 스택
Next.js 15(App Router) · Prisma(SQLite 로컬 / PostgreSQL 프로덕션) · Tailwind · 커스텀 JWT 인증.

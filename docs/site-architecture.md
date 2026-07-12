# 사이트 아키텍처 (site-architecture.md)

## 1. 목표
트로트 가수의 **기본 정보·주요 활동·발매 음반·방송 출연·공연 일정·최신 소식**을
신뢰 가능한 출처를 바탕으로 한곳에서 확인하는 **트로트 전문 정보 플랫폼**.
연예기사 복제 사이트가 아니라 정리·비교·일정·탐색 편의를 제공하는 1차 정보 허브.

## 2. 기술 스택
| 레이어 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | **Next.js 15 (App Router)** | SSG/ISR/SSR 혼합, JS 실행 전 HTML 렌더(§12), 메타데이터·sitemap·RSS 라우트 내장 |
| 언어 | TypeScript (strict) | 타입 안정성 |
| DB | **SQLite + Prisma** | 로컬 단일 파일, 관계형(가수↔기사↔공연↔음반), Postgres 이전 용이 |
| 스타일 | Tailwind CSS 3 | 반응형/모바일(§12) |
| 인증 | 커스텀(bcrypt + jose JWT httpOnly 쿠키) | 관리자 보호(§16,§22), 외부 의존 최소 |
| 이미지 | OpenAI Images API (fetch) | 배경/일러스트 전용(§11), 키는 env |
| 자동화 | `/api/cron` + 외부 스케줄러/`node-cron` | 매일 최대 5개(§8) |
| 검증 | Zod | 입력값 검증(§22) |

## 3. 렌더링 전략
- **가수 프로필/기사/공연 상세**: 정적 생성 + `revalidate`(ISR). 검색엔진에 완전한 HTML 제공.
- **목록/홈**: SSR 또는 짧은 revalidate로 최신성 확보.
- **관리자(`/admin`)**: 동적 SSR + 인증 미들웨어. `noindex`.
- 클라이언트 컴포넌트는 검색/필터 상호작용 등 최소 범위에만 사용.

## 4. 디렉토리 구조
```
prisma/                 스키마 + seed(SAMPLE 데이터)
src/
  app/                  라우트 (App Router)
    (public)            홈/가수/뉴스/공연/방송/음악/주간
    admin/              관리자 (인증 보호)
    api/                로그인/정정요청/cron
    sitemap*.ts robots.ts rss.xml/route.ts
  components/           Header/Footer/Search/Card/JsonLd/Breadcrumbs ...
  lib/                  db, seo, structured-data, sources, quality-score,
                        image, automation, auth, enums, json
docs/                   설계 문서 9종
```

## 5. 배포 방식
- 로컬: `npm run dev` (SQLite 파일 DB).
- 운영 후보: Vercel(ISR/Cron 내장) 또는 Node 서버 + PM2.
- 운영 시 `DATABASE_URL`을 Postgres로 교체, `AUTH_SECRET`/`OPENAI_API_KEY`/`CRON_SECRET`는 배포 플랫폼 시크릿으로.

## 6. 데이터 흐름
공식 출처 → (수동 등록 or 자동 수집) → Prisma DB(draft) → 검증/품질검사 →
published → 페이지 정적 생성 → sitemap/RSS 갱신 → 검색엔진 색인.

## 7. 비기능 요구
- 모바일 우선 반응형, 접근성(alt/heading/landmark).
- 보안: env 시크릿, 비밀번호 해시, CSRF(SameSite), XSS(리치텍스트 정제), rate limit, cron 중복 방지.
- 관측: AutomationLog / AdminActivityLog / RevisionLog.

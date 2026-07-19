# 검색엔진 색인 등록 & 키워드 전략 (seo-search-console.md)

목표: 구글·네이버·다음에 사이트와 sitemap이 모두 색인되도록 등록하고, 트로트 관련 검색어에 노출되게 한다.

## A. 코드로 이미 적용된 기술 SEO
- 모든 페이지: 고유 title/description/canonical, **keywords 메타**(전역+페이지별), OG/트위터 카드, 기본 OG 이미지(무대 이미지)
- 구조화 데이터: Organization·WebSite(SearchAction)·ProfilePage/Person·NewsArticle·Event·MusicAlbum·BreadcrumbList
- `robots.txt`: 전체/Googlebot/**Yeti(네이버)**/Daumoa/Bingbot 허용, `/admin·/api·/search` 차단, sitemap 명시
- **사이트맵 인덱스** `/sitemap.xml` + 분할(static·artists·news·events·music), **RSS** `/rss.xml`
- 검색엔진 소유확인 메타: `GOOGLE_SITE_VERIFICATION`·`NAVER_SITE_VERIFICATION` env로 자동 삽입

## B. 사용자가 등록할 것 (각 5분, 무료)

### 1) 구글 서치콘솔 (search.google.com/search-console)
1. **속성 추가 → URL 접두어** → `https://trotpick.kr` 입력
2. 소유 확인: **HTML 태그** 방식 선택 → `content="..."` 값 복사
3. Vercel → 환경변수에 `GOOGLE_SITE_VERIFICATION` = 그 값 → **재배포**
4. 서치콘솔에서 **확인** 클릭
5. 좌측 **Sitemaps** → `sitemap.xml` 제출
6. (선택) 주요 URL은 **URL 검사 → 색인 생성 요청**

### 2) 네이버 서치어드바이저 (searchadvisor.naver.com)
1. **웹마스터도구 → 사이트 등록** → `https://trotpick.kr`
2. 소유 확인: **HTML 태그** 방식 → `content` 값 복사
3. Vercel 환경변수에 `NAVER_SITE_VERIFICATION` = 그 값 → **재배포** → **확인**
4. **요청 → 사이트맵 제출** → `sitemap.xml`
5. **요청 → RSS 제출** → `rss.xml`
6. (선택) **웹페이지 수집** 요청으로 주요 URL 우선 수집

### 3) 다음(카카오)
네이버 Yeti/robots 허용으로 대부분 수집되나, 필요 시 다음 검색등록 페이지에서 사이트 등록.

## C. 키워드 전략 (콘텐츠에 이미 반영)

### 핵심(허브) 키워드
트로트 · 트로트 가수 · 트로트 공연 · 트로트 콘서트 · 트로트 방송 · 트로트 신곡 ·
미스터트롯 · 미스트롯 · 현역가왕 · 불타는 트롯맨 · 트로트 오디션

### 인물 키워드 (가수별 자동 생성)
`{가수명}` · `{가수명} 프로필` · `{가수명} 대표곡` · `{가수명} 공연` · `{가수명} 노래`
→ 예: 임영웅 프로필, 송가인 노래, 영탁 공연 …

### 롱테일(정보성) 키워드 — 심층 기사가 타깃
- 트로트 역사 / 트로트란 무엇인가
- 미스터트롯 우승자·TOP7 / 미스트롯 진 선 미
- 트로트 오디션 프로그램 총정리 / 현역가왕 우승자
- 트로트 레전드 / 4대 천왕
- 지역별 트로트 공연 (서울·부산·대구…)

### 일정성 키워드 — 공연/방송 페이지가 타깃
- {가수명} 콘서트 2026 / {지역} 트로트 공연 / 트로트 공연 예매

## D. 색인 확인 방법
- 구글: 검색창에 `site:trotpick.kr` → 색인된 페이지 수 확인
- 네이버: 서치어드바이저 → 수집/색인 현황
- 색인은 등록 후 며칠~수 주 걸릴 수 있음. sitemap 제출과 내부링크가 속도를 높인다.

## E. 지속 관리
- 새 콘텐츠 발행 시 sitemap·RSS 자동 갱신(revalidate) → 재제출 불필요
- 서치콘솔의 '색인 생성 범위' 리포트에서 오류/제외 페이지 주기적 점검
- 검색 성과(노출·클릭) 데이터로 제목·설명 개선

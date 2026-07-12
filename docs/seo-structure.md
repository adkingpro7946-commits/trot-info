# SEO 구조 (seo-structure.md, §12·§13·§14·§19)

## 렌더링
모든 페이지가 JS 실행 전에도 핵심 본문·링크 포함(SSG/SSR 우선).

## URL 구조 (§3)
```
/artists/                          가수 목록
/artists/{slug}/                   프로필
/artists/{slug}/timeline/          활동 연대기
/artists/{slug}/discography/       음반
/artists/{slug}/events/            공연
/news/{slug}/                      기사
/news/                             기사 목록
/events/  /events/{slug}/          공연 목록/상세
/events/region/{region}/          지역별 공연
/broadcasts/                       방송 일정
/programs/{slug}/                  프로그램
/music/{slug}/                     앨범/신곡
/weekly/{year-week}/               주간 정리
```
- 무분별한 태그/필터 URL 생성 금지. 검색 가치 없는 페이지는 `noindex`.
- 기존 공개 URL 변경 시 **301 리디렉션**.

## 페이지별 메타 (§12)
고유 title / meta description / 단일 H1 / canonical / OG / Twitter Card /
Breadcrumb / 의미 있는 alt / 표준 `<a href>` 내부 링크 /
게시일·수정일·마지막 사실 확인일·작성자·출처·관련 콘텐츠.

## 구조화 데이터 (§12) — 화면 표시 내용과 정확히 일치
- 가수: `ProfilePage` + `Person`
- 기사: `NewsArticle` / `Article`, 일반 블로그: `BlogPosting`
- 공연: `Event`
- 음반/곡: `MusicAlbum` / `MusicRecording`
- 사이트: `Organization` + `WebSite` + `SearchAction`
- 경로: `BreadcrumbList`
- 검색 노출 보장 문구 사용 금지.

## 제목 생성 (§13)
페이지당 검색 의도 1개. 동일 키워드 반복 금지.
연도는 연도 중요한 일정/방송/공연 글에만.

## 내부 링크 (§14)
가수 기사 → 프로필/대표곡/음반/방송/공연/최신소식.
공연 기사 → 출연가수/공연장/지역별/같은 달.
방송 기사 → 프로그램/출연가수/방송일정/회차.
관련성 명확할 때만 연결. 무차별 링크 금지. 고아 페이지 자동 탐지.

## 색인/사이트맵 (§17·§19)
- 필터 조합 무한 URL 기본 `noindex`. 고유 설명 있는 지역·월별만 index.
- 사이트맵: 공개+canonical+index+200+본문충분 페이지만.
  `sitemap.xml`(인덱스) + artists/news/events/music 분할, `rss.xml`, news RSS, `robots.txt`.
- 발행/주요 수정 시 자동 갱신.

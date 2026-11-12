// 사이트맵 항목 수집 (§19) — 공개 + index=true + 본문 존재 페이지만
import { prisma, safe } from './db';
import { abs, SITE_URL } from './seo';
import { GUIDES } from '@/content/guides';
import { INDEXED_ARTIST_SLUGS } from '@/content/artist-notes';
import { NOINDEX_NEWS_SLUGS } from '@/content/noindex';

export interface UrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

const iso = (d?: Date | null) => (d ? d.toISOString() : undefined);

export async function staticUrls(): Promise<UrlEntry[]> {
  // 2026-10-14: 지역별 공연·프로그램 상세는 본문이 얇아 noindex 처리 → 사이트맵에서 제외.
  // 대신 정적 편집 가이드(DB 미사용)를 포함한다.
  return [
    { loc: abs('/'), changefreq: 'daily', priority: 1 },
    { loc: abs('/starter-course'), changefreq: 'monthly', priority: 0.9 },
    { loc: abs('/guides'), changefreq: 'weekly', priority: 0.9 },
    ...GUIDES.map((g) => ({
      loc: abs(`/guides/${g.slug}`),
      lastmod: new Date(`${g.updatedAt ?? g.publishedAt}T00:00:00+09:00`).toISOString(),
      changefreq: 'monthly',
      priority: 0.8,
    })),
    { loc: abs('/artists'), changefreq: 'weekly', priority: 0.8 },
    { loc: abs('/news'), changefreq: 'weekly', priority: 0.7 },
    { loc: abs('/events'), changefreq: 'weekly', priority: 0.6 },
    { loc: abs('/broadcasts'), changefreq: 'weekly', priority: 0.5 },
    { loc: abs('/music'), changefreq: 'monthly', priority: 0.5 },
    { loc: abs('/about'), changefreq: 'monthly', priority: 0.4 },
    { loc: abs('/editorial-log'), changefreq: 'monthly', priority: 0.5 },
    { loc: abs('/contact'), changefreq: 'yearly', priority: 0.3 },
    { loc: abs('/privacy'), changefreq: 'yearly', priority: 0.2 },
    { loc: abs('/terms'), changefreq: 'yearly', priority: 0.2 },
  ];
}

export async function artistUrls(): Promise<UrlEntry[]> {
  const artists = await safe(prisma.artist.findMany({ where: { status: 'published' }, select: { slug: true, updatedAt: true } }), []);
  // 신규 도메인 크롤 예산 집중을 위해 사이트맵에는 알짜 '프로필' 페이지만 포함한다.
  // 하위페이지(타임라인·음반·공연)는 프로필에서 내부링크로 연결돼 크롤 가능(고아 아님)하므로
  // 본문이 겹치는 얇은 페이지를 사이트맵에서 제외해 색인 우선순위를 높인다.
  // 2026-10-14: 편집부 해설이 붙은 심층 프로필만 사이트맵에 포함(나머지는 noindex).
  return artists.filter((a) => INDEXED_ARTIST_SLUGS.has(a.slug)).map((a) => ({
    loc: abs(`/artists/${a.slug}`), lastmod: iso(a.updatedAt), changefreq: 'weekly', priority: 0.7,
  }));
}

// 사이트맵 인덱스용 — 섹션별 최신 수정일(max)로 lastmod를 채워 변경 섹션 우선 재크롤 유도
// 2026-10-14: 공연·음반 상세는 noindex 처리해 인덱스에서 제외(라우트는 빈 urlset 반환).
export async function sitemapIndexEntries(): Promise<{ loc: string; lastmod?: string }[]> {
  const [artist, article] = await Promise.all([
    safe(prisma.artist.aggregate({ where: { status: 'published' }, _max: { updatedAt: true } }), { _max: { updatedAt: null } }),
    safe(prisma.article.aggregate({ where: { status: 'published', index: true }, _max: { updatedAt: true } }), { _max: { updatedAt: null } }),
  ]);
  const guideNewest = GUIDES.map((g) => new Date(`${g.updatedAt ?? g.publishedAt}T00:00:00+09:00`).getTime());
  const staticNewest = guideNewest.length ? new Date(Math.max(...guideNewest)) : null;
  return [
    { loc: '/sitemap-static.xml', lastmod: iso(staticNewest) },
    { loc: '/sitemap-artists.xml', lastmod: iso(artist._max.updatedAt) },
    { loc: '/sitemap-news.xml', lastmod: iso(article._max.updatedAt) },
  ];
}

export async function newsUrls(): Promise<UrlEntry[]> {
  const arts = await safe(prisma.article.findMany({
    where: { status: 'published', index: true },
    select: { slug: true, updatedAt: true },
  }), []);
  return arts.filter((a) => !NOINDEX_NEWS_SLUGS.has(a.slug)).map((a) => ({ loc: abs(`/news/${a.slug}`), lastmod: iso(a.updatedAt), changefreq: 'weekly', priority: 0.6 }));
}

// 공연·음반 상세는 noindex(템플릿형·얇은 본문) → 사이트맵에 넣지 않는다. DB 조회도 하지 않음.
export async function eventUrls(): Promise<UrlEntry[]> {
  return [];
}

export async function musicUrls(): Promise<UrlEntry[]> {
  return [];
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function renderUrlset(entries: UrlEntry[]): string {
  const body = entries
    .map((e) => {
      const parts = [`<loc>${esc(e.loc)}</loc>`];
      if (e.lastmod) parts.push(`<lastmod>${e.lastmod}</lastmod>`);
      if (e.changefreq) parts.push(`<changefreq>${e.changefreq}</changefreq>`);
      if (e.priority !== undefined) parts.push(`<priority>${e.priority}</priority>`);
      return `<url>${parts.join('')}</url>`;
    })
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

export function renderSitemapIndex(files: (string | { loc: string; lastmod?: string })[]): string {
  const body = files
    .map((f) => {
      const item = typeof f === 'string' ? { loc: f } : f;
      const lm = item.lastmod ? `<lastmod>${item.lastmod}</lastmod>` : '';
      return `<sitemap><loc>${esc(SITE_URL + item.loc)}</loc>${lm}</sitemap>`;
    })
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`;
}

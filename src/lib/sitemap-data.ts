// 사이트맵 항목 수집 (§19) — 공개 + index=true + 본문 존재 페이지만
import { prisma, safe } from './db';
import { abs, SITE_URL } from './seo';
import { REGIONS } from './enums';

export interface UrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

const iso = (d?: Date | null) => (d ? d.toISOString() : undefined);

export async function staticUrls(): Promise<UrlEntry[]> {
  // 프로그램 상세는 고아 페이지가 되지 않도록 사이트맵에 포함 (§14 고아 페이지 방지)
  const programs = await safe(
    prisma.program.findMany({ where: { status: 'published' }, select: { slug: true, updatedAt: true } }),
    [],
  );
  return [
    { loc: abs('/'), changefreq: 'daily', priority: 1 },
    { loc: abs('/artists'), changefreq: 'weekly', priority: 0.8 },
    { loc: abs('/news'), changefreq: 'daily', priority: 0.8 },
    { loc: abs('/events'), changefreq: 'daily', priority: 0.8 },
    { loc: abs('/broadcasts'), changefreq: 'daily', priority: 0.6 },
    { loc: abs('/music'), changefreq: 'weekly', priority: 0.6 },
    { loc: abs('/about'), changefreq: 'monthly', priority: 0.3 },
    { loc: abs('/privacy'), changefreq: 'yearly', priority: 0.2 },
    // 고유 설명이 있는 지역 페이지만 색인 (§17)
    ...REGIONS.filter((r) => r.slug !== 'other').map((r) => ({
      loc: abs(`/events/region/${r.slug}`), changefreq: 'weekly', priority: 0.5,
    })),
    ...programs.map((p) => ({
      loc: abs(`/programs/${p.slug}`), lastmod: iso(p.updatedAt), changefreq: 'weekly', priority: 0.5,
    })),
  ];
}

export async function artistUrls(): Promise<UrlEntry[]> {
  const artists = await safe(prisma.artist.findMany({ where: { status: 'published' }, select: { slug: true, updatedAt: true } }), []);
  return artists.flatMap((a) => {
    const lastmod = iso(a.updatedAt);
    return [
      { loc: abs(`/artists/${a.slug}`), lastmod, changefreq: 'weekly', priority: 0.7 },
      { loc: abs(`/artists/${a.slug}/timeline`), lastmod, changefreq: 'monthly', priority: 0.4 },
      { loc: abs(`/artists/${a.slug}/discography`), lastmod, changefreq: 'monthly', priority: 0.4 },
      { loc: abs(`/artists/${a.slug}/events`), lastmod, changefreq: 'weekly', priority: 0.4 },
    ];
  });
}

// 사이트맵 인덱스용 — 섹션별 최신 수정일(max)로 lastmod를 채워 변경 섹션 우선 재크롤 유도
export async function sitemapIndexEntries(): Promise<{ loc: string; lastmod?: string }[]> {
  const [artist, article, event, music] = await Promise.all([
    safe(prisma.artist.aggregate({ where: { status: 'published' }, _max: { updatedAt: true } }), { _max: { updatedAt: null } }),
    safe(prisma.article.aggregate({ where: { status: 'published', index: true }, _max: { updatedAt: true } }), { _max: { updatedAt: null } }),
    safe(prisma.event.aggregate({ where: { status: 'published' }, _max: { lastUpdatedAt: true } }), { _max: { lastUpdatedAt: null } }),
    safe(prisma.music.aggregate({ where: { status: 'published' }, _max: { updatedAt: true } }), { _max: { updatedAt: null } }),
  ]);
  const dates = [artist._max.updatedAt, article._max.updatedAt, event._max.lastUpdatedAt, music._max.updatedAt].filter(Boolean) as Date[];
  const newest = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;
  return [
    { loc: '/sitemap-static.xml', lastmod: iso(newest) },
    { loc: '/sitemap-artists.xml', lastmod: iso(artist._max.updatedAt) },
    { loc: '/sitemap-news.xml', lastmod: iso(article._max.updatedAt) },
    { loc: '/sitemap-events.xml', lastmod: iso(event._max.lastUpdatedAt) },
    { loc: '/sitemap-music.xml', lastmod: iso(music._max.updatedAt) },
  ];
}

export async function newsUrls(): Promise<UrlEntry[]> {
  const arts = await safe(prisma.article.findMany({
    where: { status: 'published', index: true },
    select: { slug: true, updatedAt: true },
  }), []);
  return arts.map((a) => ({ loc: abs(`/news/${a.slug}`), lastmod: iso(a.updatedAt), changefreq: 'weekly', priority: 0.6 }));
}

export async function eventUrls(): Promise<UrlEntry[]> {
  const evs = await safe(prisma.event.findMany({ where: { status: 'published' }, select: { slug: true, lastUpdatedAt: true } }), []);
  return evs.map((e) => ({ loc: abs(`/events/${e.slug}`), lastmod: iso(e.lastUpdatedAt), changefreq: 'daily', priority: 0.6 }));
}

export async function musicUrls(): Promise<UrlEntry[]> {
  const ms = await safe(prisma.music.findMany({ where: { status: 'published' }, select: { slug: true, updatedAt: true } }), []);
  return ms.map((m) => ({ loc: abs(`/music/${m.slug}`), lastmod: iso(m.updatedAt), changefreq: 'monthly', priority: 0.5 }));
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

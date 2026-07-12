import { prisma } from '@/lib/db';
import { SITE_NAME, SITE_URL, abs } from '@/lib/seo';

export const runtime = 'nodejs';
export const revalidate = 1800;

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 최신 소식 RSS (§19). 발행/주요 수정 시 revalidate로 갱신.
export async function GET() {
  const items = await prisma.article.findMany({
    where: { status: 'published', index: true },
    orderBy: { publishedAt: 'desc' },
    take: 30,
    select: { slug: true, title: true, description: true, publishedAt: true },
  });

  const body = items
    .map((a) => {
      const link = abs(`/news/${a.slug}`);
      return `<item><title>${esc(a.title)}</title><link>${link}</link><guid isPermaLink="true">${link}</guid>` +
        `<description>${esc(a.description)}</description>` +
        (a.publishedAt ? `<pubDate>${a.publishedAt.toUTCString()}</pubDate>` : '') +
        `</item>`;
    })
    .join('');

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>` +
    `<title>${esc(SITE_NAME)} 최신 소식</title><link>${SITE_URL}</link>` +
    `<description>트로트 가수·공연·방송·신곡 최신 소식</description><language>ko</language>` +
    body +
    `</channel></rss>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}

import { renderSitemapIndex } from '@/lib/sitemap-data';

export const runtime = 'nodejs';
export const revalidate = 3600;

// 사이트맵 인덱스 (§19)
export async function GET() {
  const xml = renderSitemapIndex([
    '/sitemap-static.xml',
    '/sitemap-artists.xml',
    '/sitemap-news.xml',
    '/sitemap-events.xml',
    '/sitemap-music.xml',
  ]);
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}

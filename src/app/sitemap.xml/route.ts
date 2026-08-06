import { renderSitemapIndex, sitemapIndexEntries } from '@/lib/sitemap-data';

export const runtime = 'nodejs';
export const revalidate = 3600;

// 사이트맵 인덱스 (§19) — 섹션별 lastmod 포함
export async function GET() {
  const xml = renderSitemapIndex(await sitemapIndexEntries());
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}

import { renderUrlset, newsUrls } from '@/lib/sitemap-data';

export const runtime = 'nodejs';
export const revalidate = 1800;

export async function GET() {
  const xml = renderUrlset(await newsUrls());
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}

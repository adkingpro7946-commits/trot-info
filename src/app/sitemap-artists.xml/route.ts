import { renderUrlset, artistUrls } from '@/lib/sitemap-data';

export const runtime = 'nodejs';
export const revalidate = 3600;

export async function GET() {
  const xml = renderUrlset(await artistUrls());
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}

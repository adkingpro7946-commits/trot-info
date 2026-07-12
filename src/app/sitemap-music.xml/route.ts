import { renderUrlset, musicUrls } from '@/lib/sitemap-data';

export const runtime = 'nodejs';
export const revalidate = 3600;

export async function GET() {
  const xml = renderUrlset(await musicUrls());
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}

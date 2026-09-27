import { renderUrlset, eventUrls } from '@/lib/sitemap-data';

export const runtime = 'nodejs';
export const revalidate = 43200;

export async function GET() {
  const xml = renderUrlset(await eventUrls());
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SampleBadge } from '@/components/badges';
import { EventCard } from '@/components/cards';

export const revalidate = 600;

async function get(slug: string) {
  return prisma.artist.findFirst({
    where: { slug, status: 'published' },
    include: { events: { where: { status: 'published' }, orderBy: { startDateTime: 'asc' }, include: { artists: { select: { stageName: true } } } } },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await get(slug);
  if (!a) return { title: '가수를 찾을 수 없음' };
  return buildMetadata({
    title: `${a.stageName} 공연·행사 일정`,
    description: `${a.stageName}의 공연·행사 일정을 공식 출처 기반으로 정리했습니다. 일정은 변경될 수 있습니다.`,
    path: `/artists/${a.slug}/events`,
  });
}

export default async function ArtistEventsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await get(slug);
  if (!a) notFound();
  return (
    <div>
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '가수', path: '/artists' }, { name: a.stageName, path: `/artists/${a.slug}` }, { name: '공연', path: `/artists/${a.slug}/events` }]} />
      <h1 className="flex items-center gap-2 text-2xl font-extrabold text-ink-900">{a.stageName} 공연 일정 {a.isSample && <SampleBadge />}</h1>
      {a.events.length ? (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {a.events.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      ) : <p className="mt-6 text-sm text-slate-500">등록된 공연이 없습니다.</p>}
    </div>
  );
}

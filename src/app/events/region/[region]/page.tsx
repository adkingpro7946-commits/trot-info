import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EventCard } from '@/components/cards';
import { REGIONS, regionLabel } from '@/lib/enums';

export const revalidate = 300;

export async function generateStaticParams() {
  return REGIONS.filter((r) => r.slug !== 'other').map((r) => ({ region: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }): Promise<Metadata> {
  const { region } = await params;
  const label = regionLabel(region);
  if (!REGIONS.some((r) => r.slug === region)) return { title: '지역을 찾을 수 없음' };
  return buildMetadata({
    // 고유 설명 있는 지역 페이지만 index (§17)
    title: `${label} 트로트 공연 일정 정리`,
    description: `${label} 지역에서 열리는 트로트 콘서트·행사 일정을 공식 출처 기반으로 정리했습니다.`,
    path: `/events/region/${region}`,
  });
}

export default async function RegionEventsPage({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  if (!REGIONS.some((r) => r.slug === region)) notFound();
  const label = regionLabel(region);

  const events = await prisma.event.findMany({
    where: { status: 'published', region },
    include: { artists: { select: { stageName: true } } },
    orderBy: { startDateTime: 'asc' },
  });

  return (
    <div>
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '공연 일정', path: '/events' }, { name: label, path: `/events/region/${region}` }]} />
      <h1 className="text-2xl font-extrabold text-ink-900">{label} 트로트 공연 일정</h1>
      <p className="mt-1 text-sm text-ink-700">{label} 지역의 공연·행사를 정리했습니다. 일정은 변경될 수 있습니다.</p>
      {events.length ? (
        <div className="mt-6 grid gap-3 md:grid-cols-2">{events.map((e) => <EventCard key={e.id} event={e} />)}</div>
      ) : <p className="mt-6 text-sm text-slate-500">{label} 지역에 등록된 공연이 없습니다.</p>}
    </div>
  );
}

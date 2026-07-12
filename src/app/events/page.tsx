import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EventCard } from '@/components/cards';
import { REGIONS } from '@/lib/enums';

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: '트로트 공연·행사 일정',
  description: '트로트 콘서트·페스티벌·공개방송 등 공연 일정을 지역·날짜별로 확인하세요. 일정은 변경될 수 있습니다.',
  path: '/events',
});

export default async function EventsPage() {
  const now = new Date();
  const events = await prisma.event.findMany({
    where: { status: 'published' },
    include: { artists: { select: { stageName: true } } },
    orderBy: { startDateTime: 'asc' },
  });
  const upcoming = events.filter((e) => e.startDateTime >= now && !['cancelled', 'completed'].includes(e.eventStatus));
  const others = events.filter((e) => !upcoming.includes(e));

  return (
    <div>
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '공연 일정', path: '/events' }]} />
      <h1 className="text-2xl font-extrabold text-ink-900">트로트 공연·행사 일정</h1>
      <p className="mt-1 text-sm text-ink-700">공식 출처 기반 정리입니다. 가격·잔여 좌석은 실시간이 아닐 수 있으며 일정은 변경될 수 있습니다.</p>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {REGIONS.filter((r) => r.slug !== 'other').map((r) => (
          <Link key={r.slug} href={`/events/region/${r.slug}`} className="rounded-full bg-slate-100 px-3 py-1 text-ink-700 hover:bg-brand-50">{r.label}</Link>
        ))}
      </div>

      <h2 className="mt-8 text-lg font-bold text-ink-900">다가오는 일정</h2>
      {upcoming.length ? (
        <div className="mt-3 grid gap-3 md:grid-cols-2">{upcoming.map((e) => <EventCard key={e.id} event={e} />)}</div>
      ) : <p className="mt-3 text-sm text-slate-500">다가오는 공개 일정이 없습니다.</p>}

      {others.length > 0 && (
        <>
          <h2 className="mt-10 text-lg font-bold text-ink-900">지난·취소·연기 일정</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">{others.map((e) => <EventCard key={e.id} event={e} />)}</div>
        </>
      )}
    </div>
  );
}

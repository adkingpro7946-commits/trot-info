import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EventCard, ArticleCard } from '@/components/cards';
import { parseYearWeek, weekRange } from '@/lib/week';
import { formatDate } from '@/lib/format';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ yw: string }> }): Promise<Metadata> {
  const { yw } = await params;
  const parsed = parseYearWeek(yw);
  if (!parsed) return { title: '주간 정리를 찾을 수 없음' };
  const { start, end } = weekRange(parsed.year, parsed.week);
  return buildMetadata({
    title: `${parsed.year}년 ${parsed.week}주차 트로트 일정 정리`,
    description: `${formatDate(start)} ~ ${formatDate(new Date(end.getTime() - 86400000))} 트로트 공연·방송·신곡 일정을 한 주 단위로 정리했습니다.`,
    path: `/weekly/${yw}`,
  });
}

export default async function WeeklyPage({ params }: { params: Promise<{ yw: string }> }) {
  const { yw } = await params;
  const parsed = parseYearWeek(yw);
  if (!parsed) notFound();
  const { start, end } = weekRange(parsed.year, parsed.week);

  const [events, articles] = await Promise.all([
    prisma.event.findMany({
      where: { status: 'published', startDateTime: { gte: start, lt: end } },
      include: { artists: { select: { stageName: true } } },
      orderBy: { startDateTime: 'asc' },
    }),
    prisma.article.findMany({
      where: { status: 'published', publishedAt: { gte: start, lt: end } },
      orderBy: { publishedAt: 'desc' },
    }),
  ]);

  return (
    <div>
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '주간 정리', path: '/weekly' }, { name: `${parsed.year} ${parsed.week}주차`, path: `/weekly/${yw}` }]} />
      <h1 className="text-2xl font-extrabold text-ink-900">{parsed.year}년 {parsed.week}주차 트로트 일정</h1>
      <p className="mt-1 text-sm text-slate-500">{formatDate(start)} ~ {formatDate(new Date(end.getTime() - 86400000))}</p>

      <h2 className="mt-8 text-lg font-bold text-ink-900">이번 주 공연·방송</h2>
      {events.length ? (
        <div className="mt-3 grid gap-3 md:grid-cols-2">{events.map((e) => <EventCard key={e.id} event={e} />)}</div>
      ) : <p className="mt-3 text-sm text-slate-500">이 주에 등록된 공개 일정이 없습니다.</p>}

      {articles.length > 0 && (
        <>
          <h2 className="mt-10 text-lg font-bold text-ink-900">이번 주 소식</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">{articles.map((a) => <ArticleCard key={a.id} article={a} />)}</div>
        </>
      )}
    </div>
  );
}

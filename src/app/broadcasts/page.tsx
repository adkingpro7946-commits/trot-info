import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma, safe } from '@/lib/db';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EventCard, ArticleCard } from '@/components/cards';

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: '트로트 방송 일정 · 출연·편성 정리',
  description: '트로트 가수의 방송 출연·공개방송 일정과 프로그램 정보를 정리했습니다.',
  path: '/broadcasts',
});

export default async function BroadcastsPage() {
  const now = new Date();
  const [recordings, programs, broadcastArticles] = await Promise.all([
    safe(prisma.event.findMany({
      where: { status: 'published', eventType: 'broadcast_recording', startDateTime: { gte: now } },
      include: { artists: { select: { stageName: true } } },
      orderBy: { startDateTime: 'asc' },
    }), []),
    safe(prisma.program.findMany({ where: { status: 'published' }, orderBy: { name: 'asc' } }), []),
    safe(prisma.article.findMany({ where: { status: 'published', type: 'broadcast' }, orderBy: { publishedAt: 'desc' }, take: 6 }), []),
  ]);

  return (
    <div>
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '방송 일정', path: '/broadcasts' }]} />
      <h1 className="text-2xl font-extrabold text-ink-900">트로트 방송 일정</h1>

      <h2 className="mt-8 text-lg font-bold text-ink-900">공개방송·녹화 일정</h2>
      {recordings.length ? (
        <div className="mt-3 grid gap-3 md:grid-cols-2">{recordings.map((e) => <EventCard key={e.id} event={e} />)}</div>
      ) : <p className="mt-3 text-sm text-slate-500">등록된 공개방송 일정이 없습니다.</p>}

      {programs.length > 0 && (
        <>
          <h2 className="mt-10 text-lg font-bold text-ink-900">프로그램</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {programs.map((p) => <Link key={p.id} href={`/programs/${p.slug}`} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-ink-700 hover:bg-brand-50">{p.name}</Link>)}
          </div>
        </>
      )}

      {broadcastArticles.length > 0 && (
        <>
          <h2 className="mt-10 text-lg font-bold text-ink-900">방송 출연 소식</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">{broadcastArticles.map((a) => <ArticleCard key={a.id} article={a} />)}</div>
        </>
      )}
    </div>
  );
}

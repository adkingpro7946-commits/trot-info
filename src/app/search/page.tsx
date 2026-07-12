import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SearchBox } from '@/components/SearchBox';
import { ArtistCard, ArticleCard, EventCard } from '@/components/cards';

export const dynamic = 'force-dynamic';

// 검색 결과 페이지는 noindex (§17)
export const metadata: Metadata = buildMetadata({
  title: '검색',
  description: '트로트 가수·공연·방송·신곡 검색',
  path: '/search',
  index: false,
});

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();

  const [artists, articles, events] = query
    ? await Promise.all([
        prisma.artist.findMany({
          where: { status: 'published', OR: [{ stageName: { contains: query } }, { profileSummary: { contains: query } }] },
          take: 10,
        }),
        prisma.article.findMany({
          where: { status: 'published', OR: [{ title: { contains: query } }, { description: { contains: query } }] },
          orderBy: { publishedAt: 'desc' },
          take: 10,
        }),
        prisma.event.findMany({
          where: { status: 'published', OR: [{ eventName: { contains: query } }, { venue: { contains: query } }] },
          include: { artists: { select: { stageName: true } } },
          orderBy: { startDateTime: 'asc' },
          take: 10,
        }),
      ])
    : [[], [], []];

  const total = artists.length + articles.length + events.length;

  return (
    <div>
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '검색', path: '/search' }]} />
      <h1 className="text-2xl font-extrabold text-ink-900">검색</h1>
      <div className="mt-4 max-w-content"><SearchBox size="lg" /></div>

      {query && (
        <p className="mt-4 text-sm text-slate-500">“{query}” 검색 결과 {total}건</p>
      )}

      {artists.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-bold text-ink-900">가수</h2>
          <div className="mt-2 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{artists.map((a) => <ArtistCard key={a.id} artist={a} />)}</div>
        </section>
      )}
      {articles.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-bold text-ink-900">소식</h2>
          <div className="mt-2 grid gap-3 md:grid-cols-2">{articles.map((a) => <ArticleCard key={a.id} article={a} />)}</div>
        </section>
      )}
      {events.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-bold text-ink-900">공연</h2>
          <div className="mt-2 grid gap-3 md:grid-cols-2">{events.map((e) => <EventCard key={e.id} event={e} />)}</div>
        </section>
      )}

      {query && total === 0 && (
        <p className="mt-6 text-sm text-slate-500">검색 결과가 없습니다. 다른 검색어를 입력해보세요.</p>
      )}
      {!query && (
        <p className="mt-6 text-sm text-slate-500">
          가수, 공연, 방송, 노래 이름을 검색해보세요. 예: <Link href="/search?q=콘서트" className="text-brand-600 underline">콘서트</Link>
        </p>
      )}
    </div>
  );
}

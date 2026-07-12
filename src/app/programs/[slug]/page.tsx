import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SampleBadge } from '@/components/badges';
import { ArticleCard } from '@/components/cards';

export const revalidate = 600;

async function get(slug: string) {
  return prisma.program.findFirst({
    where: { slug, status: 'published' },
    include: {
      artists: { where: { status: 'published' } },
      articles: { where: { status: 'published' }, orderBy: { publishedAt: 'desc' }, take: 6 },
    },
  });
}

export async function generateStaticParams() {
  const ps = await prisma.program.findMany({ where: { status: 'published' }, select: { slug: true } });
  return ps.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await get(slug);
  if (!p) return { title: '프로그램을 찾을 수 없음' };
  return buildMetadata({
    title: `${p.name} 출연진·방송 정보`,
    description: p.description ?? `${p.name} 출연진과 방송 정보를 정리했습니다.`,
    path: `/programs/${p.slug}`,
  });
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await get(slug);
  if (!p) notFound();
  return (
    <div>
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '방송 일정', path: '/broadcasts' }, { name: p.name, path: `/programs/${p.slug}` }]} />
      <div className="flex items-center gap-2"><h1 className="text-2xl font-extrabold text-ink-900">{p.name}</h1>{p.isSample && <SampleBadge />}</div>
      <p className="mt-1 text-sm text-slate-500">{p.broadcaster}{p.airInfo ? ` · ${p.airInfo}` : ''}</p>
      {p.description && <p className="mt-4 text-ink-800">{p.description}</p>}
      {p.artists.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-ink-900">출연 가수</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {p.artists.map((a) => <Link key={a.id} href={`/artists/${a.slug}`} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-ink-700 hover:bg-brand-50">{a.stageName}</Link>)}
          </div>
        </section>
      )}
      {p.articles.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-ink-900">관련 소식</h2>
          <div className="mt-2 grid gap-3 md:grid-cols-2">{p.articles.map((a) => <ArticleCard key={a.id} article={a} />)}</div>
        </section>
      )}
    </div>
  );
}

import type { Metadata } from 'next';
import { prisma, safe } from '@/lib/db';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ArticleCard } from '@/components/cards';
import { ARTICLE_TYPES, ARTICLE_TYPE_LABEL } from '@/lib/enums';
import Link from 'next/link';

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: '최신 트로트 소식 · 신곡·방송·공연·공식 발표',
  description: '트로트 가수들의 신곡, 방송 출연, 공연 일정, 수상, 소속사 공식 발표를 정리한 최신 소식.',
  path: '/news',
});

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const validType = type && (ARTICLE_TYPES as readonly string[]).includes(type) ? type : undefined;

  const articles = await safe(prisma.article.findMany({
    where: { status: 'published', ...(validType ? { type: validType } : {}) },
    orderBy: { publishedAt: 'desc' },
    take: 30,
  }), []);

  return (
    <div>
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '최신 소식', path: '/news' }]} />
      <h1 className="text-2xl font-extrabold text-ink-900">최신 트로트 소식</h1>

      {/* 유형 필터 (§17). 필터 조합은 rel/noindex는 상세에서 관리 */}
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link href="/news" className={`rounded-full px-3 py-1 ${!validType ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-700 hover:bg-brand-50'}`}>전체</Link>
        {ARTICLE_TYPES.map((t) => (
          <Link key={t} href={`/news?type=${t}`} className={`rounded-full px-3 py-1 ${validType === t ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-700 hover:bg-brand-50'}`}>
            {ARTICLE_TYPE_LABEL[t]}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
      </div>
      {articles.length === 0 && <p className="mt-6 text-sm text-slate-500">해당하는 소식이 없습니다.</p>}
    </div>
  );
}

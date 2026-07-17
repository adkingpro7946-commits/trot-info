import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { buildMetadata, defaultHeroFor } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { SampleBadge } from '@/components/badges';
import { EventCard } from '@/components/cards';
import { SourceList } from '@/components/SourceList';
import { articleLd } from '@/lib/structured-data';
import { renderMarkdown } from '@/lib/markdown';
import { ARTICLE_TYPE_LABEL } from '@/lib/enums';
import { formatDate, formatDateTime } from '@/lib/format';

export const revalidate = 300;

async function getArticle(slug: string) {
  return prisma.article.findFirst({
    where: { slug, status: 'published' },
    include: {
      author: { select: { name: true } },
      artists: true,
      events: { include: { artists: { select: { stageName: true } } } },
      music: true,
      programs: true,
      sources: true,
    },
  });
}

export async function generateStaticParams() {
  try {
    const arts = await prisma.article.findMany({ where: { status: 'published' }, select: { slug: true } });
    return arts.map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) return { title: '기사를 찾을 수 없음' };
  return buildMetadata({
    title: a.seoTitle || a.title,
    description: a.description,
    path: `/news/${a.slug}`,
    index: a.index,
    image: a.heroImage,
    imageAlt: a.heroImageAlt,
    type: 'article',
    publishedTime: a.publishedAt?.toISOString(),
    modifiedTime: a.updatedAt.toISOString(),
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) notFound();

  return (
    <article>
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '최신 소식', path: '/news' }, { name: a.title, path: `/news/${a.slug}` }]} />
      <JsonLd
        data={articleLd({
          type: a.type,
          title: a.title,
          description: a.description,
          slug: a.slug,
          publishedAt: a.publishedAt,
          updatedAt: a.updatedAt,
          authorName: a.author?.name,
          image: a.heroImage,
        })}
      />

      <div className="flex items-center gap-2 text-sm text-brand-600">
        <span className="font-semibold">{ARTICLE_TYPE_LABEL[a.type] ?? a.type}</span>
        {a.isSample && <SampleBadge />}
      </div>
      <h1 className="mt-1 text-2xl font-extrabold leading-snug text-ink-900">{a.title}</h1>
      <p className="mt-2 text-ink-700">{a.description}</p>

      {/* 메타: 게시/수정/확인일/작성자 (§12) */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        {a.publishedAt && <span>게시 {formatDate(a.publishedAt)}</span>}
        <span>수정 {formatDate(a.updatedAt)}</span>
        {a.lastFactCheckedAt && <span>마지막 사실 확인 {formatDate(a.lastFactCheckedAt)}</span>}
        {a.author?.name && <span>작성 {a.author.name}</span>}
      </div>

      {/* 대표 이미지 — 실측 크기 명시 (§11). 없으면 카테고리 기본 그래픽. */}
      <figure className="mt-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={a.heroImage || defaultHeroFor(a.type)} alt={a.heroImageAlt ?? a.title} width={1200} height={630} className="max-h-80 w-full rounded-xl border border-slate-200 object-cover" />
        {(a.isAiImage || !a.heroImage) && (
          <figcaption className="mt-1 text-xs text-slate-400">이해를 돕기 위해 제작된 이미지입니다. (실제 인물 사진이 아닙니다)</figcaption>
        )}
      </figure>

      {/* 본문 */}
      <div className="prose-trot mt-6 max-w-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(a.body) }} />

      {a.timeSensitive && (
        <p className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          이 콘텐츠는 일정·시간에 민감합니다. 세부 일정은 공식 출처에서 다시 확인하세요.
          {a.lastFactCheckedAt && ` (확인 기준일 ${formatDate(a.lastFactCheckedAt)})`}
        </p>
      )}

      {/* 관련 콘텐츠 (§14) */}
      {a.artists.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-ink-900">관련 가수</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {a.artists.map((ar) => (
              <Link key={ar.id} href={`/artists/${ar.slug}`} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-ink-700 hover:bg-brand-50">{ar.stageName}</Link>
            ))}
          </div>
        </section>
      )}

      {a.events.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-ink-900">관련 공연</h2>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            {a.events.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        </section>
      )}

      {(a.music.length > 0 || a.programs.length > 0) && (
        <section className="mt-8 flex flex-wrap gap-2">
          {a.music.map((m) => <Link key={m.id} href={`/music/${m.slug}`} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-ink-700 hover:bg-brand-50">🎵 {m.title}</Link>)}
          {a.programs.map((p) => <Link key={p.id} href={`/programs/${p.slug}`} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-ink-700 hover:bg-brand-50">📺 {p.name}</Link>)}
        </section>
      )}

      {/* 공식 출처 + 마지막 확인 시각 (§6-9) */}
      <section className="mt-10 border-t border-slate-200 pt-6">
        <h2 className="text-lg font-bold text-ink-900">공식 출처</h2>
        <div className="mt-2"><SourceList sources={a.sources} /></div>
        <p className="mt-3 text-xs text-slate-500">
          이 콘텐츠는 위 출처를 근거로 정리했습니다. 마지막 확인 시각: {formatDateTime(a.updatedAt)}.
        </p>
      </section>

      {/* 정정 요청 안내 (§18) */}
      <section className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-ink-700">
        잘못된 정보가 있나요?{' '}
        <Link href={`/corrections?url=/news/${a.slug}`} className="font-semibold text-brand-600 hover:underline">정보 정정 요청</Link>
        {' '}으로 알려주시면 확인 후 반영합니다.
      </section>
    </article>
  );
}

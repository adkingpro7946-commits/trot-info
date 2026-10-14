import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { abs, buildMetadata, SITE_NAME } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { renderMarkdown } from '@/lib/markdown';
import { GUIDES, getGuide, readingMinutes, EDITORIAL_AUTHOR } from '@/content/guides';
import { ARTIST_NAMES } from '@/content/artist-names';

// 정적 편집 콘텐츠 — 빌드 시 전부 생성, DB 조회 없음.
export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

const fmt = (d: string) => {
  const [y, m, day] = d.split('-').map(Number);
  return `${y}년 ${m}월 ${day}일`;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return { title: '가이드를 찾을 수 없음' };
  return buildMetadata({
    title: g.title,
    description: g.description,
    path: `/guides/${g.slug}`,
    type: 'article',
    keywords: [g.category, '트로트 가이드', ...(g.relatedArtists ?? []).map((s) => ARTIST_NAMES[s]).filter(Boolean)],
    publishedTime: `${g.publishedAt}T09:00:00+09:00`,
    modifiedTime: `${g.updatedAt ?? g.publishedAt}T09:00:00+09:00`,
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();

  const related = (g.relatedGuides ?? []).map(getGuide).filter((x): x is NonNullable<typeof x> => !!x && x.slug !== g.slug);
  const sameCategory = GUIDES.filter((x) => x.category === g.category && x.slug !== g.slug && !related.some((r) => r.slug === x.slug));
  const more = [...related, ...sameCategory].slice(0, 6);

  return (
    <article>
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '트로트 가이드', path: '/guides' }, { name: g.title, path: `/guides/${g.slug}` }]} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: g.title,
          description: g.description,
          url: abs(`/guides/${g.slug}`),
          mainEntityOfPage: abs(`/guides/${g.slug}`),
          datePublished: `${g.publishedAt}T09:00:00+09:00`,
          dateModified: `${g.updatedAt ?? g.publishedAt}T09:00:00+09:00`,
          author: { '@type': 'Organization', name: EDITORIAL_AUTHOR, url: abs('/about') },
          publisher: { '@type': 'Organization', name: SITE_NAME },
          articleSection: g.category,
          inLanguage: 'ko-KR',
        }}
      />

      <p className="text-sm font-semibold text-brand-600">{g.category}</p>
      <h1 className="mt-1 text-2xl font-extrabold leading-snug text-ink-900">{g.title}</h1>
      <p className="mt-2 text-ink-700">{g.description}</p>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span>
          글 <Link href="/about" className="underline hover:text-brand-600">{EDITORIAL_AUTHOR}</Link>
        </span>
        <span>게시 {fmt(g.publishedAt)}</span>
        {g.updatedAt && g.updatedAt !== g.publishedAt && <span>수정 {fmt(g.updatedAt)}</span>}
        <span>읽는 시간 약 {readingMinutes(g.body)}분</span>
      </div>

      <div className="prose-trot mt-6 max-w-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(g.body) }} />

      {(g.relatedArtists ?? []).length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-ink-900">이 글에 나온 가수</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {(g.relatedArtists ?? []).filter((s) => ARTIST_NAMES[s]).map((s) => (
              <Link key={s} href={`/artists/${s}`} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-ink-700 hover:bg-brand-50">
                {ARTIST_NAMES[s]}
              </Link>
            ))}
          </div>
        </section>
      )}

      {more.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-ink-900">함께 읽으면 좋은 가이드</h2>
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {more.map((r) => (
              <li key={r.slug} className="rounded-lg border border-slate-200 p-4 hover:border-brand-300">
                <Link href={`/guides/${r.slug}`} className="block">
                  <span className="text-xs font-semibold text-brand-600">{r.category}</span>
                  <span className="mt-1 block font-semibold text-ink-900">{r.title}</span>
                  <span className="mt-1 block text-sm text-ink-700 line-clamp-2">{r.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(g.references ?? []).length > 0 && (
        <section className="mt-10 border-t border-slate-200 pt-6">
          <h2 className="text-lg font-bold text-ink-900">참고 자료</h2>
          <ul className="mt-2 space-y-1 text-sm text-ink-700">
            {(g.references ?? []).map((r) => (
              <li key={r.title + r.publisher}>
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noopener noreferrer nofollow" className="text-brand-600 hover:underline">{r.title}</a>
                ) : (
                  r.title
                )}{' '}
                <span className="text-slate-500">· {r.publisher}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-ink-700">
        이 글은 {SITE_NAME} 편집부가 공개 자료를 바탕으로 직접 정리·해설한 글입니다. 사실과 다른 내용이 있다면{' '}
        <Link href={`/corrections?url=/guides/${g.slug}`} className="font-semibold text-brand-600 hover:underline">정보 정정 요청</Link>
        으로 알려주세요. 편집 원칙은 <Link href="/about" className="font-semibold text-brand-600 hover:underline">사이트 소개</Link>에서 확인할 수 있습니다.
      </section>
    </article>
  );
}

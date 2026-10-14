import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata, SITE_NAME } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { GUIDES, GUIDE_CATEGORIES, readingMinutes, EDITORIAL_AUTHOR } from '@/content/guides';

export const metadata: Metadata = buildMetadata({
  title: '트로트 가이드 · 명곡·창법·역사·공연 관람 해설',
  description: `${SITE_NAME} 편집부가 직접 쓴 트로트 해설 가이드. 시대별 명곡, 창법과 리듬, 경연 프로그램 투표 방식, 콘서트 예매·관람 요령까지 정리했습니다.`,
  path: '/guides',
});

export default function GuidesPage() {
  const cats = GUIDE_CATEGORIES.filter((c) => GUIDES.some((g) => g.category === c));
  return (
    <div>
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '트로트 가이드', path: '/guides' }]} />
      <h1 className="text-2xl font-extrabold text-ink-900">트로트 가이드</h1>
      <p className="mt-2 max-w-content leading-7 text-ink-700">
        일정·소식 정리를 넘어, 트로트를 더 깊이 즐기기 위한 해설을 모았습니다. 시대별 명곡의 맥락, 꺾기와 ‘쿵짝’ 리듬 같은
        음악적 특징, 경연 프로그램의 심사 구조, 처음 콘서트에 가는 분을 위한 예매·관람 요령까지 {EDITORIAL_AUTHOR}가 공개 자료를
        확인해 직접 썼습니다. 모든 글에는 작성 주체와 게시일을 표기하고, 오류는 정정 요청으로 바로잡습니다.
      </p>

      <nav aria-label="가이드 분류" className="mt-5 flex flex-wrap gap-2 text-sm">
        {cats.map((c) => (
          <a key={c} href={`#${encodeURIComponent(c)}`} className="rounded-full bg-slate-100 px-3 py-1 text-ink-700 hover:bg-brand-50">
            {c} ({GUIDES.filter((g) => g.category === c).length})
          </a>
        ))}
      </nav>

      {cats.map((c) => (
        <section key={c} id={c} className="mt-10 scroll-mt-4">
          <h2 className="text-lg font-bold text-ink-900">{c}</h2>
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {GUIDES.filter((g) => g.category === c).map((g) => (
              <li key={g.slug} className="rounded-lg border border-slate-200 p-4 hover:border-brand-300">
                <Link href={`/guides/${g.slug}`} className="block">
                  <span className="block font-semibold text-ink-900">{g.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-ink-700 line-clamp-3">{g.description}</span>
                  <span className="mt-2 block text-xs text-slate-500">읽는 시간 약 {readingMinutes(g.body)}분</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

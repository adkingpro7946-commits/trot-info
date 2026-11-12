import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { TrotStarterCourse } from '@/components/TrotStarterCourse';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: '트로트 입문 코스 만들기 · 취향별 가이드와 가수 추천',
  description:
    '듣고 싶은 분위기, 즐기는 방식, 선호 시대, 익숙한 정도를 고르면 트로트 인포의 해설과 가수 프로필을 읽을 순서로 묶어 드립니다.',
  path: '/starter-course',
  keywords: ['트로트 입문', '트로트 추천', '트로트 명곡', '트로트 가수 추천'],
});

export default function StarterCoursePage() {
  return (
    <div>
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '입문 코스 만들기', path: '/starter-course' }]} />
      <h1 className="text-2xl font-extrabold text-ink-900">나에게 맞는 트로트 입문 코스</h1>
      <p className="mt-2 max-w-content leading-7 text-ink-700">
        트로트는 시대와 창법, 무대의 분위기가 넓어서 유명한 순서대로 듣는 것만으로는 취향을 찾기 어렵습니다.
        네 가지 질문에 답하면 이 사이트의 장문 해설과 가수별 편집부 해설을 4단계 읽기 순서로 묶어 드립니다.
      </p>

      <div className="mt-6">
        <TrotStarterCourse />
      </div>

      <section className="mt-10 max-w-content border-t border-slate-200 pt-6">
        <h2 className="text-lg font-bold text-ink-900">추천은 이렇게 계산합니다</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-ink-700">
          <li>분위기·즐기는 방식·시대·익숙한 정도가 많이 맞는 콘텐츠를 먼저 배치합니다.</li>
          <li>한 종류의 글만 이어지지 않도록 해설, 가수 프로필, 실전 안내를 섞습니다.</li>
          <li>조회 수, 광고, 제휴 수수료는 점수에 사용하지 않습니다.</li>
          <li>추천 결과는 의료·심리 진단처럼 개인을 판정하는 기능이 아니라 감상 순서를 찾는 도구입니다.</li>
        </ul>
        <p className="mt-4 text-sm text-ink-700">
          전체 글을 직접 둘러보고 싶다면 <Link href="/guides" className="font-semibold text-brand-600 hover:underline">트로트 가이드 17편</Link>과{' '}
          <Link href="/artists" className="font-semibold text-brand-600 hover:underline">가수 프로필</Link>에서 시작하세요.
        </p>
      </section>
    </div>
  );
}


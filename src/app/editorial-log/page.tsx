import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EDITORIAL_LOG } from '@/content/editorial-log';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: '편집 활동 기록 · 콘텐츠 추가와 검증 내역',
  description:
    '트로트 인포가 언제 어떤 콘텐츠를 추가하고, 출처·검색 색인·사용자 기능을 어떻게 점검했는지 주요 변경 내역을 공개합니다.',
  path: '/editorial-log',
});

function koreanDate(date: string) {
  const [year, month, day] = date.split('-');
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

export default function EditorialLogPage() {
  return (
    <div>
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '편집 활동 기록', path: '/editorial-log' }]} />
      <h1 className="text-2xl font-extrabold text-ink-900">편집 활동 기록</h1>
      <p className="mt-2 max-w-content leading-7 text-ink-700">
        새 글의 수만 늘리기보다 기존 정보가 실제로 도움이 되는지, 얇거나 겹치는 페이지가 검색에 노출되고 있지는 않은지,
        출처와 확인일이 보이는지를 함께 관리합니다. 아래에는 공개 사이트에 실제 반영한 주요 작업만 기록합니다.
      </p>

      <ol className="mt-8 space-y-5">
        {EDITORIAL_LOG.map((entry) => (
          <li key={`${entry.date}-${entry.title}`} className="rounded-xl border border-slate-200 p-5">
            <time dateTime={entry.date} className="text-sm font-semibold text-brand-600">{koreanDate(entry.date)}</time>
            <h2 className="mt-1 text-lg font-bold text-ink-900">{entry.title}</h2>
            <p className="mt-2 max-w-content text-sm leading-6 text-ink-700">{entry.summary}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-700">
              {entry.changes.map((change) => <li key={change}>{change}</li>)}
            </ul>
          </li>
        ))}
      </ol>

      <section className="mt-10 max-w-content rounded-xl bg-slate-50 p-5">
        <h2 className="font-bold text-ink-900">기록 원칙</h2>
        <p className="mt-2 text-sm leading-6 text-ink-700">
          아직 하지 않은 작업은 기록하지 않고, 배포한 주요 변경만 날짜와 함께 남깁니다. 사실 오류를 발견하면{' '}
          <Link href="/corrections" className="font-semibold text-brand-600 hover:underline">정보 정정 요청</Link>으로 알려주세요.
          편집 기준과 출처 우선순위는 <Link href="/about" className="font-semibold text-brand-600 hover:underline">사이트 소개·운영 원칙</Link>에서 확인할 수 있습니다.
        </p>
      </section>
    </div>
  );
}


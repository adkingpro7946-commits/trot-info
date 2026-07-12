import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CorrectionForm } from '@/components/CorrectionForm';

export const metadata: Metadata = buildMetadata({
  title: '정보 정정 요청',
  description: '잘못된 정보를 발견하셨다면 정정을 요청해 주세요. 확인 후 반영합니다.',
  path: '/corrections',
  index: false,
});

export default async function CorrectionsPage({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
  const { url } = await searchParams;
  return (
    <div>
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '정정 요청', path: '/corrections' }]} />
      <h1 className="text-2xl font-extrabold text-ink-900">정보 정정 요청</h1>
      <p className="mt-2 max-w-content text-sm text-ink-700">
        본 사이트는 공식 출처를 기반으로 정보를 정리하지만 오류가 있을 수 있습니다.
        잘못된 정보를 알려주시면 출처를 확인한 뒤 정정하고, 중요한 변경은 어떤 내용이 바뀌었는지 기록합니다.
      </p>
      <div className="mt-6 max-w-content"><CorrectionForm defaultUrl={url ?? ''} /></div>
    </div>
  );
}

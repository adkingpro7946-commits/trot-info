import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const metadata: Metadata = buildMetadata({
  title: '사이트 소개·운영 원칙',
  description: '트로트 정보 플랫폼의 정보 수집·검증 원칙과 운영 방식을 안내합니다.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <div className="max-w-content">
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '사이트 소개', path: '/about' }]} />
      <h1 className="text-2xl font-extrabold text-ink-900">사이트 소개·운영 원칙</h1>
      <div className="prose-trot mt-4">
        <h2>무엇을 하는 사이트인가</h2>
        <p>트로트 가수의 기본 정보·주요 활동·발매 음반·방송 출연·공연 일정·최신 소식을 공식 출처 기반으로 한곳에 정리하는 정보 플랫폼입니다. 기사 복제 사이트가 아니라 정리·비교·일정·탐색 편의를 제공합니다.</p>
        <h2>정보 원칙</h2>
        <ul>
          <li>가수·소속사 공식 채널, 방송사 편성, 공연 주최사, 공식 티켓처, 음원 플랫폼, 공공 데이터 등 신뢰 가능한 원자료를 우선 사용합니다.</li>
          <li>중요한 사실은 2개 이상 출처로 교차 확인하며, 확인되지 않은 정보는 표시하지 않습니다.</li>
          <li>루머·사생활·미확인 의혹은 다루지 않습니다.</li>
          <li>각 콘텐츠 하단에 출처와 마지막 확인일을 표기합니다.</li>
        </ul>
        <h2>이미지</h2>
        <p>실제 인물 사진을 무단 사용하지 않으며, 표시되는 일부 이미지는 이해를 돕기 위해 제작된 편집 이미지입니다.</p>
        <h2>상거래 관련</h2>
        <p>티켓을 직접 판매하지 않습니다. 가격·잔여 좌석은 실시간 정보와 다를 수 있으므로 예매는 공식 예매처에서 확인하세요.</p>
        <h2>정정 요청</h2>
        <p>잘못된 정보는 <Link href="/corrections">정정 요청</Link> 페이지로 알려주세요.</p>
      </div>
      <p className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
        현재 사이트의 SAMPLE 표시 항목은 구조 시연용 가상 데이터입니다. 실제 인물·공연·음원 정보가 아닙니다.
      </p>
    </div>
  );
}

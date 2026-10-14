import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata, SITE_NAME } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const metadata: Metadata = buildMetadata({
  title: '문의하기',
  description: `${SITE_NAME}에 정보 정정, 제휴·광고, 저작권, 개인정보 관련 문의를 보내는 방법을 안내합니다.`,
  path: '/contact',
});

export default function ContactPage() {
  return (
    <div className="max-w-content">
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '문의하기', path: '/contact' }]} />
      <h1 className="text-2xl font-extrabold text-ink-900">문의하기</h1>

      <div className="prose-trot mt-4">
        <p>
          {SITE_NAME}에 관한 문의를 환영합니다. 아래 유형에 맞게 접수해 주시면 확인 후 순차적으로 답변드립니다.
          운영자가 직접 확인하며, 보통 영업일 기준 3~5일 이내에 처리합니다.
        </p>

        <h2>정보 정정·추가 요청</h2>
        <p>
          가수 프로필, 공연·방송 일정, 음반 정보 등에 사실과 다른 내용이나 누락이 있으면{' '}
          <Link href="/corrections">정보 정정 요청</Link> 페이지에서 근거(공식 출처 링크 등)와 함께 알려주세요.
          출처를 확인한 뒤 정정하고, 중요한 변경은 기록으로 남깁니다.
        </p>

        <h2>저작권·권리 관련 문의</h2>
        <p>
          본 사이트는 실제 인물 사진을 사용하지 않고, 기사 원문을 복제하지 않으며, 사실 정보를 자체 편집해
          제공합니다. 그럼에도 권리 침해 소지가 있다고 판단되는 콘텐츠를 발견하시면{' '}
          <Link href="/corrections">문의 페이지</Link>를 통해 해당 URL과 사유를 알려주시면 신속히 검토·조치합니다.
        </p>

        <h2>제휴·광고 문의</h2>
        <p>
          콘텐츠 제휴, 자료 제공, 광고 등에 관한 문의도 <Link href="/corrections">문의 페이지</Link>로 접수해 주세요.
          내용을 확인한 뒤 회신 가능한 경우 안내드립니다.
        </p>

        <h2>개인정보 관련 문의</h2>
        <p>
          개인정보의 열람·정정·삭제 등 권리 행사와 관련한 문의는{' '}
          <Link href="/privacy">개인정보처리방침</Link>을 참고하시고, 동일하게{' '}
          <Link href="/corrections">문의 페이지</Link>를 통해 접수하실 수 있습니다.
        </p>

        <h2>운영자 정보</h2>
        <ul>
          <li>사이트명: {SITE_NAME} (trotpick.co.kr)</li>
          <li>운영: 글로벌 미디어스 (대표 김호진)</li>
          <li>소재지: 부산광역시 부산진구</li>
          <li>접수 창구: <Link href="/corrections">문의·정정 요청 양식</Link> (회신을 원하시면 양식에 이메일을 남겨 주세요)</li>
        </ul>

        <p className="text-sm text-slate-500">
          ※ 접수하신 문의 내용과 (선택 입력하신) 회신용 연락처는 문의 처리 목적으로만 사용되며, 처리 완료 후 파기됩니다.
        </p>
      </div>
    </div>
  );
}

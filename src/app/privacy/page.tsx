import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata, SITE_NAME } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const metadata: Metadata = buildMetadata({
  title: '개인정보처리방침',
  description: `${process.env.SITE_NAME ?? '트로트 인포'}의 개인정보 수집·이용·보관에 관한 안내입니다.`,
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <div className="max-w-content">
      <Breadcrumbs items={[{ name: '홈', path: '/' }, { name: '개인정보처리방침', path: '/privacy' }]} />
      <h1 className="text-2xl font-extrabold text-ink-900">개인정보처리방침</h1>
      <p className="mt-2 text-sm text-slate-500">시행일: 2026년 7월 17일</p>

      <div className="prose-trot mt-4">
        <p>
          {SITE_NAME}(이하 “사이트”)는 이용자의 개인정보를 중요하게 생각하며, 관련 법령을 준수합니다.
          본 방침은 사이트가 수집하는 개인정보의 항목과 이용 목적, 보관 및 파기에 관한 사항을 안내합니다.
        </p>

        <h2>1. 수집하는 개인정보 항목</h2>
        <p>사이트는 회원가입 절차 없이 이용할 수 있으며, 다음의 경우에 한해 최소한의 정보를 수집합니다.</p>
        <ul>
          <li><strong>정보 정정 요청 시</strong>: 요청 내용, (선택) 회신용 이메일 주소, 근거 링크. 이메일은 회신을 원하는 경우에만 입력받습니다.</li>
          <li><strong>서비스 이용 과정에서 자동 생성</strong>: 접속 로그, 브라우저 종류 등 서버 운영·보안에 필요한 기술 정보.</li>
        </ul>

        <h2>2. 개인정보의 이용 목적</h2>
        <ul>
          <li>정정 요청의 확인 및 처리 결과 회신</li>
          <li>서비스 운영, 오류 대응 및 보안(부정 이용 방지)</li>
        </ul>

        <h2>3. 보관 및 파기</h2>
        <p>
          정정 요청 관련 정보는 처리 완료 후 관련 문의가 종결되면 지체 없이 파기합니다. 접속 로그 등 기술 정보는
          운영·보안 목적에 필요한 기간 동안만 보관 후 파기합니다. 법령에서 별도 보관을 요구하는 경우 해당 기간을 따릅니다.
        </p>

        <h2>4. 제3자 제공 및 처리 위탁</h2>
        <p>
          사이트는 이용자의 개인정보를 제3자에게 판매하거나 임의로 제공하지 않습니다. 서비스 제공을 위한
          호스팅·데이터베이스 등 인프라는 외부 클라우드 서비스를 이용하며, 이는 서비스 운영을 위한 처리 위탁에 해당합니다.
        </p>

        <h2>5. 쿠키 및 광고</h2>
        <p>
          사이트는 서비스 제공에 필요한 최소한의 쿠키를 사용할 수 있습니다. 향후 광고를 게재하는 경우, 광고 제공사가
          쿠키 등을 통해 정보를 수집할 수 있으며 이 경우 해당 내용을 본 방침에 반영해 안내합니다. 이용자는 브라우저
          설정을 통해 쿠키 저장을 거부할 수 있습니다.
        </p>

        <h2>6. 이용자의 권리</h2>
        <p>
          이용자는 본인의 개인정보에 대한 열람·정정·삭제를 요청할 수 있습니다. 요청은{' '}
          <Link href="/corrections">문의·정정 요청</Link> 페이지를 통해 접수할 수 있습니다.
        </p>

        <h2>7. 개인정보 보호책임자 및 문의</h2>
        <p>
          개인정보 관련 문의는 <Link href="/corrections">문의 페이지</Link>를 통해 접수하실 수 있습니다.
          {' '}(운영자 연락처는 사이트 운영자 정보에 따릅니다.)
        </p>

        <h2>8. 방침의 변경</h2>
        <p>본 방침은 법령이나 서비스 변경에 따라 개정될 수 있으며, 개정 시 본 페이지를 통해 공지합니다.</p>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { SITE_NAME } from '@/lib/seo';

// 사이트 정보 원칙 + 정정 요청 안내 (§15·§18)
export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-ink-700">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="font-bold text-ink-900">{SITE_NAME}</p>
            <p className="mt-2 leading-6 text-ink-700">
              트로트 가수의 프로필·공연·방송·신곡 정보를 공식 출처 기반으로 정리하는
              정보 플랫폼입니다. 티켓을 직접 판매하지 않으며, 일정·가격은 실시간이 아닐 수 있습니다.
            </p>
          </div>
          <div>
            <p className="font-bold text-ink-900">정보 원칙</p>
            <ul className="mt-2 space-y-1">
              <li>공식 출처 우선, 중요한 사실은 교차 확인</li>
              <li>확인되지 않은 정보는 표시하지 않음</li>
              <li>각 콘텐츠에 출처와 마지막 확인일 표기</li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-ink-900">문의</p>
            <ul className="mt-2 space-y-1">
              <li><Link href="/corrections" className="hover:text-brand-600">정보 정정 요청</Link></li>
              <li><Link href="/about" className="hover:text-brand-600">사이트 소개·운영 원칙</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500">
          현재 페이지의 가수·공연·기사 데이터 중 SAMPLE 표시가 있는 항목은 구조 시연용 가상 데이터입니다.
          © {SITE_NAME}
        </p>
      </div>
    </footer>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { JsonLd } from '@/components/JsonLd';
import { organizationLd, websiteLd } from '@/lib/structured-data';
import { SITE_NAME, SITE_URL, SITE_KEYWORDS, abs } from '@/lib/seo';

// 검색엔진 사이트 소유 확인 코드. env가 우선이며, 없으면 아래 하드코딩 값 사용
// (Vercel 환경변수를 못 바꾸는 상황 대비. 인증코드는 공개돼도 무방한 값).
const GOOGLE_VERIFY = process.env.GOOGLE_SITE_VERIFICATION || 'NvKb1M2GH0hwvNuYMZWCJZL0-v4h6KVCGmpR5AZtEi4';
const NAVER_VERIFY = process.env.NAVER_SITE_VERIFICATION || '912566d2b014d83c4df9b3fd948e36bb41233d1d';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · 트로트 가수·공연·방송·신곡 정보`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    '트로트 가수의 프로필, 공연 일정, 방송 출연, 신곡·앨범, 공식 발표를 공식 출처 기반으로 정리하는 트로트 전문 정보 플랫폼. 미스터트롯·미스트롯·현역가왕 등 오디션 스타부터 원로 가수까지.',
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  formatDetection: { telephone: false },
  alternates: { canonical: SITE_URL, types: { 'application/rss+xml': `${SITE_URL}/rss.xml` } },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'ko_KR',
    url: SITE_URL,
    title: `${SITE_NAME} · 트로트 가수·공연·방송·신곡 정보`,
    description: '트로트 가수 프로필·공연 일정·방송·신곡을 공식 출처 기반으로 정리하는 트로트 전문 정보 플랫폼.',
    images: [{ url: abs('/img/generated/hero-home.webp'), width: 1200, height: 630, alt: '트로트 공연 무대' }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  verification: {
    ...(GOOGLE_VERIFY ? { google: GOOGLE_VERIFY } : {}),
    ...(NAVER_VERIFY ? { other: { 'naver-site-verification': NAVER_VERIFY } } : {}),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="flex min-h-screen flex-col">
        <JsonLd data={[organizationLd(), websiteLd()]} />
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

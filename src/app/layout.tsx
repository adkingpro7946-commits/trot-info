import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { JsonLd } from '@/components/JsonLd';
import { organizationLd, websiteLd } from '@/lib/structured-data';
import { SITE_NAME, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · 트로트 가수·공연·방송·신곡 정보`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    '트로트 가수의 프로필, 공연 일정, 방송 출연, 신곡·앨범, 공식 발표를 공식 출처 기반으로 정리하는 트로트 전문 정보 플랫폼.',
  applicationName: SITE_NAME,
  formatDetection: { telephone: false },
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

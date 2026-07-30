import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const disallow = ['/admin', '/api/', '/search'];
  return {
    rules: [
      // 전체 봇 기본 규칙
      { userAgent: '*', allow: '/', disallow },
      // 구글
      { userAgent: 'Googlebot', allow: '/', disallow },
      { userAgent: 'Googlebot-Image', allow: '/' },
      // 구글 애드센스 광고 크롤러(광고-콘텐츠 매칭용) — 콘텐츠 접근 허용
      { userAgent: 'Mediapartners-Google', allow: '/', disallow },
      { userAgent: 'AdsBot-Google', allow: '/', disallow },
      // 네이버(Yeti) — 국내 검색 노출용
      { userAgent: 'Yeti', allow: '/', disallow },
      // 다음(Daum)
      { userAgent: 'Daumoa', allow: '/', disallow },
      // 빙
      { userAgent: 'Bingbot', allow: '/', disallow },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

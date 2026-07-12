// SEO 메타데이터 헬퍼 (§12)
import type { Metadata } from 'next';

export const SITE_URL = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
export const SITE_NAME = process.env.SITE_NAME ?? '트로트 인포';

export function abs(path: string): string {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  image?: string | null;
  imageAlt?: string | null;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
}

export function buildMetadata(i: PageMetaInput): Metadata {
  const url = abs(i.path);
  const index = i.index !== false;
  const images = i.image
    ? [{ url: abs(i.image), width: 1200, height: 630, alt: i.imageAlt ?? i.title }]
    : [];
  return {
    title: i.title,
    description: i.description,
    alternates: { canonical: url },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: true }, // 검색 가치 없는 페이지 noindex (§17)
    openGraph: {
      title: i.title,
      description: i.description,
      url,
      siteName: SITE_NAME,
      type: i.type === 'article' ? 'article' : 'website',
      locale: 'ko_KR',
      images,
      ...(i.publishedTime ? { publishedTime: i.publishedTime } : {}),
      ...(i.modifiedTime ? { modifiedTime: i.modifiedTime } : {}),
    },
    twitter: {
      card: images.length ? 'summary_large_image' : 'summary',
      title: i.title,
      description: i.description,
      images: images.map((im) => im.url),
    },
  };
}

// 카테고리별 기본 대표 이미지 (이미지 생성 실패/보류 시 대체, §11)
export function defaultHeroFor(type: string): string {
  return `/img/default-${['release', 'broadcast', 'award'].includes(type) ? type : 'news'}.svg`;
}

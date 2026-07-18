// SEO 메타데이터 헬퍼 (§12)
import type { Metadata } from 'next';

export const SITE_URL = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
export const SITE_NAME = process.env.SITE_NAME ?? '트로트 인포';

export function abs(path: string): string {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

// 사이트 전역 기본 키워드 (검색 노출용, §13)
export const SITE_KEYWORDS = [
  '트로트', '트로트 가수', '트로트 공연', '트로트 콘서트', '트로트 방송',
  '트로트 신곡', '트로트 일정', '미스터트롯', '미스트롯', '현역가왕', '불타는 트롯맨',
  '트로트 오디션', '트로트 순위', '트로트 프로필',
];

// OG/트위터 기본 대표 이미지 (개별 이미지 없을 때)
const DEFAULT_OG_IMAGE = '/img/generated/hero-home.webp';

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  image?: string | null;
  imageAlt?: string | null;
  type?: 'website' | 'article' | 'profile';
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
}

export function buildMetadata(i: PageMetaInput): Metadata {
  const url = abs(i.path);
  const index = i.index !== false;
  // 이미지가 없으면 기본 무대 이미지로 대체 → 모든 페이지가 OG 카드 이미지를 갖는다(공유·네이버 노출 강화)
  const imgUrl = abs(i.image || DEFAULT_OG_IMAGE);
  const images = [{ url: imgUrl, width: 1200, height: 630, alt: i.imageAlt ?? i.title }];
  // 페이지 키워드 + 전역 키워드 결합(중복 제거)
  const keywords = Array.from(new Set([...(i.keywords ?? []), ...SITE_KEYWORDS]));
  return {
    title: i.title,
    description: i.description,
    keywords,
    alternates: { canonical: url },
    robots: index
      ? { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } }
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
      card: 'summary_large_image',
      title: i.title,
      description: i.description,
      images: [imgUrl],
    },
  };
}

// 카테고리별 기본 대표 이미지 (§11) — AI 생성 편집 이미지(무대/조명, 실제 인물 얼굴 없음)
export function defaultHeroFor(type: string): string {
  if (type === 'release') return '/img/generated/release-album.webp';
  if (type === 'broadcast') return '/img/generated/broadcast-studio.webp';
  if (type === 'award') return '/img/generated/award-trophy.webp';
  return '/img/generated/news-general.webp';
}

// 공연/무대 공용 배너 이미지
export const STAGE_IMAGE = '/img/generated/stage-concert.webp';
export const HOME_HERO_IMAGE = '/img/generated/hero-home.webp';

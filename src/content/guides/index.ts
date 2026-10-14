// 편집부 오리지널 가이드 — 정적 데이터(SSG). DB 미사용.
import type { Guide } from '../types';
import { guidesA } from './part-a';
import { guidesB } from './part-b';
import { guidesC } from './part-c';
import { guidesD } from './part-d';

export const GUIDES: Guide[] = [...guidesA, ...guidesB, ...guidesC, ...guidesD].sort((a, b) =>
  (b.updatedAt ?? b.publishedAt).localeCompare(a.updatedAt ?? a.publishedAt),
);

export const GUIDE_CATEGORIES = ['입문', '명곡 가이드', '음악 이해', '역사', '방송·경연', '공연·관람', '문화'] as const;

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

/** 공백 제외 글자 수 기준 읽기 시간(분) — 분당 약 500자 */
export function readingMinutes(body: string): number {
  return Math.max(3, Math.round(body.replace(/\s/g, '').length / 500));
}

export const EDITORIAL_AUTHOR = '트로트 인포 편집부';

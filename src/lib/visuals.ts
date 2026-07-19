// 시각 자산 선택 — 이름/슬러그 기반 결정적 매핑. 실존 인물 초상이 아닌 가상 캐릭터/무대 이미지.
import { genderOf } from './artist-gender';

const MALE_COUNT = 10;
const FEMALE_COUNT = 10;
const CONCERT_COUNT = 6;

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// 가수 캐릭터 일러스트(가상). 성별에 맞는 세트에서 이름 기반으로 고정 배정.
export function singerImage(name: string): string {
  const g = genderOf(name) ?? (hash(name) % 2 === 0 ? 'f' : 'm'); // 미등록은 이름 해시로 임시 배정
  const count = g === 'm' ? MALE_COUNT : FEMALE_COUNT;
  const n = (hash(name) % count) + 1;
  return `/img/singers/${g}/${g}-${String(n).padStart(2, '0')}.webp`;
}

// 공연 무대 장면(다양화). 같은 공연은 항상 같은 장면.
export function concertImage(key: string): string {
  const n = (hash(`${key}::concert`) % CONCERT_COUNT) + 1;
  return `/img/concert/concert-${n}.webp`;
}

// 시각 자산 선택 — 이름/슬러그 기반 결정적 매핑. 실존 인물 초상이 아닌 가상 캐릭터/무대 이미지.
const SINGER_COUNT = 10;
const CONCERT_COUNT = 6;

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// 가수 캐릭터 일러스트(가상). 같은 가수는 항상 같은 캐릭터로 고정.
export function singerImage(key: string): string {
  const n = (hash(key) % SINGER_COUNT) + 1;
  return `/img/singers/singer-${String(n).padStart(2, '0')}.webp`;
}

// 공연 무대 장면(다양화). 같은 공연은 항상 같은 장면.
export function concertImage(key: string): string {
  const n = (hash(`${key}::concert`) % CONCERT_COUNT) + 1;
  return `/img/concert/concert-${n}.webp`;
}

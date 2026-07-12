// slug 생성/정규화 — 한글은 유지하되 공백/특수문자는 하이픈, 영문 소문자화
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-') // 문자/숫자 외 → 하이픈
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// 폼 입력 → slug (비어있으면 fallback 텍스트로 생성)
export function ensureSlug(slugInput: string, fallback: string): string {
  const s = slugInput.trim() ? slugify(slugInput) : slugify(fallback);
  return s || `item-${Date.now().toString(36)}`;
}

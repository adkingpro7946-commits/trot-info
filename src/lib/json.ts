// JSON 문자열 필드 파싱 헬퍼 (SQLite 배열 미지원 대체)

export function parseArray<T = string>(value: string | null | undefined): T[] {
  if (!value) return [];
  try {
    const v = JSON.parse(value);
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}

export function stringifyArray(value: unknown[]): string {
  return JSON.stringify(value ?? []);
}

export interface SocialLink {
  label: string;
  url: string;
}

export function parseSocialLinks(value: string | null | undefined): SocialLink[] {
  return parseArray<SocialLink>(value).filter((l) => l && l.url);
}

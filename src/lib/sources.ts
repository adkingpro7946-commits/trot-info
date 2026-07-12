// 출처 신뢰도 평가 (§9, docs/source-policy.md)
import type { SourceGrade } from './enums';

export interface SourceLike {
  sourceGrade: string;
  verificationStatus?: string;
  linkOk?: boolean;
  sourceUrl?: string;
}

// 사실 확인 출처로 사용 가능한 등급 (A/B). C는 근거로 불가.
export function isUsableForFacts(grade: string): boolean {
  return grade === 'A' || grade === 'B';
}

export interface CrossCheckResult {
  hasOfficial: boolean;      // A등급 존재
  independentCount: number;  // 사실 확인 가능한 독립 출처 수(도메인 기준)
  crossChecked: boolean;     // 2개 이상 독립 출처
  onlyCommunity: boolean;    // 사실상 C등급뿐
}

function domainOf(url?: string): string | null {
  if (!url) return null; // URL 없는 출처는 독립 근거로 세지 않는다 (보수적)
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function evaluateSources(sources: SourceLike[]): CrossCheckResult {
  const usable = sources.filter((s) => isUsableForFacts(s.sourceGrade));
  const domains = new Set(
    usable.map((s) => domainOf(s.sourceUrl)).filter((d): d is string => !!d),
  );
  const hasOfficial = usable.some((s) => s.sourceGrade === 'A');
  return {
    hasOfficial,
    independentCount: domains.size,
    crossChecked: domains.size >= 2,
    onlyCommunity: usable.length === 0 && sources.length > 0,
  };
}

// 출처 신뢰성 점수 (품질 20점, §20)
export function sourceTrustScore(sources: SourceLike[]): number {
  if (sources.length === 0) return 0;
  const r = evaluateSources(sources);
  let s = 0;
  if (r.hasOfficial) s += 12;
  else if (r.independentCount >= 1) s += 6;
  if (r.crossChecked) s += 6;
  if (sources.every((x) => x.linkOk !== false)) s += 2;
  return Math.min(20, s);
}

export const GRADE_LABEL: Record<SourceGrade, string> = {
  A: 'A · 공식/1차',
  B: 'B · 언론·전문매체',
  C: 'C · 참고(사실확인 불가)',
};

// 품질 점수 + 위험 검사 (§20) — 근거를 항목별로 로그에 저장
import { sourceTrustScore, evaluateSources, type SourceLike } from './sources';

// 민감 주제 키워드 → review 강제 (§8·§20)
export const SENSITIVE_KEYWORDS = [
  '논란', '사건', '사고', '건강', '사망', '별세', '소송', '고소', '고발', '재판', '판결',
  '가족', '이혼', '결혼설', '열애', '연애', '재산', '출연료', '수입', '정치',
  '의혹', '루머', '갈등', '폭로', '음주', '마약', '학폭',
];

// 낚시성 제목 패턴 (§13) → 감점
export const CLICKBAIT_PATTERNS = [
  '충격', '믿을 수 없', '오열', '결국 터', '경악', '발칵', '깜짝', '소름',
  '반전', '충격적인 근황',
];

export interface QualityInput {
  title: string;
  body: string;
  description: string;
  primaryKeyword?: string | null;
  sources: SourceLike[];
  artistNames: string[];
  hasInternalLinks: boolean;
  hasValidHero: boolean;
  structuredDataOk: boolean;
  duplicateSimilarity: number; // 0~1, 기존 콘텐츠 최대 유사도
}

export interface RiskResult {
  riskLevel: 'low' | 'medium' | 'high';
  reasons: string[];
  forceReview: boolean;
}

export function assessRisk(i: QualityInput): RiskResult {
  const reasons: string[] = [];
  const text = `${i.title} ${i.body}`;
  const sensitive = SENSITIVE_KEYWORDS.filter((k) => text.includes(k));
  if (sensitive.length) reasons.push(`민감 키워드: ${sensitive.join(', ')}`);

  const ev = evaluateSources(i.sources);
  if (i.sources.length === 0) reasons.push('출처 없음');
  if (ev.onlyCommunity) reasons.push('사실확인 가능한 출처 없음(C등급뿐)');
  if (sensitive.length && !ev.crossChecked) reasons.push('민감 주제인데 교차확인(2출처) 미충족');

  const forceReview =
    sensitive.length > 0 || i.sources.length === 0 || ev.onlyCommunity;
  const riskLevel: RiskResult['riskLevel'] =
    sensitive.length > 0 ? 'high' : i.sources.length < 1 ? 'medium' : 'low';
  return { riskLevel, reasons, forceReview };
}

export interface QualityResult {
  score: number;
  breakdown: Record<string, { got: number; max: number; note: string }>;
}

// 검색 의도 20 / 사실 정확성 20 / 출처 20 / 새 가치 15 / 중복방지 10 /
// 가독성 5 / 내부연결 5 / 기술 SEO 5  (§20)
export function scoreQuality(i: QualityInput): QualityResult {
  const b: QualityResult['breakdown'] = {};

  // 검색 의도 해결도 (20): 핵심 키워드가 제목/본문에 반영 + 본문 최소 정보량
  let intent = 0;
  if (i.primaryKeyword && i.title.includes(i.primaryKeyword)) intent += 8;
  else if (i.primaryKeyword) intent += 4;
  if (i.body.length >= 350) intent += 8;
  else if (i.body.length >= 180) intent += 4;
  if (i.description.length >= 40) intent += 4;
  intent = Math.min(20, intent);
  b['검색의도'] = { got: intent, max: 20, note: `본문 ${i.body.length}자` };

  // 사실 정확성 (20): 인물명 본문 일치 + 교차확인
  let fact = 0;
  const ev = evaluateSources(i.sources);
  if (i.artistNames.length && i.artistNames.every((n) => i.body.includes(n) || i.title.includes(n)))
    fact += 8;
  if (ev.hasOfficial) fact += 6;
  if (ev.crossChecked) fact += 6;
  fact = Math.min(20, fact);
  b['사실정확성'] = { got: fact, max: 20, note: `공식 ${ev.hasOfficial} / 독립 ${ev.independentCount}` };

  // 출처 신뢰성 (20)
  const src = sourceTrustScore(i.sources);
  b['출처신뢰성'] = { got: src, max: 20, note: `출처 ${i.sources.length}건` };

  // 새로운 가치 (15): 낚시 감점, 정리/맥락 존재(단순 길이 아님)
  let value = 12;
  const clickbait = CLICKBAIT_PATTERNS.filter((k) => i.title.includes(k));
  if (clickbait.length) value -= 8;
  if (i.hasInternalLinks) value += 3;
  value = Math.max(0, Math.min(15, value));
  b['새가치'] = { got: value, max: 15, note: clickbait.length ? `낚시패턴:${clickbait.join(',')}` : '정상' };

  // 중복 방지 (10)
  const dup = Math.round(Math.max(0, 1 - i.duplicateSimilarity) * 10);
  b['중복방지'] = { got: dup, max: 10, note: `유사도 ${(i.duplicateSimilarity * 100).toFixed(0)}%` };

  // 가독성 (5)
  const read = i.body.includes('\n') || i.body.length < 1200 ? 5 : 3;
  b['가독성'] = { got: read, max: 5, note: '' };

  // 내부 연결 (5)
  b['내부연결'] = { got: i.hasInternalLinks ? 5 : 0, max: 5, note: '' };

  // 기술 SEO (5): 대표이미지 + 구조화 데이터 정상
  const tech = (i.hasValidHero ? 2 : 0) + (i.structuredDataOk ? 3 : 0);
  b['기술SEO'] = { got: tech, max: 5, note: '' };

  const score = Object.values(b).reduce((a, x) => a + x.got, 0);
  return { score, breakdown: b };
}

export const AUTO_PUBLISH_MIN_SCORE = 85;

// 자동 발행 가능 여부 종합 판정 (§20)
export function canAutoPublish(
  q: QualityResult,
  risk: RiskResult,
  checks: { linkOk: boolean; titleBodyMatch: boolean; imageRightsOk: boolean; structuredDataOk: boolean },
): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (q.score < AUTO_PUBLISH_MIN_SCORE) reasons.push(`품질 ${q.score} < ${AUTO_PUBLISH_MIN_SCORE}`);
  if (risk.forceReview) reasons.push('민감/출처 사유로 검수 강제');
  if (!checks.linkOk) reasons.push('출처 링크 오류');
  if (!checks.titleBodyMatch) reasons.push('제목-본문 불일치');
  if (!checks.imageRightsOk) reasons.push('이미지 권리 불명확');
  if (!checks.structuredDataOk) reasons.push('구조화 데이터 오류');
  if (process.env.AUTO_PUBLISH_ENABLED !== 'true') reasons.push('자동발행 스위치 OFF');
  return { ok: reasons.length === 0, reasons };
}

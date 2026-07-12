// 콘텐츠 자동화 파이프라인 (§8, docs/automation-flow.md)
// 초안 후보 → 검증/위험/품질 → 발행 or 검수 대기 결정. 로그를 AutomationLog에 남긴다.
import 'server-only';
import { prisma } from './db';
import { assessRisk, scoreQuality, canAutoPublish, type QualityInput } from './quality-score';
import type { SourceLike } from './sources';

export interface DraftCandidate {
  type: string;
  title: string;
  description: string;
  body: string;
  primaryKeyword?: string | null;
  artistNames: string[];
  sources: (SourceLike & { sourceTitle: string; sourceUrl: string })[];
  hasInternalLinks: boolean;
  hasValidHero: boolean;
  imageRightsOk: boolean;
}

// 아주 단순한 제목/설명 기반 중복 유사도(자카드). 실제 운영은 본문 임베딩 권장.
export function similarity(a: string, b: string): number {
  const norm = (s: string) => new Set(s.toLowerCase().replace(/[^가-힣a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean));
  const A = norm(a);
  const B = norm(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / (A.size + B.size - inter);
}

async function maxDuplicateSimilarity(title: string): Promise<number> {
  const recent = await prisma.article.findMany({
    where: { status: { in: ['published', 'scheduled', 'review'] } },
    select: { title: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  return recent.reduce((m, r) => Math.max(m, similarity(title, r.title)), 0);
}

async function log(
  stage: string,
  level: 'info' | 'warn' | 'error',
  message: string,
  extra?: { refType?: string; refId?: string; payload?: unknown },
) {
  await prisma.automationLog.create({
    data: {
      stage,
      level,
      message,
      refType: extra?.refType,
      refId: extra?.refId,
      payload: extra?.payload ? JSON.stringify(extra.payload) : null,
    },
  });
}

export interface PipelineDecision {
  status: 'published' | 'review' | 'draft' | 'rejected';
  qualityScore: number;
  qualityBreakdown: string;
  riskLevel: 'low' | 'medium' | 'high';
  reasons: string[];
}

// 후보 하나를 파이프라인에 통과시켜 발행 여부를 결정 (저장은 호출측이 수행)
export async function runPipeline(c: DraftCandidate): Promise<PipelineDecision> {
  await log('collect', 'info', `후보 수집: ${c.title}`);

  // 3~4. 중복/기존 비교
  const dup = await maxDuplicateSimilarity(c.title);
  if (dup >= 0.8) {
    await log('dedupe', 'warn', `높은 유사도(${(dup * 100).toFixed(0)}%) → 반려`, { payload: { title: c.title } });
    return { status: 'rejected', qualityScore: 0, qualityBreakdown: '{}', riskLevel: 'low', reasons: [`기존 기사와 유사도 ${(dup * 100).toFixed(0)}%`] };
  }

  const qi: QualityInput = {
    title: c.title,
    body: c.body,
    description: c.description,
    primaryKeyword: c.primaryKeyword,
    sources: c.sources,
    artistNames: c.artistNames,
    hasInternalLinks: c.hasInternalLinks,
    hasValidHero: c.hasValidHero,
    structuredDataOk: true,
    duplicateSimilarity: dup,
  };

  // 10. 위험 검사
  const risk = assessRisk(qi);
  await log('risk', risk.forceReview ? 'warn' : 'info', `위험도 ${risk.riskLevel}`, { payload: risk.reasons });

  // 11. 링크 유효성 (형식 검사; 실제 HTTP 점검은 별도 Cron)
  const linkOk = c.sources.length > 0 && c.sources.every((s) => /^https?:\/\//.test(s.sourceUrl));

  // 15. 품질 점수
  const q = scoreQuality(qi);
  await log('quality', 'info', `품질 점수 ${q.score}`, { payload: q.breakdown });

  // 제목-본문 일치(핵심 키워드/인물명 반영)
  const titleBodyMatch =
    c.artistNames.length === 0 ||
    c.artistNames.some((n) => c.body.includes(n));

  // 16. 발행/검수 결정
  const decision = canAutoPublish(q, risk, {
    linkOk,
    titleBodyMatch,
    imageRightsOk: c.imageRightsOk,
    structuredDataOk: true,
  });

  const status: PipelineDecision['status'] = decision.ok
    ? 'published'
    : risk.forceReview
      ? 'review'
      : 'draft';

  await log('publish', 'info', `결정: ${status}`, { payload: decision.reasons });

  return {
    status,
    qualityScore: q.score,
    qualityBreakdown: JSON.stringify(q.breakdown),
    riskLevel: risk.riskLevel,
    reasons: decision.reasons,
  };
}

export const DAILY_TARGET = 5; // 목표(의무 아님, §8)

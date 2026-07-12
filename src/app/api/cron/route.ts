import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { runPipeline, DAILY_TARGET, type DraftCandidate } from '@/lib/automation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 실제 운영에서는 공식 출처 커넥터(소속사/방송사 편성/티켓처 RSS·API)가 후보를 반환.
// 현재는 커넥터 미구성 → 기본 빈 배열. demo=1 이면 파이프라인 시연용 후보 1건 사용.
async function collectCandidates(demo: boolean): Promise<DraftCandidate[]> {
  if (!demo) return [];
  return [
    {
      type: 'news',
      title: '[자동생성 시연] 데모 방송 출연 확정 정리 (DEMO)',
      description: '자동화 파이프라인 시연용 데모 후보입니다. 실제 정보가 아닙니다.',
      body: '데모 후보 본문. 단일 출처/검증 부족 상황을 가정하여 검수 대기로 분기되는 흐름을 시연합니다.',
      primaryKeyword: '데모',
      artistNames: [],
      sources: [
        { sourceTitle: '데모 편성 안내(DEMO)', sourceUrl: 'https://example.com/demo-cron', sourceGrade: 'B', verificationStatus: 'unverified', linkOk: true },
      ],
      hasInternalLinks: false,
      hasValidHero: false,
      imageRightsOk: true,
    },
  ];
}

async function handle(req: Request): Promise<NextResponse> {
  // Cron 보호 토큰 검증 (§22)
  const auth = req.headers.get('authorization') ?? '';
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const demo = url.searchParams.get('demo') === '1';

  // Cron 중복 실행 방지: 같은 날 collect 로그 존재 시 스킵 (§22)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const already = await prisma.automationLog.findFirst({
    where: { stage: 'collect', runAt: { gte: startOfDay } },
  });
  if (already && !demo) {
    return NextResponse.json({ ok: true, skipped: '오늘 이미 실행됨(중복 방지)' });
  }

  const candidates = (await collectCandidates(demo)).slice(0, DAILY_TARGET);
  await prisma.automationLog.create({
    data: { stage: 'collect', level: 'info', message: `후보 ${candidates.length}건 수집 (목표 최대 ${DAILY_TARGET})` },
  });

  const results: { title: string; status: string; score: number; reasons: string[] }[] = [];
  for (const c of candidates) {
    const decision = await runPipeline(c);
    // 자동 발행 스위치 OFF거나 기준 미달이면 published 되지 않음
    results.push({ title: c.title, status: decision.status, score: decision.qualityScore, reasons: decision.reasons });
  }

  const published = results.filter((r) => r.status === 'published').length;
  return NextResponse.json({
    ok: true,
    autoPublishEnabled: process.env.AUTO_PUBLISH_ENABLED === 'true',
    target: DAILY_TARGET,
    collected: candidates.length,
    published,
    note: '자동 발행은 스위치가 켜지고 모든 기준을 통과한 경우에만 이뤄집니다.',
    results,
  });
}

export async function POST(req: Request) {
  return handle(req);
}
// 일부 스케줄러는 GET 사용 → 동일 처리(토큰 필수)
export async function GET(req: Request) {
  return handle(req);
}

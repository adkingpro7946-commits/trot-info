import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { rateLimit, clientKey } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const schema = z.object({
  targetUrl: z.string().min(1).max(500),
  proposedFix: z.string().min(5).max(4000),
  evidenceUrl: z.string().url().max(500).optional().or(z.literal('')),
  requesterEmail: z.string().email().max(200).optional().or(z.literal('')),
  consent: z.boolean(),
});

export async function POST(req: Request) {
  // rate limit: 정정 요청 남용 방지
  if (!rateLimit(clientKey(req, 'corrections'), 5, 60_000)) {
    return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: '입력값을 확인해 주세요.' }, { status: 400 });
  }
  const d = parsed.data;
  if (!d.consent) {
    return NextResponse.json({ error: '개인정보 수집·이용 동의가 필요합니다.' }, { status: 400 });
  }

  await prisma.correctionRequest.create({
    data: {
      targetUrl: d.targetUrl,
      proposedFix: d.proposedFix,
      evidenceUrl: d.evidenceUrl || null,
      requesterEmail: d.requesterEmail || null,
      consent: d.consent,
      status: 'open',
    },
  });

  return NextResponse.json({ ok: true });
}

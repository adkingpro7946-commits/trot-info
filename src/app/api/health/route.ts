import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 헬스체크 (§21) — 배포 플랫폼/로드밸런서/모니터링용. DB 연결까지 확인.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: 'ok',
      db: 'up',
      autoPublish: process.env.AUTO_PUBLISH_ENABLED === 'true',
      time: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      { status: 'error', db: 'down', message: (e as Error).message },
      { status: 503 },
    );
  }
}

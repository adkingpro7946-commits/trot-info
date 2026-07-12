import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 최초 배포 후 관리자 계정 1회 생성용 (로컬 Postgres 도구 없이).
// 보호: Authorization: Bearer <CRON_SECRET>. 멱등(이미 관리자 있으면 no-op).
// 사용: curl -X POST -H "Authorization: Bearer <CRON_SECRET>" https://도메인/api/bootstrap
async function handle(req: Request): Promise<NextResponse> {
  const auth = req.headers.get('authorization') ?? '';
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    return NextResponse.json({ error: 'ADMIN_EMAIL / ADMIN_PASSWORD 환경변수 필요' }, { status: 400 });
  }

  const existing = await prisma.user.count();
  if (existing > 0) {
    return NextResponse.json({ ok: true, created: false, note: '이미 사용자 계정이 존재합니다.' });
  }

  await prisma.user.create({
    data: { email, name: '관리자', role: 'admin', passwordHash: await hashPassword(password) },
  });
  return NextResponse.json({ ok: true, created: true, email });
}

export async function POST(req: Request) {
  return handle(req);
}
export async function GET(req: Request) {
  return handle(req);
}

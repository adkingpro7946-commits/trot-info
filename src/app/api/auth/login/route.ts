import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { verifyPassword, createSessionToken, setSessionCookie } from '@/lib/auth';
import { rateLimit, clientKey } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const schema = z.object({ email: z.string().email(), password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  // 로그인 무차별 대입 방지 (§22)
  if (!rateLimit(clientKey(req, 'login'), 8, 60_000)) {
    return NextResponse.json({ error: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도하세요.' }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: '잘못된 요청' }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: '이메일/비밀번호를 확인하세요.' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  // 동일한 오류 메시지로 계정 존재 여부 노출 방지
  const ok = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
  if (!user || !ok) {
    return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
  }

  const token = await createSessionToken({ sub: user.id, email: user.email, name: user.name, role: user.role });
  await setSessionCookie(token);
  await prisma.adminActivityLog.create({ data: { userId: user.id, action: 'login' } });

  return NextResponse.json({ ok: true });
}

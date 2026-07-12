// 프로덕션 최초 배포 시 관리자 계정 1개를 env 로 생성(멱등). tsx 불필요(순수 ESM).
//   필요 env: DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!email || !password) {
  console.error('[bootstrap-admin] ADMIN_EMAIL / ADMIN_PASSWORD 필요');
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`[bootstrap-admin] 이미 존재: ${email}`);
  } else {
    await prisma.user.create({
      data: { email, name: '관리자', role: 'admin', passwordHash: await bcrypt.hash(password, 10) },
    });
    console.log(`[bootstrap-admin] 관리자 생성: ${email}`);
  }
} finally {
  await prisma.$disconnect();
}

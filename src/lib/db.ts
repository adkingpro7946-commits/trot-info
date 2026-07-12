import { PrismaClient } from '@prisma/client';

// 개발 중 HMR로 인한 커넥션 누수 방지용 싱글턴
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// DB 접속 실패(빌드 시 미접속/일시 장애)에도 페이지가 죽지 않도록 폴백 반환.
// 정적 생성 시 빈 결과로 프리렌더 후 런타임 ISR에서 실제 데이터로 갱신된다.
export async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch (e) {
    console.error('[db.safe] 쿼리 실패, 폴백 사용:', (e as Error).message);
    return fallback;
  }
}

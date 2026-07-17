import { PrismaClient } from '@prisma/client';

// 개발 중 HMR로 인한 커넥션 누수 방지용 싱글턴
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * 빌드 시 Next.js가 다수 페이지를 병렬 프리렌더하면 Prisma 커넥션 풀이 고갈되어
 * P2024(Timed out fetching a new connection)로 빌드가 실패한다.
 * (Vercel 빌드 머신은 코어가 적어 기본 connection_limit이 3까지 내려간다)
 * → Postgres URL에 풀 옵션을 주입해 방지. 로컬 SQLite에는 적용하지 않는다.
 */
function pooledDatasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url || !/^postgres(ql)?:\/\//i.test(url)) return undefined;
  try {
    const u = new URL(url);
    // Vercel 빌드 서버(미국) ↔ Neon(싱가포르) 간 지연이 커서 커넥션 점유 시간이 길다.
    // 한도와 대기시간을 넉넉히 잡아 프리렌더 중 풀 고갈을 막는다.
    if (!u.searchParams.has('connection_limit')) u.searchParams.set('connection_limit', '15');
    if (!u.searchParams.has('pool_timeout')) u.searchParams.set('pool_timeout', '60');
    if (!u.searchParams.has('connect_timeout')) u.searchParams.set('connect_timeout', '30');
    return u.toString();
  } catch {
    return undefined;
  }
}

const dsUrl = pooledDatasourceUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(dsUrl ? { datasourceUrl: dsUrl } : {}),
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

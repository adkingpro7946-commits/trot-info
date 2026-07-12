import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { LogoutButton } from '@/components/LogoutButton';

export const dynamic = 'force-dynamic';

const NAV = [
  { href: '/admin', label: '대시보드' },
  { href: '/admin/articles', label: '기사' },
  { href: '/admin/automation', label: '자동화 로그' },
  { href: '/admin/corrections', label: '정정 요청' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // 세션 없음 = 로그인 페이지만 표시 (미들웨어가 그 외 경로를 로그인으로 리다이렉트)
  if (!session) {
    return <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>;
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
      <aside className="hidden w-48 shrink-0 md:block">
        <p className="text-xs font-semibold uppercase text-slate-400">관리자</p>
        <nav className="mt-2 space-y-1 text-sm">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="block rounded px-2 py-1.5 text-ink-700 hover:bg-slate-100">
              {n.label}
            </Link>
          ))}
          <Link href="/" className="block rounded px-2 py-1.5 text-ink-700 hover:bg-slate-100">← 사이트 보기</Link>
        </nav>
        <LogoutButton />
      </aside>
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-2">
          <span className="text-sm text-slate-500">{session.name} ({session.role})</span>
        </div>
        {children}
      </div>
    </div>
  );
}

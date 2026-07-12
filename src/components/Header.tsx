import Link from 'next/link';
import { SITE_NAME } from '@/lib/seo';

const NAV = [
  { href: '/artists', label: '가수' },
  { href: '/news', label: '최신 소식' },
  { href: '/events', label: '공연 일정' },
  { href: '/broadcasts', label: '방송 일정' },
  { href: '/music', label: '신곡·앨범' },
  { href: '/weekly', label: '주간 정리' },
];

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-brand-700">
          <span className="text-lg">🎤 {SITE_NAME}</span>
        </Link>
        <nav aria-label="주요 메뉴" className="hidden md:block">
          <ul className="flex items-center gap-4 text-sm font-medium text-ink-700">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-brand-600">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/search" className="hover:text-brand-600">검색</Link>
            </li>
          </ul>
        </nav>
      </div>
      {/* 모바일 내비 */}
      <nav aria-label="모바일 메뉴" className="border-t border-slate-100 md:hidden">
        <ul className="flex gap-3 overflow-x-auto px-4 py-2 text-sm text-ink-700">
          {NAV.map((n) => (
            <li key={n.href} className="shrink-0">
              <Link href={n.href} className="hover:text-brand-600">{n.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

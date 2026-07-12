import Link from 'next/link';
import { JsonLd } from './JsonLd';
import { breadcrumbLd } from '@/lib/structured-data';

export interface Crumb {
  name: string;
  path: string;
}

// 시각적 경로 + BreadcrumbList 구조화 데이터 (§12·§14)
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="breadcrumb" className="mb-4 text-sm text-ink-700">
      <JsonLd data={breadcrumbLd(items)} />
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => (
          <li key={c.path} className="flex items-center gap-1">
            {i < items.length - 1 ? (
              <Link href={c.path} className="hover:text-brand-600">
                {c.name}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink-900">{c.name}</span>
            )}
            {i < items.length - 1 && <span className="text-slate-300">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

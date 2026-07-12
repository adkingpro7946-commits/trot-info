import Link from 'next/link';
import { prisma } from '@/lib/db';
import { WorkflowStatusBadge } from '@/components/badges';
import { formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AdminArtistsPage() {
  const artists = await prisma.artist.findMany({ orderBy: { updatedAt: 'desc' } });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink-900">가수 관리</h1>
        <Link href="/admin/artists/new" className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700">+ 새 가수</Link>
      </div>
      <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
        {artists.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-3 p-3">
            <Link href={`/admin/artists/${a.id}`} className="min-w-0 flex-1 truncate text-sm font-medium text-ink-800 hover:text-brand-600">
              {a.stageName}
              {a.isSample && <span className="ml-1 rounded bg-amber-100 px-1 text-[11px] text-amber-700">SAMPLE</span>}
            </Link>
            <span className="text-xs text-slate-400">{formatDate(a.updatedAt)}</span>
            <WorkflowStatusBadge status={a.status} />
          </li>
        ))}
        {artists.length === 0 && <li className="p-4 text-sm text-slate-500">등록된 가수가 없습니다.</li>}
      </ul>
    </div>
  );
}

import Link from 'next/link';
import { prisma } from '@/lib/db';
import { WorkflowStatusBadge } from '@/components/badges';
import { formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AdminMusicPage() {
  const music = await prisma.music.findMany({ orderBy: { updatedAt: 'desc' }, include: { artists: { select: { stageName: true } } } });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink-900">음반·곡 관리</h1>
        <Link href="/admin/music/new" className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700">+ 새 음반</Link>
      </div>
      <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
        {music.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0 flex-1">
              <Link href={`/admin/music/${m.id}`} className="block truncate text-sm font-medium text-ink-800 hover:text-brand-600">
                {m.title}{m.isSample && <span className="ml-1 rounded bg-amber-100 px-1 text-[11px] text-amber-700">SAMPLE</span>}
              </Link>
              <p className="text-xs text-slate-400">{m.type} · {m.artists.map((a) => a.stageName).join(', ') || '가수 미지정'}{m.releaseDate ? ` · ${formatDate(m.releaseDate)}` : ''}</p>
            </div>
            <WorkflowStatusBadge status={m.status} />
          </li>
        ))}
        {music.length === 0 && <li className="p-4 text-sm text-slate-500">등록된 음반이 없습니다.</li>}
      </ul>
    </div>
  );
}

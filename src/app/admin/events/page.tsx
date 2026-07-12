import Link from 'next/link';
import { prisma } from '@/lib/db';
import { WorkflowStatusBadge, EventStatusBadge } from '@/components/badges';
import { formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({ orderBy: { startDateTime: 'desc' }, include: { artists: { select: { stageName: true } } } });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink-900">공연 관리</h1>
        <Link href="/admin/events/new" className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700">+ 새 공연</Link>
      </div>
      <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
        {events.map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0 flex-1">
              <Link href={`/admin/events/${e.id}`} className="block truncate text-sm font-medium text-ink-800 hover:text-brand-600">
                {e.eventName}{e.isSample && <span className="ml-1 rounded bg-amber-100 px-1 text-[11px] text-amber-700">SAMPLE</span>}
              </Link>
              <p className="text-xs text-slate-400">{formatDate(e.startDateTime)} · {e.artists.map((a) => a.stageName).join(', ') || '출연 미지정'}</p>
            </div>
            <EventStatusBadge status={e.eventStatus} />
            <WorkflowStatusBadge status={e.status} />
          </li>
        ))}
        {events.length === 0 && <li className="p-4 text-sm text-slate-500">등록된 공연이 없습니다.</li>}
      </ul>
    </div>
  );
}

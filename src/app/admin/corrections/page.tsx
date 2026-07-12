import { prisma } from '@/lib/db';
import { resolveCorrection } from '../actions';
import { formatDateTime } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AdminCorrectionsPage() {
  const items = await prisma.correctionRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  return (
    <div>
      <h1 className="text-xl font-bold text-ink-900">정정 요청</h1>
      {items.length ? (
        <ul className="mt-4 space-y-3">
          {items.map((c) => (
            <li key={c.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{formatDateTime(c.createdAt)}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{c.status}</span>
              </div>
              <p className="mt-1 text-sm font-medium text-ink-900">{c.targetUrl}</p>
              <p className="mt-1 text-sm text-ink-700">{c.proposedFix}</p>
              {c.evidenceUrl && <a href={c.evidenceUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-xs text-brand-600 underline">근거 링크</a>}
              {c.requesterEmail && <p className="text-xs text-slate-400">회신: {c.requesterEmail}</p>}
              <form action={resolveCorrection} className="mt-2 flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={c.id} />
                <select name="status" defaultValue={c.status} className="rounded border border-slate-300 px-2 py-1 text-xs">
                  <option value="open">open</option>
                  <option value="reviewing">reviewing</option>
                  <option value="applied">applied</option>
                  <option value="rejected">rejected</option>
                </select>
                <input name="note" placeholder="처리 메모" className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs" />
                <button type="submit" className="rounded bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700">저장</button>
              </form>
              {c.handledNote && <p className="mt-1 text-xs text-slate-500">처리 메모: {c.handledNote}</p>}
            </li>
          ))}
        </ul>
      ) : <p className="mt-4 text-sm text-slate-500">접수된 정정 요청이 없습니다.</p>}
    </div>
  );
}

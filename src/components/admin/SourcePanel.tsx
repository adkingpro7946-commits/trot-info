import { addSource, deleteSource } from '@/app/admin/crud-actions';
import { SOURCE_GRADES } from '@/lib/enums';
import { GRADE_LABEL } from '@/lib/sources';
import { formatDate } from '@/lib/format';

interface Src {
  id: string; sourceTitle: string; sourcePublisher?: string | null; sourceUrl: string;
  sourceGrade: string; verificationStatus: string; accessedAt?: Date | null;
}

// 출처 추가/삭제 패널 (§9) — article|artist|event|music 공용
export function SourcePanel({ ownerType, ownerId, sources }: { ownerType: 'article' | 'artist' | 'event' | 'music'; ownerId: string; sources: Src[] }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <h2 className="text-sm font-bold text-ink-900">출처 관리 ({sources.length})</h2>

      <ul className="mt-2 space-y-2">
        {sources.map((s) => (
          <li key={s.id} className="flex items-start justify-between gap-2 rounded border border-slate-100 p-2 text-xs">
            <div className="min-w-0">
              <span className="rounded bg-slate-100 px-1 text-[11px] text-slate-600">{GRADE_LABEL[s.sourceGrade as 'A'] ?? s.sourceGrade}</span>{' '}
              <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-brand-600 underline">{s.sourceTitle}</a>
              <p className="text-slate-400">{s.sourcePublisher} · {s.verificationStatus}{s.accessedAt ? ` · ${formatDate(s.accessedAt)}` : ''}</p>
            </div>
            <form action={deleteSource}>
              <input type="hidden" name="sourceId" value={s.id} />
              <input type="hidden" name="ownerType" value={ownerType} />
              <input type="hidden" name="ownerId" value={ownerId} />
              <button className="shrink-0 rounded border border-slate-300 px-2 py-0.5 text-slate-500 hover:bg-red-50 hover:text-red-600">삭제</button>
            </form>
          </li>
        ))}
        {sources.length === 0 && <li className="text-xs text-slate-400">등록된 출처가 없습니다.</li>}
      </ul>

      <form action={addSource} className="mt-3 space-y-2 border-t border-slate-100 pt-3">
        <input type="hidden" name="ownerType" value={ownerType} />
        <input type="hidden" name="ownerId" value={ownerId} />
        <input name="sourceTitle" required placeholder="출처 제목 *" className="w-full rounded border border-slate-300 px-2 py-1 text-xs" />
        <input name="sourceUrl" required placeholder="https://... *" className="w-full rounded border border-slate-300 px-2 py-1 text-xs" />
        <input name="sourcePublisher" placeholder="발행처" className="w-full rounded border border-slate-300 px-2 py-1 text-xs" />
        <div className="flex gap-2">
          <select name="sourceGrade" className="rounded border border-slate-300 px-2 py-1 text-xs">
            {SOURCE_GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select name="verificationStatus" className="rounded border border-slate-300 px-2 py-1 text-xs">
            <option value="unverified">unverified</option>
            <option value="verified">verified</option>
            <option value="cross_checked">cross_checked</option>
          </select>
          <input name="factType" placeholder="factType" className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs" />
        </div>
        <input name="quotedText" placeholder="짧은 직접 인용(선택)" className="w-full rounded border border-slate-300 px-2 py-1 text-xs" />
        <button className="rounded bg-slate-800 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700">출처 추가</button>
      </form>
    </div>
  );
}

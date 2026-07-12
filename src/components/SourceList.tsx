import { GRADE_LABEL } from '@/lib/sources';
import { formatDate } from '@/lib/format';
import type { SourceGrade } from '@/lib/enums';

interface SourceItem {
  sourceTitle: string;
  sourcePublisher?: string | null;
  sourceUrl: string;
  sourceGrade: string;
  publishedAt?: Date | string | null;
  accessedAt?: Date | string | null;
  quotedText?: string | null;
}

// 공식 출처 목록 (§6-9, §18). 외부 링크는 rel 보안 속성.
export function SourceList({ sources }: { sources: SourceItem[] }) {
  if (!sources.length) {
    return <p className="text-sm text-slate-500">등록된 출처가 없습니다.</p>;
  }
  return (
    <ul className="space-y-2 text-sm">
      {sources.map((s, i) => (
        <li key={i} className="rounded-lg border border-slate-200 p-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">
              {GRADE_LABEL[s.sourceGrade as SourceGrade] ?? s.sourceGrade}
            </span>
            <a
              href={s.sourceUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="font-medium text-brand-600 underline underline-offset-2"
            >
              {s.sourceTitle}
            </a>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {s.sourcePublisher && <>{s.sourcePublisher} · </>}
            {s.accessedAt && <>확인일 {formatDate(s.accessedAt)}</>}
          </p>
          {s.quotedText && (
            <p className="mt-1 border-l-2 border-slate-200 pl-2 text-xs italic text-ink-700">
              “{s.quotedText}”
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

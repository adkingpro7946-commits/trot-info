import { EVENT_STATUS_LABEL, WORKFLOW_STATUS_LABEL } from '@/lib/enums';

// SAMPLE/DEMO 데이터 표시 (§24)
export function SampleBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800 ${className}`}
      title="사이트 구조 시연용 가상 데이터입니다. 실제 정보가 아닙니다."
    >
      SAMPLE
    </span>
  );
}

const EVENT_STATUS_STYLE: Record<string, string> = {
  scheduled: 'bg-slate-100 text-slate-700',
  ticket_open: 'bg-emerald-100 text-emerald-800',
  sold_out: 'bg-slate-200 text-slate-600',
  cancelled: 'bg-red-100 text-red-700',
  postponed: 'bg-orange-100 text-orange-700',
  completed: 'bg-slate-100 text-slate-500',
  verification_needed: 'bg-yellow-100 text-yellow-800',
};

export function EventStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${EVENT_STATUS_STYLE[status] ?? 'bg-slate-100 text-slate-700'}`}>
      {EVENT_STATUS_LABEL[status] ?? status}
    </span>
  );
}

const WF_STATUS_STYLE: Record<string, string> = {
  published: 'bg-emerald-100 text-emerald-800',
  scheduled: 'bg-blue-100 text-blue-800',
  review: 'bg-yellow-100 text-yellow-800',
  verification_needed: 'bg-orange-100 text-orange-800',
  draft: 'bg-slate-100 text-slate-700',
  researching: 'bg-slate-100 text-slate-700',
  rejected: 'bg-red-100 text-red-700',
  archived: 'bg-slate-100 text-slate-500',
};

export function WorkflowStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${WF_STATUS_STYLE[status] ?? 'bg-slate-100 text-slate-700'}`}>
      {WORKFLOW_STATUS_LABEL[status] ?? status}
    </span>
  );
}

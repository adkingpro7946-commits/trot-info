import { prisma } from '@/lib/db';
import { formatDateTime } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AutomationLogPage() {
  const logs = await prisma.automationLog.findMany({ orderBy: { runAt: 'desc' }, take: 100 });
  return (
    <div>
      <h1 className="text-xl font-bold text-ink-900">자동화 로그</h1>
      <p className="mt-1 text-sm text-slate-500">
        파이프라인 단계별 실행 기록입니다. 실패 작업은 여기서 원인을 확인하고 재실행하세요.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-400">
              <th className="py-2 pr-3">시각</th>
              <th className="py-2 pr-3">단계</th>
              <th className="py-2 pr-3">레벨</th>
              <th className="py-2 pr-3">메시지</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-slate-100">
                <td className="py-1.5 pr-3 text-slate-400">{formatDateTime(l.runAt)}</td>
                <td className="py-1.5 pr-3 font-medium">{l.stage}</td>
                <td className={`py-1.5 pr-3 font-semibold ${l.level === 'error' ? 'text-red-600' : l.level === 'warn' ? 'text-amber-600' : 'text-slate-500'}`}>{l.level}</td>
                <td className="py-1.5 pr-3 text-ink-700">{l.message}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={4} className="py-4 text-slate-500">로그가 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

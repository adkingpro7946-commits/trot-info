'use client';
import { useState } from 'react';

// 정정 요청 폼 (§18) — 개인정보 동의 포함
export function CorrectionForm({ defaultUrl = '' }: { defaultUrl?: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    const fd = new FormData(e.currentTarget);
    const payload = {
      targetUrl: String(fd.get('targetUrl') ?? ''),
      proposedFix: String(fd.get('proposedFix') ?? ''),
      evidenceUrl: String(fd.get('evidenceUrl') ?? ''),
      requesterEmail: String(fd.get('requesterEmail') ?? ''),
      consent: fd.get('consent') === 'on',
    };
    try {
      const res = await fetch('/api/corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setState('done');
        setMessage('접수되었습니다. 확인 후 반영하겠습니다.');
      } else {
        setState('error');
        setMessage(data.error ?? '요청을 처리하지 못했습니다.');
      }
    } catch {
      setState('error');
      setMessage('네트워크 오류가 발생했습니다.');
    }
  }

  if (state === 'done') {
    return <p className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink-800">대상 URL</label>
        <input name="targetUrl" defaultValue={defaultUrl} required placeholder="/news/..." className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-800">수정할 내용</label>
        <textarea name="proposedFix" required rows={4} placeholder="어떤 정보가 어떻게 잘못되었는지 알려주세요." className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-800">근거 URL (선택)</label>
        <input name="evidenceUrl" placeholder="https://..." className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-800">회신 이메일 (선택)</label>
        <input name="requesterEmail" type="email" placeholder="you@example.com" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <label className="flex items-start gap-2 text-sm text-ink-700">
        <input name="consent" type="checkbox" required className="mt-1" />
        <span>정정 요청 처리를 위한 개인정보(이메일) 수집·이용에 동의합니다.</span>
      </label>
      {state === 'error' && <p className="text-sm text-red-600">{message}</p>}
      <button type="submit" disabled={state === 'sending'} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
        {state === 'sending' ? '전송 중…' : '정정 요청 보내기'}
      </button>
    </form>
  );
}

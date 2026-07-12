'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fd.get('email'), password: fd.get('password') }),
    });
    if (res.ok) {
      router.push(search.get('next') || '/admin');
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? '로그인에 실패했습니다.');
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <h1 className="text-xl font-bold text-ink-900">관리자 로그인</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input name="email" type="email" required placeholder="이메일" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="password" type="password" required placeholder="비밀번호" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
          {loading ? '로그인 중…' : '로그인'}
        </button>
      </form>
      <p className="mt-3 text-xs text-slate-400">데모 계정은 .env의 ADMIN_EMAIL / ADMIN_PASSWORD 참고.</p>
    </div>
  );
}

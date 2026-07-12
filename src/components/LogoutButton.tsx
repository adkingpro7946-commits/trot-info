'use client';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      className="mt-4 w-full rounded border border-slate-300 px-2 py-1.5 text-left text-sm text-slate-600 hover:bg-slate-100"
    >
      로그아웃
    </button>
  );
}

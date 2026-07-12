import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-3xl font-extrabold text-ink-900">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-sm text-ink-700">요청하신 페이지가 삭제되었거나 주소가 변경되었을 수 있습니다.</p>
      <div className="mt-6 flex justify-center gap-3 text-sm">
        <Link href="/" className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700">홈으로</Link>
        <Link href="/search" className="rounded-lg border border-slate-300 px-4 py-2 text-ink-700 hover:bg-slate-50">검색하기</Link>
      </div>
    </div>
  );
}

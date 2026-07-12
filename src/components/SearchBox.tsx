// 표준 GET 폼 검색 — JS 없이도 동작 (§12·§15)
export function SearchBox({
  size = 'md',
  placeholder = '가수·공연·방송·노래를 검색하세요',
}: {
  size?: 'md' | 'lg';
  placeholder?: string;
}) {
  return (
    <form action="/search" method="get" role="search" className="w-full">
      <div className="flex w-full items-stretch gap-2">
        <input
          type="search"
          name="q"
          placeholder={placeholder}
          aria-label="검색어"
          className={`w-full rounded-lg border border-slate-300 px-4 focus:border-brand-500 ${
            size === 'lg' ? 'py-3 text-base' : 'py-2 text-sm'
          }`}
        />
        <button
          type="submit"
          className={`shrink-0 rounded-lg bg-brand-600 px-4 font-semibold text-white hover:bg-brand-700 ${
            size === 'lg' ? 'py-3' : 'py-2 text-sm'
          }`}
        >
          검색
        </button>
      </div>
    </form>
  );
}

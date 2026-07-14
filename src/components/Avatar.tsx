// 가수 아바타 — 실제 사진(저작권) 대신 이름 기반 그라데이션 + 이니셜.
// 얼굴이 아니라 시각적 식별용 그래픽이므로 저작권/초상권 문제 없음.
const GRADIENTS: [string, string][] = [
  ['#f472b6', '#be185d'],
  ['#818cf8', '#4338ca'],
  ['#fb923c', '#c2410c'],
  ['#34d399', '#047857'],
  ['#60a5fa', '#1d4ed8'],
  ['#a78bfa', '#6d28d9'],
  ['#f87171', '#b91c1c'],
  ['#fbbf24', '#b45309'],
  ['#2dd4bf', '#0f766e'],
  ['#e879f9', '#a21caf'],
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const SIZES: Record<string, number> = { sm: 30, md: 44, lg: 112, xl: 140 };

export function Avatar({
  name,
  size = 'md',
  className = '',
  ring = false,
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  ring?: boolean;
}) {
  const [c1, c2] = GRADIENTS[hash(name) % GRADIENTS.length];
  const px = SIZES[size] ?? 44;
  const initial = Array.from(name.trim())[0] ?? '?';
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${ring ? 'ring-2 ring-white shadow-sm' : ''} ${className}`}
      style={{
        width: px,
        height: px,
        fontSize: Math.round(px * 0.42),
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
      }}
    >
      {initial}
    </span>
  );
}

// 여러 출연 가수를 겹쳐 보여주는 스택 (공연 카드용)
export function AvatarStack({ names, max = 4 }: { names: string[]; max?: number }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <span className="flex items-center">
      <span className="flex -space-x-2">
        {shown.map((n, i) => (
          <Avatar key={i} name={n} size="sm" ring />
        ))}
      </span>
      {rest > 0 && <span className="ml-2 text-xs text-slate-500">+{rest}</span>}
    </span>
  );
}

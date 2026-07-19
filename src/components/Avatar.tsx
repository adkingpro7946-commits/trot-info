// 가수 아바타 — 실존 인물 사진/초상 대신 '가상' 트로트 가수 캐릭터 일러스트(이름 기반 고정 매핑).
import { singerImage } from '@/lib/visuals';

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
  const px = SIZES[size] ?? 44;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={singerImage(name)}
      alt={`${name} 캐릭터 이미지 (가상 일러스트)`}
      width={px}
      height={px}
      loading="lazy"
      className={`inline-block shrink-0 rounded-full bg-slate-100 object-cover ${ring ? 'ring-2 ring-white shadow-sm' : ''} ${className}`}
      style={{ width: px, height: px }}
    />
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

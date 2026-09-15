/**
 * 쿠팡 파트너스 배너 (제휴 광고).
 * - 회원님의 파트너스 계정 고유값(id, trackingCode)이 있어야 실제 상품이 노출됩니다.
 *   쿠팡 파트너스 → 배너/상품 만들기 → '아이프레임' 코드에서 id와 trackingCode(AF...)를 확인해 아래 COUPANG에 채워주세요.
 * - 미설정 시(placeholder) 아무것도 렌더하지 않아 깨진 배너가 보이지 않습니다.
 * - 쿠팡 파트너스 정책상 '수수료를 제공받는다'는 고지 문구를 배너 근처에 반드시 표시합니다.
 */

// 👇 여기에 회원님의 쿠팡 파트너스 값을 넣으세요 (env가 있으면 env 우선).
const COUPANG = {
  id: process.env.NEXT_PUBLIC_COUPANG_BANNER_ID || 'REPLACE_BANNER_ID', // 예: '839123'
  trackingCode: process.env.NEXT_PUBLIC_COUPANG_TRACKING || 'REPLACE_TRACKING_CODE', // 예: 'AF1234567'
};

function configured() {
  return COUPANG.id !== 'REPLACE_BANNER_ID' && COUPANG.trackingCode !== 'REPLACE_TRACKING_CODE';
}

const DISCLOSURE = '이 페이지는 쿠팡 파트너스 활동의 일환으로, 이에 따라 일정액의 수수료를 제공받습니다.';

type Size = 'wide' | 'square' | 'banner';
const DIMS: Record<Size, { w: number; h: number; template: string }> = {
  wide: { w: 680, h: 140, template: 'carousel' },
  banner: { w: 728, h: 90, template: 'banner' },
  square: { w: 300, h: 250, template: 'carousel' },
};

export function CoupangBanner({ size = 'wide', className = '' }: { size?: Size; className?: string }) {
  if (!configured()) return null;
  const { w, h, template } = DIMS[size];
  const src = `https://ads-partners.coupang.com/widgets.html?id=${COUPANG.id}&template=${template}&trackingCode=${COUPANG.trackingCode}&subId=&width=${w}&height=${h}&tsource=`;
  return (
    <aside className={`my-6 flex flex-col items-center ${className}`} aria-label="쿠팡 파트너스 광고">
      <div className="w-full overflow-x-auto" style={{ maxWidth: w }}>
        <iframe
          src={src}
          width={w}
          height={h}
          referrerPolicy="unsafe-url"
          scrolling="no"
          title="쿠팡 파트너스 추천 상품"
          className="mx-auto block max-w-full border-0"
        />
      </div>
      <p className="mt-1 px-2 text-center text-[11px] leading-4 text-slate-400">{DISCLOSURE}</p>
    </aside>
  );
}

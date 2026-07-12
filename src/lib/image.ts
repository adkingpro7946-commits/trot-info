// OpenAI 이미지 생성 (§11, docs/image-policy.md)
// - 키는 env(OPENAI_API_KEY)로만. 실제 인물 사진 생성 금지.
// - 배경/분위기/일러스트만 생성. 제목·날짜·가수명은 별도 텍스트 레이어(HTML/SVG).
// - 실패 시 예외를 던지지 않고 null 반환 → 호출측이 기본 이미지 사용/보류 결정.
import 'server-only';

export type HeroTheme = 'stage' | 'broadcast' | 'release' | 'schedule' | 'program' | 'generic';

const THEME_PROMPT: Record<HeroTheme, string> = {
  stage: '트로트 콘서트 무대, 따뜻한 조명과 마이크 스탠드, 관객 실루엣, 인물 얼굴 없음',
  broadcast: '음악 방송 스튜디오 무대 조명과 카메라 분위기, 인물 없음',
  release: '음반/신곡을 상징하는 미니멀 편집 일러스트, 레코드와 음표 모티프, 인물 없음',
  schedule: '공연 일정 정보 카드 배경, 달력과 조명 모티프의 그래픽, 인물 없음',
  program: '방송 프로그램 소개용 스튜디오 무대 그래픽, 인물 없음',
  generic: '한국 대중음악 매거진 스타일의 세련된 추상 무대 배경, 인물 없음',
};

// 인물 지정 금지 — 분위기/구도만 기술
export function buildPrompt(theme: HeroTheme): string {
  return (
    `${THEME_PROMPT[theme]}. ` +
    '실제 특정 인물의 얼굴을 그리지 말 것. 사실적 보도사진처럼 보이지 않게 편집 일러스트/그래픽 스타일. ' +
    '텍스트나 글자를 이미지 안에 넣지 말 것. 16:9 가로 구도.'
  );
}

export interface ImageGenResult {
  ok: boolean;
  reason?: string;
  b64?: string;      // base64 PNG (호출측에서 WebP 변환/저장)
  isAiImage: boolean;
}

// 반환: 성공 시 base64. 실패/키없음 시 ok=false (발행 중단 아님).
export async function generateHeroImage(theme: HeroTheme): Promise<ImageGenResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return { ok: false, reason: 'OPENAI_API_KEY 미설정 → 기본 카테고리 이미지 사용', isAiImage: false };
  }
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1',
        prompt: buildPrompt(theme),
        size: '1536x1024', // 16:9 근사, 이후 1200x630 크롭
        n: 1,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, reason: `이미지 API 오류 ${res.status}: ${t.slice(0, 160)}`, isAiImage: false };
    }
    const data = (await res.json()) as { data?: { b64_json?: string; url?: string }[] };
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) return { ok: false, reason: '이미지 응답 비어있음', isAiImage: false };
    return { ok: true, b64, isAiImage: true };
  } catch (e) {
    return { ok: false, reason: `이미지 생성 예외: ${(e as Error).message}`, isAiImage: false };
  }
}

export const AI_IMAGE_CAPTION = '이해를 돕기 위해 제작된 이미지입니다.';

/**
 * OpenAI 이미지 생성 → public/img/generated/*.png (docs/image-policy.md)
 * - 실제 인물의 얼굴을 생성하지 않는다. 무대/조명/관객 실루엣/편집 일러스트만.
 * - 이미지 안에 글자를 넣지 않는다(제목은 HTML 텍스트 레이어로).
 * - 이미 파일이 있으면 건너뛴다(비용 절약). 강제 재생성: FORCE=1
 *
 * 실행: OPENAI_API_KEY=... node scripts/generate-images.mjs
 */
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, '..', 'public', 'img', 'generated');
const KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const QUALITY = process.env.OPENAI_IMAGE_QUALITY || 'medium';
const FORCE = process.env.FORCE === '1';

if (!KEY) {
  console.error('OPENAI_API_KEY 필요');
  process.exit(1);
}

// 인물 지정 금지 · 얼굴 금지 · 텍스트 금지를 모든 프롬프트에 공통 적용
const GUARD =
  ' 실제 특정 인물의 얼굴을 그리지 말 것. 사람의 얼굴이 식별되지 않게 하고, 필요하면 실루엣이나 뒷모습으로 표현할 것.' +
  ' 사실적인 보도사진처럼 보이지 않게 세련된 편집 일러스트/시네마틱 그래픽 스타일.' +
  ' 이미지 안에 글자나 로고를 넣지 말 것. 가로 16:9 구도.';

const IMAGES = [
  {
    name: 'hero-home',
    prompt:
      '한국 트로트 콘서트의 웅장한 공연장 전경. 따뜻한 핑크와 골드 조명이 무대를 비추고, 어두운 객석에는 관객들의 실루엣과 응원봉 불빛이 은은하게 빛난다. 무대 중앙에는 빈 마이크 스탠드가 서 있다. 화려하고 감성적인 분위기.' +
      GUARD,
  },
  {
    name: 'stage-concert',
    prompt:
      '트로트 콘서트 무대. 스포트라이트가 마이크 스탠드를 비추고 무대 뒤로 조명 빔이 퍼진다. 붉은 커튼과 무대 바닥의 반사광. 관객은 어두운 실루엣으로만 보인다. 시네마틱하고 따뜻한 색감.' +
      GUARD,
  },
  {
    name: 'news-general',
    prompt:
      '한국 대중음악 매거진 표지풍의 세련된 추상 그래픽. 무대 조명, 마이크, 음표 모티프가 기하학적으로 배치된 편집 일러스트. 딥 네이비와 마젠타 색조.' +
      GUARD,
  },
  {
    name: 'release-album',
    prompt:
      '신곡·음반 발매를 상징하는 미니멀 편집 일러스트. 어두운 배경 위에 바이닐 레코드와 음표, 부드러운 네온 조명이 어우러진 구성. 고급스럽고 정제된 느낌.' +
      GUARD,
  },
  {
    name: 'broadcast-studio',
    prompt:
      '음악 방송 스튜디오 무대. 카메라 크레인과 조명 리그, 무대 위 스포트라이트가 만드는 화려한 빛. 사람은 등장하지 않는다. 차분한 블루-퍼플 색조의 시네마틱 그래픽.' +
      GUARD,
  },
  {
    name: 'award-trophy',
    prompt:
      '음악 시상식 무대를 상징하는 편집 일러스트. 황금빛 트로피와 무대 조명, 반짝이는 입자들이 어우러진 구성. 사람은 등장하지 않는다. 골드와 딥 브라운 색조.' +
      GUARD,
  },
];

mkdirSync(OUT, { recursive: true });

let made = 0;
for (const img of IMAGES) {
  const file = join(OUT, `${img.name}.png`);
  if (existsSync(file) && !FORCE) {
    console.log(`- 건너뜀(이미 있음): ${img.name}.png`);
    continue;
  }
  process.stdout.write(`· 생성 중: ${img.name} … `);
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: MODEL, prompt: img.prompt, size: '1536x1024', quality: QUALITY, n: 1 }),
  });
  if (!res.ok) {
    console.log('실패');
    console.error(`  ${res.status}: ${(await res.text()).slice(0, 300)}`);
    continue;
  }
  const data = await res.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) {
    console.log('실패(빈 응답)');
    continue;
  }
  writeFileSync(file, Buffer.from(b64, 'base64'));
  made++;
  console.log(`완료 (${(Buffer.from(b64, 'base64').length / 1024).toFixed(0)}KB)`);
}
console.log(`\n✔ 생성 ${made}개 → public/img/generated/`);

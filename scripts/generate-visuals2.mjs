/**
 * 성별 구분 가수 캐릭터 세트 (가상 인물, 실존 초상 아님).
 *  public/img/singers/m/m-01..10.png (남성) , f/f-01..10.png (여성)
 * 실행: OPENAI_API_KEY=... node scripts/generate-visuals2.mjs
 */
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', 'public', 'img', 'singers');
const KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const FORCE = process.env.FORCE === '1';
if (!KEY) { console.error('OPENAI_API_KEY 필요'); process.exit(1); }

const STYLE =
  ' 깔끔한 플랫 벡터 일러스트, 마이크를 든 상반신, 밝고 친근한 표정, 단색 파스텔 배경.' +
  ' 반드시 실존 인물이나 특정 유명인과 닮지 않은 완전한 가상 캐릭터. 특정인 초상 아님. 텍스트 없음. 정사각형.';

const MALE = [
  '20대 젊은 남성 트로트 가수 캐릭터, 남색 정장, 자신감 있는 미소' + STYLE,
  '30대 남성 트로트 가수 캐릭터, 반짝이는 은색 무대의상' + STYLE,
  '중년 남성 트로트 가수 캐릭터, 버건디 정장, 온화한 표정' + STYLE,
  '선글라스를 낀 개성 있는 남성 트로트 가수 캐릭터, 블랙 재킷' + STYLE,
  '기타를 멘 싱어송라이터형 남성 트로트 가수 캐릭터, 캐주얼 셔츠' + STYLE,
  '원로 남성 트로트 가수 캐릭터, 회색 머리, 클래식한 턱시도' + STYLE,
  '밝고 흥겨운 남성 트로트 가수 캐릭터, 화사한 컬러 재킷, 춤추는 포즈' + STYLE,
  '지적인 인상의 남성 트로트 가수 캐릭터, 안경, 네이비 슈트' + STYLE,
  '전통 두루마기를 입은 남성 트로트 가수 캐릭터, 단정한 인상' + STYLE,
  '보타이를 맨 세련된 남성 트로트 가수 캐릭터, 화이트 재킷' + STYLE,
];
const FEMALE = [
  '우아한 이브닝 드레스를 입은 여성 트로트 가수 캐릭터, 긴 머리' + STYLE,
  '한복풍 무대의상을 입은 여성 트로트 가수 캐릭터, 단아한 인상' + STYLE,
  '20대 발랄한 여성 트로트 가수 캐릭터, 밝은 원피스, 활기찬 미소' + STYLE,
  '중년 여성 트로트 가수 캐릭터, 성숙하고 우아한 분위기, 자주색 드레스' + STYLE,
  '반짝이는 무대의상을 입은 여성 트로트 가수 캐릭터, 화려한 분위기' + STYLE,
  '세련된 단발머리 여성 트로트 가수 캐릭터, 모던한 정장 스타일' + STYLE,
  '리본 장식 파스텔 드레스의 귀여운 여성 트로트 가수 캐릭터' + STYLE,
  '파워풀한 디바 느낌의 여성 트로트 가수 캐릭터, 레드 드레스' + STYLE,
  '전통적인 분위기의 여성 트로트 가수 캐릭터, 고전 한복, 쪽머리' + STYLE,
  '트로피컬 컬러 무대의상의 여성 트로트 가수 캐릭터, 시원한 미소' + STYLE,
];

async function gen(prompt) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: MODEL, prompt, size: '1024x1024', quality: 'medium', n: 1 }),
  });
  if (!res.ok) { console.error(`  실패 ${res.status}: ${(await res.text()).slice(0, 140)}`); return null; }
  return (await res.json())?.data?.[0]?.b64_json ?? null;
}
async function run(sub, list, prefix) {
  const dir = join(ROOT, sub); mkdirSync(dir, { recursive: true });
  let n = 0;
  for (let i = 0; i < list.length; i++) {
    const file = join(dir, `${prefix}-${String(i + 1).padStart(2, '0')}.png`);
    if (existsSync(file) && !FORCE) { console.log(`- 건너뜀 ${sub}/${prefix}-${i + 1}`); continue; }
    process.stdout.write(`· ${sub}/${prefix}-${String(i + 1).padStart(2, '0')} … `);
    const b64 = await gen(list[i]);
    if (!b64) { console.log('실패'); continue; }
    writeFileSync(file, Buffer.from(b64, 'base64')); n++; console.log('완료');
  }
  return n;
}
const m = await run('m', MALE, 'm');
const f = await run('f', FEMALE, 'f');
console.log(`\n✔ 생성: 남성 ${m}, 여성 ${f}`);

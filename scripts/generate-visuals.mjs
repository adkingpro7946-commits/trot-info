/**
 * 시각 개선용 이미지 세트 생성 (OpenAI). 실존 인물 초상 금지 — 가상 캐릭터/무대 장면만.
 *  - public/img/singers/singer-01..10.png : 트로트 가수를 표현한 '가상' 만화 캐릭터(특정 실존 인물 아님)
 *  - public/img/concert/concert-1..6.png   : 다양한 공연 무대 장면
 * 실행: OPENAI_API_KEY=... node scripts/generate-visuals.mjs
 */
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..', 'public', 'img');
const KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const FORCE = process.env.FORCE === '1';
if (!KEY) { console.error('OPENAI_API_KEY 필요'); process.exit(1); }

const NOT_REAL =
  ' 반드시 실존 인물이나 특정 유명인과 닮지 않은 완전한 가상 캐릭터로 그릴 것. 특정인의 초상이 아님. 밝고 친근한 표정.';

// 가상 트로트 가수 캐릭터 10종 (성별·나이·의상·색감 다양)
const SINGERS = [
  '정장을 입고 마이크를 든 젊은 남성 트로트 가수 캐릭터, 플랫 일러스트, 자신감 있는 미소, 상반신, 단색 배경(코럴)',
  '화려한 드레스를 입고 마이크를 든 여성 트로트 가수 캐릭터, 플랫 일러스트, 우아한 표정, 상반신, 단색 배경(퍼플)',
  '반짝이는 무대의상을 입은 중년 남성 트로트 가수 캐릭터, 플랫 일러스트, 흥겨운 표정, 상반신, 단색 배경(블루)',
  '한복풍 무대의상을 입고 마이크를 든 여성 트로트 가수 캐릭터, 플랫 일러스트, 단아한 표정, 상반신, 단색 배경(에메랄드)',
  '선글라스를 낀 개성 있는 남성 트로트 가수 캐릭터, 플랫 일러스트, 쿨한 표정, 상반신, 단색 배경(오렌지)',
  '밝고 발랄한 젊은 여성 트로트 가수 캐릭터, 플랫 일러스트, 활기찬 미소, 상반신, 단색 배경(핑크)',
  '중후한 원로 남성 트로트 가수 캐릭터, 정장, 플랫 일러스트, 온화한 표정, 상반신, 단색 배경(네이비)',
  '트로피컬 컬러 무대의상의 여성 트로트 가수 캐릭터, 플랫 일러스트, 시원한 미소, 상반신, 단색 배경(틸)',
  '기타를 멘 싱어송라이터형 남성 트로트 가수 캐릭터, 플랫 일러스트, 상반신, 단색 배경(앰버)',
  '리본 장식 드레스의 여성 트로트 가수 캐릭터, 플랫 일러스트, 사랑스러운 표정, 상반신, 단색 배경(마젠타)',
];

const GUARD_STAGE = ' 사람의 얼굴은 등장하지 않게, 무대·조명·악기 중심. 텍스트나 글자 없음. 시네마틱 편집 이미지. 16:9.';
const CONCERTS = [
  '대형 트로트 콘서트 아레나, 따뜻한 핑크·골드 스포트라이트, 빈 마이크 스탠드, 어두운 객석의 응원봉 불빛.' + GUARD_STAGE,
  '야외 트로트 페스티벌 무대, 해질녘, 대형 LED 스크린과 화려한 조명, 객석에서 본 시점.' + GUARD_STAGE,
  '아담한 극장 무대, 붉은 커튼, 마이크를 비추는 한 줄기 스포트라이트, 우아한 분위기.' + GUARD_STAGE,
  '웅장한 스타디움 콘서트, 불꽃과 조명, 파노라마, 실루엣 관객.' + GUARD_STAGE,
  '음악방송 스튜디오 무대, 카메라 크레인, 블루-퍼플 조명, 반짝이는 바닥.' + GUARD_STAGE,
  '네온 조명의 밤 무대, 색소폰과 마이크, 레트로 감성, 따뜻한 보케.' + GUARD_STAGE,
];

async function gen(prompt, size) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: MODEL, prompt, size, quality: 'medium', n: 1 }),
  });
  if (!res.ok) { console.error(`  실패 ${res.status}: ${(await res.text()).slice(0, 160)}`); return null; }
  const data = await res.json();
  return data?.data?.[0]?.b64_json ?? null;
}

async function run(dir, list, prefix, size, pad) {
  mkdirSync(join(ROOT, dir), { recursive: true });
  let n = 0;
  for (let i = 0; i < list.length; i++) {
    const name = `${prefix}-${String(i + 1).padStart(pad, '0')}.png`;
    const file = join(ROOT, dir, name);
    if (existsSync(file) && !FORCE) { console.log(`- 건너뜀: ${dir}/${name}`); continue; }
    process.stdout.write(`· ${dir}/${name} … `);
    const b64 = await gen(list[i], size);
    if (!b64) { console.log('실패'); continue; }
    writeFileSync(file, Buffer.from(b64, 'base64')); n++;
    console.log('완료');
  }
  return n;
}

const a = await run('singers', SINGERS, 'singer', '1024x1024', 2);
const b = await run('concert', CONCERTS, 'concert', '1536x1024', 1);
console.log(`\n✔ 생성: 가수 캐릭터 ${a}, 공연 장면 ${b}`);

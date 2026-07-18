/**
 * 콘텐츠 배치9 — 원로 4인(주현미·태진아·설운도·송대관) + 심층글 '트로트 레전드'.
 * 정정 반영: 송대관 별세는 2025-02-07(널리 보도된 공개 사실만, 사인·건강 상세 배제).
 * 원로는 오디션 프로그램 이전 세대이므로 program 미연결.
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const NOW = new Date('2026-07-17T00:00:00+09:00');
const D = (s: string) => new Date(s);

interface Spec {
  slug: string; stageName: string; realName?: string | null; profileSummary: string;
  birthDate?: string | null; birthPlace?: string | null; agency?: string | null;
  awards: { year: number; title: string; org?: string; sourceUrl?: string }[];
  timeline: { date: string; title: string; description?: string; sourceUrl?: string }[];
  sources: { t: string; p: string; u: string; g: string }[];
}

async function upsertArtist(a: Spec) {
  await prisma.artist.upsert({ where: { slug: a.slug }, update: {}, create: { slug: a.slug, stageName: a.stageName, profileSummary: 'x', status: 'draft' } });
  const art = await prisma.artist.update({
    where: { slug: a.slug },
    data: {
      stageName: a.stageName, realName: a.realName ?? null, profileSummary: a.profileSummary,
      birthDate: a.birthDate ? D(a.birthDate) : null, birthPlace: a.birthPlace ?? null, agency: a.agency ?? null,
      officialSocialLinks: JSON.stringify([]),
      isSample: false, status: 'published', lastFactCheckedAt: NOW,
    },
  });
  await prisma.award.deleteMany({ where: { artistId: art.id } });
  if (a.awards.length) await prisma.award.createMany({ data: a.awards.map((w) => ({ artistId: art.id, year: w.year, title: w.title, org: w.org, sourceUrl: w.sourceUrl })) });
  await prisma.timelineEntry.deleteMany({ where: { artistId: art.id } });
  if (a.timeline.length) await prisma.timelineEntry.createMany({ data: a.timeline.map((t) => ({ artistId: art.id, date: D(t.date), title: t.title, description: t.description, sourceUrl: t.sourceUrl })) });
  await prisma.source.deleteMany({ where: { artistId: art.id } });
  await prisma.source.createMany({ data: a.sources.map((s) => ({ artistId: art.id, sourceTitle: s.t, sourcePublisher: s.p, sourceUrl: s.u, sourceGrade: s.g, factType: 'profile', verificationStatus: 'cross_checked', accessedAt: NOW })) });
  return art.id;
}

async function upsertSingle(slug: string, title: string, artistId: string, releaseDate: string | null, description: string, sourceUrl: string) {
  await prisma.music.upsert({ where: { slug }, update: {}, create: { slug, title, status: 'draft' } });
  const m = await prisma.music.update({ where: { slug }, data: { title, type: 'single', releaseDate: releaseDate ? D(releaseDate) : null, description, isSample: false, status: 'published', artists: { set: [{ id: artistId }] } } });
  await prisma.source.deleteMany({ where: { musicId: m.id } });
  await prisma.source.create({ data: { musicId: m.id, sourceTitle: `${title} 관련 자료`, sourcePublisher: '언론/백과', sourceUrl, sourceGrade: 'B', factType: 'release', verificationStatus: 'cross_checked', accessedAt: NOW } });
}

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'admin' }, orderBy: { createdAt: 'asc' } });

  const jhm = await upsertArtist({
    slug: 'joo-hyun-mi', stageName: '주현미',
    profileSummary: '주현미는 1961년 광주에서 태어난 대한민국의 대표적인 정통 트로트 가수로, 1985년 「비 내리는 영동교」로 데뷔했다. 「신사동 그 사람」, 「짝사랑」 등 1980~90년대를 대표하는 히트곡을 다수 남겼으며, 맑고 정확한 발성의 정통 트로트 창법으로 이미자의 계보를 잇는 가수로 평가받는다. 데뷔 이래 40년 가까이 꾸준히 활동하며 KBS 《가요무대》 등 무대에 오르고 있다.',
    birthDate: '1961-11-05', birthPlace: '광주광역시',
    awards: [
      { year: 1988, title: 'KBS 가요대상 대상', org: 'KBS', sourceUrl: 'https://ko.wikipedia.org/wiki/주현미' },
      { year: 1988, title: '골든디스크 대상', sourceUrl: 'https://ko.wikipedia.org/wiki/주현미' },
      { year: 2020, title: '제1회 트롯어워즈 트롯 100년 가왕상', sourceUrl: 'https://ko.wikipedia.org/wiki/주현미' },
    ],
    timeline: [
      { date: '1985-01-01', title: '「비 내리는 영동교」로 데뷔', sourceUrl: 'https://ko.wikipedia.org/wiki/주현미' },
      { date: '1988-01-01', title: '「신사동 그 사람」 발표', sourceUrl: 'https://ko.wikipedia.org/wiki/주현미' },
    ],
    sources: [
      { t: '주현미', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/주현미', g: 'B' },
      { t: '트로트의 현대화 일군 주현미', p: '리더스경제', u: 'https://www.rwn.co.kr/news/articleView.html?idxno=74641', g: 'B' },
    ],
  });

  const tja = await upsertArtist({
    slug: 'tae-jin-ah', stageName: '태진아', realName: '조방헌',
    profileSummary: '태진아(본명 조방헌)는 1953년 충북 보은에서 태어난 대한민국의 대표적인 남성 트로트 가수로, 1972년 데뷔했다. 오랜 무명기를 거쳐 1989년 「옥경이」로 크게 성공했고, 이후 「사모곡」, 「노란 손수건」, 「사랑은 아무나 하나」, 「동반자」 등 연속 히트곡을 내며 1990~2000년대 트로트 대중화를 이끌었다. 송대관과 함께 한 시대 남성 트로트를 대표하는 라이벌 구도로도 회자되며, 대한가수협회 회장을 지내는 등 가요계 활동에도 폭넓게 참여했다.',
    birthDate: '1953-02-16', birthPlace: '충청북도 보은', agency: '진아엔터테인먼트',
    awards: [
      { year: 2004, title: '「동반자」 지상파 가요 순위 장기 1위', sourceUrl: 'https://ko.wikipedia.org/wiki/태진아' },
      { year: 2010, title: '대한가수협회 회장 취임', sourceUrl: 'https://ko.wikipedia.org/wiki/태진아' },
    ],
    timeline: [
      { date: '1972-01-01', title: '「내 마음 급행열차」로 데뷔', sourceUrl: 'https://ko.wikipedia.org/wiki/태진아' },
      { date: '1989-01-01', title: '「옥경이」로 큰 성공', sourceUrl: 'https://ko.wikipedia.org/wiki/태진아' },
    ],
    sources: [
      { t: '태진아', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/태진아', g: 'B' },
      { t: '태진아의 음반 목록', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/태진아의_음반_목록', g: 'B' },
    ],
  });

  const sud = await upsertArtist({
    slug: 'seol-un-do', stageName: '설운도', realName: '이영춘',
    profileSummary: '설운도(본명 이영춘)는 1958년 부산 출신의 트로트 가수로, 1982년 KBS 《신인탄생》 우승을 계기로 데뷔했다. 1983년 「잃어버린 30년」이 이산가족 상봉 방송과 맞물려 크게 히트하며 입지를 다졌고, 이후 「다함께 차차차」, 「사랑의 트위스트」 등 흥겨운 리듬의 곡들로 폭넓은 인기를 얻었다. 현철·송대관·태진아와 함께 ‘트로트 4대 천왕’으로 불리며 성인가요계를 대표해 왔다.',
    birthDate: '1958-06-23', birthPlace: '부산광역시',
    awards: [
      { year: 1997, title: '한국방송대상 남자가수상', org: 'KBS', sourceUrl: 'https://ko.wikipedia.org/wiki/설운도' },
      { year: 2023, title: '대한민국 문화연예대상 성인가요 대상', sourceUrl: 'https://ko.wikipedia.org/wiki/설운도' },
    ],
    timeline: [
      { date: '1983-01-01', title: '「잃어버린 30년」 히트', sourceUrl: 'https://ko.wikipedia.org/wiki/설운도' },
      { date: '1991-01-01', title: '「다함께 차차차」 발표', sourceUrl: 'https://ko.wikipedia.org/wiki/설운도' },
    ],
    sources: [
      { t: '설운도', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/설운도', g: 'B' },
    ],
  });

  const sdk = await upsertArtist({
    slug: 'song-dae-kwan', stageName: '송대관',
    profileSummary: '송대관은 1946년 전북 정읍 출신의 트로트 가수로, 1967년 「인정많은 아저씨」로 데뷔했다. 1975년 「해뜰날」이 국민적 히트를 기록하며 대표 가수로 자리매김했고, 이후 「정 때문에」, 「네박자」, 「유행가」 등 세대를 아우르는 히트곡을 남겼다. 현철·태진아·설운도와 함께 ‘트로트 4대 천왕’으로 불리며 한국 성인가요를 대표한 인물로, 2025년 2월 7일 별세했다.',
    birthDate: '1946-06-02', birthPlace: '전라북도 정읍',
    awards: [
      { year: 1976, title: 'MBC 10대 가수가요제 최고가수상', org: 'MBC', sourceUrl: 'https://ko.wikipedia.org/wiki/송대관' },
      { year: 2020, title: '제1회 트롯어워즈 트롯 100년 가왕상', sourceUrl: 'https://ko.wikipedia.org/wiki/송대관' },
    ],
    timeline: [
      { date: '1975-01-01', title: '「해뜰날」 국민적 히트', sourceUrl: 'https://ko.wikipedia.org/wiki/송대관' },
      { date: '1998-01-01', title: '「네박자」 발표', sourceUrl: 'https://ko.wikipedia.org/wiki/송대관' },
      { date: '2025-02-07', title: '별세', sourceUrl: 'https://www.khan.co.kr/article/202502071059001' },
    ],
    sources: [
      { t: '송대관', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/송대관', g: 'B' },
      { t: '송대관 별세', p: '경향신문', u: 'https://www.khan.co.kr/article/202502071059001', g: 'B' },
      { t: "송대관 별세…'해뜰 날'·'네 박자'", p: 'YTN', u: 'https://www.ytn.co.kr/_ln/0106_202502071135504630', g: 'B' },
    ],
  });

  // 대표곡
  await upsertSingle('sinsadong', '신사동 그 사람', jhm, '1988-01-01', '주현미의 대표 히트곡.', 'https://ko.wikipedia.org/wiki/주현미');
  await upsertSingle('dongbanja', '동반자', tja, '2004-01-01', '태진아의 대표곡. 지상파 가요 순위에서 장기간 1위를 기록했다.', 'https://ko.wikipedia.org/wiki/태진아');
  await upsertSingle('lost-30-years', '잃어버린 30년', sud, '1983-01-01', '설운도의 데뷔 히트곡. 이산가족 상봉 방송과 맞물려 큰 반향을 얻었다.', 'https://ko.wikipedia.org/wiki/설운도');
  await upsertSingle('haetteulnal', '해뜰날', sdk, '1975-01-01', '송대관의 대표곡으로 국민적 히트를 기록했다.', 'https://ko.wikipedia.org/wiki/송대관');

  // ---------------- 심층글: 트로트 레전드 ----------------
  await upsertArticle('trot-legends', {
    type: 'guide',
    title: '트로트 레전드 — 세대를 만든 원로·전설의 가수들',
    seoTitle: '트로트 레전드 총정리: 남진·나훈아부터 4대 천왕까지',
    description: '남진·나훈아·이미자부터 주현미, 그리고 송대관·태진아·설운도·현철의 트로트 4대 천왕까지, 한국 트로트의 토대를 만든 원로·전설의 가수들을 정리했습니다.',
    excerpt: '한국 트로트의 토대를 만든 원로·전설 가수 총정리.',
    primaryKeyword: '트로트 레전드',
    searchIntent: '원로 트로트 가수와 대표곡 정리',
    authorId: admin?.id ?? null,
    body: LEGENDS_BODY,
    sources: [
      { t: '트로트', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/트로트', g: 'B' },
      { t: '송대관 별세', p: '경향신문', u: 'https://www.khan.co.kr/article/202502071059001', g: 'B' },
    ],
  });

  const [ar, mu, at] = await Promise.all([
    prisma.artist.count({ where: { status: 'published' } }),
    prisma.music.count({ where: { status: 'published' } }),
    prisma.article.count({ where: { status: 'published' } }),
  ]);
  console.log(`✔ 배치9 완료. published — 가수 ${ar}, 음반/곡 ${mu}, 기사 ${at}`);
}

async function upsertArticle(slug: string, a: { type: string; title: string; seoTitle: string; description: string; excerpt: string; primaryKeyword: string; searchIntent: string; body: string; authorId: string | null; sources: { t: string; p: string; u: string; g: string }[]; }) {
  await prisma.article.upsert({ where: { slug }, update: {}, create: { slug, type: a.type, title: a.title, description: a.description, body: a.body, status: 'draft' } });
  const art = await prisma.article.update({
    where: { slug },
    data: {
      type: a.type, title: a.title, seoTitle: a.seoTitle, description: a.description, excerpt: a.excerpt,
      primaryKeyword: a.primaryKeyword, searchIntent: a.searchIntent, body: a.body,
      status: 'published', index: true, riskLevel: 'low', isSample: false, autoGenerated: false,
      publishedAt: NOW, lastFactCheckedAt: NOW, nextReviewAt: new Date('2027-01-17'), authorId: a.authorId,
    },
  });
  await prisma.source.deleteMany({ where: { articleId: art.id } });
  await prisma.source.createMany({ data: a.sources.map((s) => ({ articleId: art.id, sourceTitle: s.t, sourcePublisher: s.p, sourceUrl: s.u, sourceGrade: s.g, factType: 'reference', verificationStatus: 'cross_checked', accessedAt: NOW })) });
}

const LEGENDS_BODY = [
  '> 백과·주요 언론으로 교차 확인한 사실만 정리했습니다. 원로 가수의 사생활·건강 관련 내용은 다루지 않습니다.',
  '',
  '오늘날의 트로트 열풍은 하루아침에 만들어진 것이 아닙니다. 수십 년에 걸쳐 장르의 토대를 다진 원로·전설의 가수들이 있었기에 가능했습니다. 이 글에서는 한국 트로트의 뼈대를 만든 대표적인 레전드들을 세대별로 정리합니다.',
  '',
  '## 전성기를 연 1960~70년대',
  '1960년대 트로트가 하나의 장르로 자리 잡는 과정에서 [남진](/artists/nam-jin)과 [나훈아](/artists/na-hoon-a)는 당대 남성 트로트를 양분하는 라이벌 구도를 형성했습니다. 남진의 「가슴 아프게」·「님과 함께」, 나훈아의 「사랑은 눈물의 씨앗」·「고향역」 등은 지금도 널리 불리는 고전입니다. 여성 쪽에서는 이미자가 「동백 아가씨」로 트로트의 대중적 저변을 크게 넓혔습니다.',
  '',
  '## 1980~90년대를 수놓은 목소리',
  '1980년대에는 [주현미](/artists/joo-hyun-mi)가 「비 내리는 영동교」·「신사동 그 사람」 등으로 정통 트로트의 계보를 이었습니다. 맑고 정확한 발성으로 ‘트로트의 여왕’으로 불린 그는 이 시기 여성 트로트를 대표했습니다.',
  '',
  '## 트로트 4대 천왕',
  '1990년대 이후 남성 트로트를 이야기할 때 빠지지 않는 것이 이른바 ‘트로트 4대 천왕’입니다. [송대관](/artists/song-dae-kwan)의 「해뜰날」·「네박자」, [태진아](/artists/tae-jin-ah)의 「옥경이」·「동반자」, [설운도](/artists/seol-un-do)의 「잃어버린 30년」·「다함께 차차차」, 그리고 현철의 「봉선화 연정」 등은 세대를 아우르는 히트곡으로 사랑받았습니다. 이들은 흥겨운 리듬과 친숙한 가사로 남녀노소가 함께 즐기는 트로트 무대를 정립했습니다. 이 가운데 송대관은 2025년 2월 별세했습니다.',
  '',
  '## 전설이 남긴 것',
  '이 원로·전설 가수들이 다진 토대 위에서 2019년 이후의 오디션 세대가 새로운 전성기를 열 수 있었습니다. 고전 명곡들은 오늘날 경연 무대에서 후배 가수들이 다시 부르며 세대를 잇고 있습니다. 각 가수의 상세 프로필과 대표곡은 [가수 목록](/artists)에서, 트로트라는 장르의 전체 흐름은 [트로트의 역사](/news/trot-history-deep)에서, 오늘날의 스타를 배출한 프로그램은 [트로트 오디션 프로그램 총정리](/news/trot-audition-programs)에서 이어서 확인할 수 있습니다.',
].join('\n');

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

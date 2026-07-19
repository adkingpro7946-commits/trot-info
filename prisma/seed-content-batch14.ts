/**
 * 콘텐츠 배치14 — 별사랑·마리아·박구윤·조명섭.
 * 교차검증 정정: 마리아=러시아(X)→미국 코네티컷(O)·현역가왕 TOP6(별사랑이 TOP7),
 *   박구윤 대표곡 '뽕따러 가세'(황금심 원곡)/'통금시간'/'나무같은 사람' 오귀속→제외(대표곡 '뿐이고'),
 *   조명섭 개명/본명 민감 이슈 배제, 출생지 '원주 출신으로 알려짐'.
 * 마리아는 검증된 오리지널 발매곡 없음 → 음반 미등록.
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const NOW = new Date('2026-07-17T00:00:00+09:00');
const D = (s: string) => new Date(s);

interface Spec {
  slug: string; stageName: string; realName?: string | null; profileSummary: string;
  birthDate?: string | null; birthPlace?: string | null; agency?: string | null; programSlugs?: string[];
  awards: { year: number; title: string; org?: string; sourceUrl?: string }[];
  timeline: { date: string; title: string; description?: string; sourceUrl?: string }[];
  sources: { t: string; p: string; u: string; g: string }[];
}

async function upsertArtist(a: Spec) {
  await prisma.artist.upsert({ where: { slug: a.slug }, update: {}, create: { slug: a.slug, stageName: a.stageName, profileSummary: 'x', status: 'draft' } });
  const programIds = a.programSlugs?.length
    ? (await prisma.program.findMany({ where: { slug: { in: a.programSlugs } }, select: { id: true } })).map((p) => ({ id: p.id }))
    : [];
  const art = await prisma.artist.update({
    where: { slug: a.slug },
    data: {
      stageName: a.stageName, realName: a.realName ?? null, profileSummary: a.profileSummary,
      birthDate: a.birthDate ? D(a.birthDate) : null, birthPlace: a.birthPlace ?? null, agency: a.agency ?? null,
      officialSocialLinks: JSON.stringify([]),
      isSample: false, status: 'published', lastFactCheckedAt: NOW,
      programs: { connect: programIds },
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
  const bsr = await upsertArtist({
    slug: 'byeol-sarang', stageName: '별사랑', realName: '윤정인',
    profileSummary: '별사랑(본명 윤정인)은 1992년생 대한민국 트로트 가수다. 2012년 록 보컬로 무대 경력을 쌓은 뒤 2017년 싱글 「눈물꽃」으로 트로트 가수로 정식 데뷔했다. 2021년 TV조선 《내일은 미스트롯2》에서 TOP6에 올라 이름을 알렸고, 이어 MBN 《현역가왕》에서 TOP7을 기록했다. 「돋보기」, 「십리벚꽃길」 등 밝고 경쾌한 트로트 곡을 발표하며 활동하고 있다.',
    birthDate: '1992-08-06', birthPlace: '전라북도 전주', agency: '엠케이에스이엔티',
    programSlugs: ['miss-trot', 'legendary-star'],
    awards: [
      { year: 2021, title: '《내일은 미스트롯2》 최종 6위(TOP6)', org: 'TV조선', sourceUrl: 'https://ko.wikipedia.org/wiki/별사랑' },
      { year: 2024, title: 'MBN 《현역가왕》 최종 7위(TOP7)', org: 'MBN', sourceUrl: 'https://sports.khan.co.kr/news/sk_index.html?art_id=202402140716003' },
    ],
    timeline: [{ date: '2017-01-01', title: '싱글 「눈물꽃」으로 트로트 데뷔', sourceUrl: 'https://ko.wikipedia.org/wiki/별사랑' }],
    sources: [
      { t: '별사랑', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/별사랑', g: 'B' },
      { t: "별사랑 '현역가왕' TOP7", p: '스포츠경향', u: 'https://sports.khan.co.kr/news/sk_index.html?art_id=202402140716003', g: 'B' },
    ],
  });

  const mria = await upsertArtist({
    slug: 'maria-trot', stageName: '마리아', realName: '마리아 엘리자베스 리스',
    profileSummary: '마리아(본명 마리아 엘리자베스 리스)는 2000년생 미국 코네티컷주 출신의 트로트 가수로, 한국에서 활동한다. 유창한 한국어와 안정적인 곡 소화력으로 2021년 TV조선 《내일은 미스트롯2》에서 외국인 최초로 준결승에 진출하며 주목받았다. 이후 MBN 《현역가왕》에 출연해 TOP6에 올랐다. 모리뮤직 소속으로 트로트를 중심으로 방송과 무대 활동을 이어가는 글로벌 트로트 가수로 소개된다.',
    birthDate: '2000-09-21', birthPlace: '미국 코네티컷', agency: '모리뮤직',
    programSlugs: ['miss-trot', 'legendary-star'],
    awards: [
      { year: 2021, title: '《내일은 미스트롯2》 외국인 최초 준결승 진출', org: 'TV조선', sourceUrl: 'https://ko.wikipedia.org/wiki/마리아_(미국의_가수)' },
      { year: 2024, title: 'MBN 《현역가왕》 최종 6위(TOP6)', org: 'MBN', sourceUrl: 'https://ko.wikipedia.org/wiki/마리아_(미국의_가수)' },
    ],
    timeline: [{ date: '2021-01-01', title: '《미스트롯2》 외국인 최초 준결승 진출', sourceUrl: 'https://ko.wikipedia.org/wiki/마리아_(미국의_가수)' }],
    sources: [
      { t: '마리아 (미국의 가수)', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/마리아_(미국의_가수)', g: 'B' },
      { t: "마리아 \"나는 '트로트필'이 있는 듯\"", p: 'SBS 뉴스', u: 'https://news.sbs.co.kr/news/endPage.do?news_id=N1006383348', g: 'B' },
    ],
  });

  const pgy = await upsertArtist({
    slug: 'park-gu-yoon', stageName: '박구윤',
    profileSummary: '박구윤은 2007년 ‘구윤’이라는 이름으로 데뷔한 뒤 2010년 발표한 「뿐이고」가 크게 히트하며 대표적인 중견 트로트 가수로 자리 잡았다. 이후 「두바퀴」, 「나무꾼」, 「별과 당신」, 「재충전」 등을 꾸준히 발표하며 활동을 이어오고 있다. 《나는 트로트 가수다》, 《현역가왕2》 등 트로트 경연에도 출연했으며, 흥겨운 정통 트로트 창법이 특징이다.',
    birthDate: '1982-07-29', birthPlace: '서울특별시',
    programSlugs: ['legendary-star'],
    awards: [
      { year: 2020, title: 'MBC every1 《나는 트로트 가수다》 왕중왕전 진출', org: 'MBC every1', sourceUrl: 'https://ko.wikipedia.org/wiki/박구윤' },
    ],
    timeline: [{ date: '2010-01-01', title: '「뿐이고」 히트', sourceUrl: 'https://music.bugs.co.kr/track/1895242' }],
    sources: [
      { t: '박구윤', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/박구윤', g: 'B' },
      { t: '뿐이고 / 박구윤', p: '벅스', u: 'https://music.bugs.co.kr/track/1895242', g: 'B' },
    ],
  });

  const jms = await upsertArtist({
    slug: 'jo-myung-seob', stageName: '조명섭',
    profileSummary: '조명섭은 1999년생 트로트 가수로, 강원도 원주 출신으로 알려져 있다. 2019년 KBS 《트로트가 좋아》 경연에서 현인·남인수 등의 옛 가요를 특유의 중저음과 클래식한 창법으로 불러 우승하며 데뷔했다. 우승 후 자작 타이틀곡 「강원도 아가씨」(2019)로 정식 데뷔했고, 이듬해 「백일홍」(2020)을 발표했다. 옛 가요를 되살리는 활동으로 ‘전통가요 지킴이’로 불린다.',
    birthPlace: '강원도 원주',
    awards: [
      { year: 2019, title: 'KBS 《트로트가 좋아》 최종 우승', org: 'KBS', sourceUrl: 'https://ko.wikipedia.org/wiki/조명섭' },
    ],
    timeline: [{ date: '2019-12-01', title: '데뷔 타이틀곡 「강원도 아가씨」 발표', sourceUrl: 'https://www.kado.net/news/articleView.html?idxno=1116317' }],
    sources: [
      { t: '조명섭', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/조명섭', g: 'B' },
      { t: '원주출신 가수 조명섭 정규앨범', p: '강원도민일보', u: 'https://www.kado.net/news/articleView.html?idxno=1116317', g: 'B' },
    ],
  });

  // 대표곡 (마리아는 검증된 오리지널 없음 → 미등록)
  await upsertSingle('nunmul-kkot', '눈물꽃', bsr, '2017-01-01', '별사랑의 트로트 데뷔 싱글.', 'https://ko.wikipedia.org/wiki/별사랑');
  await upsertSingle('ppunigo', '뿐이고', pgy, '2010-01-01', '박구윤의 대표 히트곡.', 'https://music.bugs.co.kr/track/1895242');
  await upsertSingle('gangwondo-agassi', '강원도 아가씨', jms, '2019-12-01', '조명섭이 직접 쓴 데뷔 타이틀곡.', 'https://www.kado.net/news/articleView.html?idxno=1116317');

  void mria;
  const [ar, mu] = await Promise.all([
    prisma.artist.count({ where: { status: 'published' } }),
    prisma.music.count({ where: { status: 'published' } }),
  ]);
  console.log(`✔ 배치14 완료. published — 가수 ${ar}, 음반/곡 ${mu}`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

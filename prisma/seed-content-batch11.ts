/**
 * 콘텐츠 배치11 — 신유·김수찬·남승민·황윤성·김용임·금잔디.
 * 교차검증 정정 반영: '여왕벌'/'마라마라'/'사랑에 빠지고 싶다' 등 오귀속 곡 제외,
 *   '사랑의 밧데리'→'사랑의 밧줄', '어부바'는 장윤정 곡이라 제외, 황윤성≠황영웅,
 *   남승민 보이스트롯 출연 근거 없음(제외).
 * 보수적: 검증 약한 소속사/ SNS 생략.
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
  const sy = await upsertArtist({
    slug: 'shin-yu', stageName: '신유', realName: '신동룡',
    profileSummary: '신유(본명 신동룡)는 1982년 서울 출신의 트로트 가수로, 2008년 앨범 《Luxury Trot of Shin Yu》로 데뷔했다. 데뷔곡 「시계바늘」이 크게 히트하며 이름을 알렸고, 이후 「꽃물」, 「일소일소 일노일노」, 「반」 등을 발표했다. 서정적이고 대중적인 트로트 발라드 스타일로 알려져 있다.',
    birthDate: '1982-11-10', birthPlace: '서울특별시', agency: '그레인엔터테인먼트',
    awards: [
      { year: 2010, title: '대한민국 연예예술상 신인상', sourceUrl: 'https://ko.wikipedia.org/wiki/신유_(가수)' },
      { year: 2014, title: 'MBC가요베스트 올해의 가수상', org: 'MBC', sourceUrl: 'https://ko.wikipedia.org/wiki/신유_(가수)' },
    ],
    timeline: [{ date: '2008-01-01', title: '「시계바늘」로 데뷔·히트', sourceUrl: 'https://ko.wikipedia.org/wiki/신유_(가수)' }],
    sources: [{ t: '신유 (가수)', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/신유_(가수)', g: 'B' }],
  });

  const ksc = await upsertArtist({
    slug: 'kim-su-chan', stageName: '김수찬',
    profileSummary: '김수찬은 1994년 인천 출신의 트로트 가수 겸 작사·작곡가로, 2012년 데뷔했다. 인천청소년가요제 대상 수상과 남진과의 인연을 계기로 활동을 시작했고, 「간다 간다」, 「평행선」, 「사랑의 해결사」 등을 발표했다. 2020년 TV조선 《내일은 미스터트롯》에 출연해 준결승까지 진출하며 전국적 인지도를 얻었다. 밝은 무대 매너로 ‘트로트 아이돌’로 불린다.',
    birthDate: '1994-11-18', birthPlace: '인천광역시',
    programSlugs: ['mr-trot'],
    awards: [
      { year: 2020, title: '《내일은 미스터트롯》 준결승 진출', org: 'TV조선', sourceUrl: 'https://www.hankookilbo.com/News/Read/202003061259350920' },
      { year: 2019, title: '소리바다 베스트 케이뮤직 어워즈 트로트 신인상', sourceUrl: 'https://ko.wikipedia.org/wiki/김수찬_(가수)' },
    ],
    timeline: [{ date: '2019-01-01', title: '「사랑의 해결사」 발표', sourceUrl: 'https://music.bugs.co.kr/track/31442557' }],
    sources: [
      { t: '김수찬 (가수)', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/김수찬_(가수)', g: 'B' },
      { t: '미스터트롯 준결승', p: '한국일보', u: 'https://www.hankookilbo.com/News/Read/202003061259350920', g: 'B' },
    ],
  });

  const nsm = await upsertArtist({
    slug: 'nam-seung-min', stageName: '남승민',
    profileSummary: '남승민은 2002년 경남 마산 출신의 트로트 가수로, 아역 배우로 먼저 데뷔한 뒤 트로트로 전향했다. 2020년 TV조선 《내일은 미스터트롯》으로 이름을 알렸고, 2022~2023년 MBN 《불타는 트롯맨》 최종 8위, 2024~2025년 TV조선 《내일은 미스터트롯3》 최종 5위를 기록하며 대표적인 젊은 세대 트로트 가수로 자리 잡았다. 대표곡으로 「트위스트 킹」 등이 있다.',
    birthDate: '2002-03-20', birthPlace: '경상남도 마산', agency: 'TME Group',
    programSlugs: ['mr-trot', 'burning-trotman'],
    awards: [
      { year: 2023, title: 'MBN 《불타는 트롯맨》 최종 8위', org: 'MBN', sourceUrl: 'https://ko.wikipedia.org/wiki/남승민_(2002년)' },
      { year: 2025, title: 'TV조선 《내일은 미스터트롯3》 최종 5위', org: 'TV조선', sourceUrl: 'https://news.nate.com/view/20250314n00370' },
    ],
    timeline: [{ date: '2025-03-14', title: '《미스터트롯3》 최종 5위', sourceUrl: 'https://news.nate.com/view/20250314n00370' }],
    sources: [
      { t: '남승민 (2002년)', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/남승민_(2002년)', g: 'B' },
      { t: "'미스터트롯3' 최종 순위", p: '네이트/스포츠경향', u: 'https://news.nate.com/view/20250314n00370', g: 'B' },
    ],
  });

  const hys = await upsertArtist({
    slug: 'hwang-yun-seong', stageName: '황윤성',
    profileSummary: '황윤성은 1996년 충북 청주 출신으로, 2015년 보이그룹 로미오의 메인보컬(‘윤성’)로 데뷔했다. 이후 트로트로 전향해 2020년 TV조선 《내일은 미스터트롯》 아이돌부와 트로트 그룹 미스터T로 활동했고, 2026년 MBN 《무명전설》에서 최종 4위에 올랐다. 아이돌과 트로트를 오간 이력이 특징이다. (《불타는 트롯맨》 출연자 황영웅과는 다른 인물이다.)',
    birthDate: '1996-03-19', birthPlace: '충청북도 청주', agency: '티엔터테인먼트',
    programSlugs: ['mr-trot'],
    awards: [
      { year: 2026, title: 'MBN 《무명전설》 최종 4위', org: 'MBN', sourceUrl: 'https://sports.khan.co.kr/article/202605141122003/' },
      { year: 2020, title: '《내일은 미스터트롯》 아이돌부 최종 11위', org: 'TV조선', sourceUrl: 'https://ko.wikipedia.org/wiki/윤성_(1996년)' },
    ],
    timeline: [{ date: '2026-05-14', title: '《무명전설》 최종 4위', sourceUrl: 'https://sports.khan.co.kr/article/202605141122003/' }],
    sources: [
      { t: '윤성 (1996년)', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/윤성_(1996년)', g: 'B' },
      { t: "'무명전설' 황윤성 최종 4위", p: '스포츠경향', u: 'https://sports.khan.co.kr/article/202605141122003/', g: 'B' },
    ],
  });

  const kyi = await upsertArtist({
    slug: 'kim-yong-im', stageName: '김용임',
    profileSummary: '김용임은 1965년 전북 익산 출신의 트로트 가수로, 1984년 발라드 「목련」으로 데뷔한 뒤 트로트로 전향했다. 여러 예명을 거치며 오랜 무명기를 보냈고, 2003년 「사랑의 밧줄」이 크게 히트하며 정통 트로트 여가수로 자리 잡았다. 이후 「부초같은 인생」, 「나이야 가라」 등으로 꾸준한 인기를 이어갔으며, 2020년 《나는 트로트 가수다》 우승 등으로 중견 가수의 입지를 굳혔다.',
    birthDate: '1965-12-27', birthPlace: '전라북도 익산',
    programSlugs: ['miss-trot'],
    awards: [
      { year: 2020, title: 'MBC every1 《나는 트로트 가수다》 최종 우승', org: 'MBC every1', sourceUrl: 'https://ko.wikipedia.org/wiki/김용임' },
      { year: 2020, title: '제1회 트롯어워즈 여자 베스트 가수상', sourceUrl: 'https://ko.wikipedia.org/wiki/김용임' },
    ],
    timeline: [{ date: '2003-01-01', title: '「사랑의 밧줄」 히트', sourceUrl: 'https://music.bugs.co.kr/track/2450832' }],
    sources: [
      { t: '김용임', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/김용임', g: 'B' },
      { t: '사랑의 밧줄 / 김용임', p: '벅스', u: 'https://music.bugs.co.kr/track/2450832', g: 'B' },
    ],
  });

  const gjd = await upsertArtist({
    slug: 'geum-jan-di', stageName: '금잔디', realName: '박수연',
    profileSummary: '금잔디(본명 박수연)는 1979년 강원 홍천 출신의 트로트 가수로, 2000년 데뷔했다. 여러 예명을 거쳐 2010년 ‘금잔디’로 개명했고, 2011년 발표한 「오라버니」가 이듬해 전국적으로 히트하며 오랜 무명기를 청산했다. 경쾌한 무대와 활발한 행사 활동으로 대중적 인지도를 쌓았으며, 트로트 시상식에서 여자가수 부문 수상 이력이 있다.',
    birthDate: '1979-05-15', birthPlace: '강원도 홍천',
    awards: [
      { year: 2014, title: '대한민국 전통가요대상 여자가수부문 우수상', sourceUrl: 'https://ko.wikipedia.org/wiki/금잔디_(가수)' },
    ],
    timeline: [{ date: '2011-01-01', title: '「오라버니」 발표 (이듬해 전국 히트)', sourceUrl: 'https://music.bugs.co.kr/track/30229981' }],
    sources: [
      { t: '금잔디 (가수)', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/금잔디_(가수)', g: 'B' },
      { t: '오라버니 / 금잔디', p: '벅스', u: 'https://music.bugs.co.kr/track/30229981', g: 'B' },
    ],
  });

  // 대표곡 (검증된 것만)
  await upsertSingle('watch-hand', '시계바늘', sy, '2008-01-01', '신유의 데뷔 히트곡.', 'https://ko.wikipedia.org/wiki/신유_(가수)');
  await upsertSingle('love-solver', '사랑의 해결사', ksc, '2019-01-01', '김수찬의 발매곡.', 'https://music.bugs.co.kr/track/31442557');
  await upsertSingle('twist-king', '트위스트 킹', nsm, '2020-01-01', '남승민의 대표곡.', 'https://ko.wikipedia.org/wiki/남승민_(2002년)');
  await upsertSingle('love-rope', '사랑의 밧줄', kyi, '2003-01-01', '김용임의 최대 히트곡.', 'https://music.bugs.co.kr/track/2450832');
  await upsertSingle('orabeoni', '오라버니', gjd, '2011-01-01', '금잔디의 대표곡. 발표 이듬해 전국적으로 히트했다.', 'https://music.bugs.co.kr/track/30229981');

  const [ar, mu] = await Promise.all([
    prisma.artist.count({ where: { status: 'published' } }),
    prisma.music.count({ where: { status: 'published' } }),
  ]);
  console.log(`✔ 배치11 완료. published — 가수 ${ar}, 음반/곡 ${mu}`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

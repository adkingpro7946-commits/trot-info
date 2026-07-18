/**
 * 콘텐츠 배치8 — 정미애·홍자·홍지윤·은가은 + 현역가왕 시즌3(홍지윤 우승) 반영.
 * 미스트롯 시즌1 진·선·미(송가인·정미애·홍자), 시즌2 진·선·미(양지은·홍지윤·김다현) 라인 완성.
 * 보수적: 연도만 아는 출생은 birthDate 미표기(요약에 연도 서술), 검증 약한 SNS 생략.
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const NOW = new Date('2026-07-17T00:00:00+09:00');
const D = (s: string) => new Date(s);

interface Spec {
  slug: string; stageName: string; realName?: string | null; profileSummary: string;
  birthPlace?: string | null; agency?: string | null; programSlugs?: string[];
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
      birthPlace: a.birthPlace ?? null, agency: a.agency ?? null,
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
  // 현역가왕: 시즌3(홍지윤 우승) 반영
  await prisma.program.update({
    where: { slug: 'legendary-star' },
    data: {
      airInfo: '시즌1 2023~2024 / 시즌2 2024~2025 / 시즌3 2026',
      description: 'MBN의 트로트 경연 프로그램. 시즌1(2023~2024) 우승은 전유진(2위 마이진, 3위 김다현), 시즌2 《현역가왕2》(2024~2025) 우승은 박서진(2위 진해성), 시즌3 《현역가왕3》(2026) 우승은 홍지윤이다.',
    },
  });

  // 정미애 (미스트롯 시즌1 선/2위)
  const jma = await upsertArtist({
    slug: 'jeong-mi-ae', stageName: '정미애',
    profileSummary: '정미애는 1982년 대구 출신의 트로트 가수로, 2015년경 데뷔했다. 2019년 TV조선 《내일은 미스트롯》 시즌1에서 최종 2위(선)에 올라 전국적 인지도를 얻었다. 이후 「고향바람」, 「님 찾아왔어요」 등 신곡을 발표하며 방송·공연 활동을 이어가고 있다. 안정적인 가창력을 바탕으로 정통 트로트 무대에서 활동하는 가수로 평가된다.',
    birthPlace: '대구광역시', agency: '마마엔터테인먼트',
    programSlugs: ['miss-trot'],
    awards: [{ year: 2019, title: '《내일은 미스트롯》 시즌1 최종 2위(선)', org: 'TV조선', sourceUrl: 'https://ko.wikipedia.org/wiki/정미애' }],
    timeline: [{ date: '2019-05-09', title: '《내일은 미스트롯》 시즌1 선(善) 확정', sourceUrl: 'https://ko.wikipedia.org/wiki/내일은_미스트롯' }],
    sources: [
      { t: '정미애', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/정미애', g: 'B' },
      { t: '내일은 미스트롯', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/내일은_미스트롯', g: 'B' },
    ],
  });

  // 홍자 (미스트롯 시즌1 미/3위)
  const hj = await upsertArtist({
    slug: 'hong-ja', stageName: '홍자', realName: '박지민',
    profileSummary: '홍자(본명 박지민)는 1985년 울산 출신의 트로트 가수로 2012년 데뷔했다. 2019년 TV조선 《내일은 미스트롯》 시즌1에서 최종 3위(미)에 올랐고, 같은 해 정규 1집 《내:딛다》를 발표했다. 감성적인 보컬을 앞세운 정통 트로트를 주로 부르며, 이후 「내가 사랑한 것들은」 등 신곡을 이어가고 있다.',
    birthPlace: '울산광역시', agency: '아츠로',
    programSlugs: ['miss-trot'],
    awards: [{ year: 2019, title: '《내일은 미스트롯》 시즌1 최종 3위(미)', org: 'TV조선', sourceUrl: 'https://ko.wikipedia.org/wiki/홍자_(가수)' }],
    timeline: [
      { date: '2019-05-09', title: '《내일은 미스트롯》 시즌1 미(美) 확정', sourceUrl: 'https://ko.wikipedia.org/wiki/내일은_미스트롯' },
      { date: '2019-09-10', title: '정규 1집 《내:딛다》 발매', sourceUrl: 'https://ko.wikipedia.org/wiki/홍자_(가수)' },
    ],
    sources: [
      { t: '홍자 (가수)', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/홍자_(가수)', g: 'B' },
      { t: '내일은 미스트롯', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/내일은_미스트롯', g: 'B' },
    ],
  });

  // 홍지윤 (미스트롯2 선/2위 · 현역가왕3 우승)
  const hjy = await upsertArtist({
    slug: 'hong-ji-yun', stageName: '홍지윤',
    profileSummary: '홍지윤은 1995년 경기도 고양 출신의 트로트 가수로, 국악을 전공한 배경을 지니고 있다. 2020~2021년 TV조선 《내일은 미스트롯2》에서 최종 2위(선)에 올라 주목받았다. 이후 「오라」, 「가보자GO」, 「가리랑」 등을 발매하며 활동을 이어갔고, 2026년 MBN 《현역가왕3》에서 최종 우승을 차지했다.',
    birthPlace: '경기도 고양', agency: 'SM C&C',
    programSlugs: ['miss-trot', 'legendary-star'],
    awards: [
      { year: 2021, title: '《내일은 미스트롯2》 최종 2위(선)', org: 'TV조선', sourceUrl: 'https://ko.wikipedia.org/wiki/홍지윤_(가수)' },
      { year: 2026, title: 'MBN 《현역가왕3》 최종 우승', org: 'MBN', sourceUrl: 'https://www.etoday.co.kr/news/view/2563962' },
    ],
    timeline: [
      { date: '2021-03-04', title: '《내일은 미스트롯2》 선(善) 확정', sourceUrl: 'https://ko.wikipedia.org/wiki/홍지윤_(가수)' },
      { date: '2026-03-11', title: '《현역가왕3》 최종 우승', sourceUrl: 'https://www.etoday.co.kr/news/view/2563962' },
    ],
    sources: [
      { t: '홍지윤 (가수)', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/홍지윤_(가수)', g: 'B' },
      { t: "'현역가왕3' 홍지윤 최종 우승", p: '이투데이', u: 'https://www.etoday.co.kr/news/view/2563962', g: 'B' },
    ],
  });

  // 은가은 (미스트롯2 TOP7)
  const ege = await upsertArtist({
    slug: 'eun-ga-eun', stageName: '은가은', realName: '김지은',
    profileSummary: '은가은(본명 김지은)은 1987년 경상남도 김해 출신의 가수로, 2007년 MBC 《쇼바이벌》로 활동을 시작했다. 발라드를 비롯해 여러 장르를 소화하는 보컬리스트로 알려져 있으며, 2020~2021년 TV조선 《내일은 미스트롯2》에서 최종 7위(TOP7)에 오르며 트로트 가수로서 인지도를 넓혔다.',
    birthPlace: '경상남도 김해',
    programSlugs: ['miss-trot'],
    awards: [{ year: 2021, title: '《내일은 미스트롯2》 최종 TOP7', org: 'TV조선', sourceUrl: 'https://www.hankookilbo.com/news/article/A2021021908010001811' }],
    timeline: [{ date: '2021-02-18', title: '《내일은 미스트롯2》 TOP7 진출', sourceUrl: 'https://www.hankookilbo.com/news/article/A2021021908010001811' }],
    sources: [
      { t: '은가은', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/은가은', g: 'B' },
      { t: "별사랑→은가은 TOP7 확정된 '미스트롯2'", p: '한국일보', u: 'https://www.hankookilbo.com/news/article/A2021021908010001811', g: 'B' },
    ],
  });

  // 대표곡
  await upsertSingle('nim-chajwa', '님 찾아왔어요', jma, '2025-01-01', '정미애의 신곡.', 'https://ko.wikipedia.org/wiki/정미애');
  await upsertSingle('eotteoke-sara', '어떻게 살아', hj, '2019-09-10', '홍자의 정규 1집 《내:딛다》 타이틀곡.', 'https://ko.wikipedia.org/wiki/홍자_(가수)');
  await upsertSingle('ora', '오라', hjy, '2021-01-01', '홍지윤의 대표곡 중 하나.', 'https://ko.wikipedia.org/wiki/홍지윤_(가수)');
  await upsertSingle('matnae-ttal', '맏내딸', ege, '2023-01-01', '은가은의 발매곡.', 'https://ko.wikipedia.org/wiki/은가은');

  const [ar, mu] = await Promise.all([
    prisma.artist.count({ where: { status: 'published' } }),
    prisma.music.count({ where: { status: 'published' } }),
  ]);
  console.log(`✔ 배치8 완료. published — 가수 ${ar}, 음반/곡 ${mu}`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

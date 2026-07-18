/**
 * 콘텐츠 배치7 — 진해성·박서진·김다현·마이진 + 현역가왕 프로그램(시즌2 반영).
 * 교차검증으로 정정된 사항 반영:
 *  - 김다현: 2007년생(X)→2009년생(O), 출생 충북 진천(성장 경남 하동 청학동)
 *  - 진해성 ≠ 진성(안동역에서는 진성 곡), 박서진=현역가왕2 우승(미스터트롯2는 탈락)
 * 보수적: 마이진 소속사 미확인→생략, 검증 안 된 SNS 생략(마이진/박서진)
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const NOW = new Date('2026-07-17T00:00:00+09:00');
const D = (s: string) => new Date(s);

interface Spec {
  slug: string; stageName: string; realName?: string | null; profileSummary: string;
  birthDate?: string | null; birthPlace?: string | null; agency?: string | null; fanClubName?: string | null;
  social?: { label: string; url: string }[]; programSlugs?: string[];
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
      birthDate: a.birthDate ? D(a.birthDate) : null, birthPlace: a.birthPlace ?? null,
      agency: a.agency ?? null, fanClubName: a.fanClubName ?? null,
      officialSocialLinks: JSON.stringify(a.social ?? []),
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
  // 현역가왕 프로그램: 시즌2까지 반영
  await prisma.program.update({
    where: { slug: 'legendary-star' },
    data: {
      airInfo: '시즌1 2023~2024 / 시즌2(현역가왕2) 2024~2025',
      description: 'MBN의 트로트 경연 프로그램. 시즌1(2023~2024)에서는 전유진이 제1대 우승을 차지했고(2위 마이진, 3위 김다현), 시즌2 《현역가왕2》(2024~2025)에서는 박서진이 우승했다(2위 진해성).',
    },
  });

  // 진해성
  const jhs = await upsertArtist({
    slug: 'jin-hae-seong', stageName: '진해성', realName: '이상성',
    profileSummary: '진해성은 2012년 「내 사랑 받아줘」로 데뷔한 트로트 가수로, 2020년 KBS 《트롯 전국체전》 우승으로 존재감을 알렸다. 2023년 TV조선 《내일은 미스터트롯2》에서 최종 3위(미)에 올랐고, 2024~2025년 MBN 《현역가왕2》에서 준우승(2위)을 기록했다. 이후 미니앨범 《愛人》(2025) 등 신곡 활동을 이어가고 있다. (안동역에서의 원곡 가수 「진성」과는 다른 인물이다.)',
    birthDate: '1990-06-04', birthPlace: '부산광역시', agency: 'KDH엔터테인먼트',
    social: [{ label: '공식 인스타그램', url: 'https://www.instagram.com/haeseongjin' }],
    programSlugs: ['mr-trot', 'legendary-star'],
    awards: [
      { year: 2023, title: '《내일은 미스터트롯2》 최종 3위(미)', org: 'TV조선', sourceUrl: 'https://www.fnnews.com/news/202312201850032934' },
      { year: 2025, title: 'MBN 《현역가왕2》 준우승(2위)', org: 'MBN', sourceUrl: 'https://www.mt.co.kr/entertainment/2025/02/26/2025022605182873509' },
      { year: 2020, title: 'KBS 《트롯 전국체전》 우승', org: 'KBS', sourceUrl: 'https://ko.wikipedia.org/wiki/진해성' },
    ],
    timeline: [
      { date: '2012-01-01', title: '「내 사랑 받아줘」로 데뷔', sourceUrl: 'https://ko.wikipedia.org/wiki/진해성' },
      { date: '2025-02-26', title: '《현역가왕2》 준우승', sourceUrl: 'https://www.mt.co.kr/entertainment/2025/02/26/2025022605182873509' },
    ],
    sources: [
      { t: '진해성', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/진해성', g: 'B' },
      { t: "'현역가왕2' 종영…최종 순위", p: '머니투데이', u: 'https://www.mt.co.kr/entertainment/2025/02/26/2025022605182873509', g: 'B' },
    ],
  });

  // 박서진 (미스터트롯2는 탈락 → mr-trot 미연결)
  const psj = await upsertArtist({
    slug: 'park-seo-jin', stageName: '박서진', realName: '박효빈',
    profileSummary: '박서진은 어릴 때부터 장구를 다뤄 ‘장구의 신’으로 불리는 트로트 가수로, 2013년 「꿈」으로 데뷔했다. 2017년 KBS 《아침마당》 5연승과 2018년 「밀어밀어」로 대중적 인지도를 얻었고, 2025년 MBN 《현역가왕2》에서 최종 우승해 제2대 현역가왕에 올랐다. 장구를 활용한 무대 퍼포먼스가 대표적 특징이다.',
    birthDate: '1995-08-21', birthPlace: '경상남도 사천', fanClubName: '닻별',
    programSlugs: ['legendary-star'],
    awards: [
      { year: 2025, title: 'MBN 《현역가왕2》 최종 우승 (제2대)', org: 'MBN', sourceUrl: 'https://www.news1.kr/entertain/broadcast-tv/5701270' },
      { year: 2025, title: 'KBS 연예대상 리얼리티부문 남자 최우수상', org: 'KBS', sourceUrl: 'https://ko.wikipedia.org/wiki/박서진_(1995년)' },
    ],
    timeline: [
      { date: '2013-01-01', title: '싱글 「꿈」으로 데뷔', sourceUrl: 'https://ko.wikipedia.org/wiki/박서진_(1995년)' },
      { date: '2018-01-01', title: '「밀어밀어」 전국적 히트', sourceUrl: 'https://ko.wikipedia.org/wiki/박서진_(1995년)' },
      { date: '2025-02-26', title: '《현역가왕2》 최종 우승', sourceUrl: 'https://www.news1.kr/entertain/broadcast-tv/5701270' },
    ],
    sources: [
      { t: '박서진 (1995년)', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/박서진_(1995년)', g: 'B' },
      { t: "'현역가왕2' 우승은 박서진", p: '뉴스1', u: 'https://www.news1.kr/entertain/broadcast-tv/5701270', g: 'B' },
    ],
  });

  // 김다현 (미성년자 — 음악 활동만, 생년/성장지 정정 반영)
  const kdh = await upsertArtist({
    slug: 'kim-da-hyun', stageName: '김다현',
    profileSummary: '김다현은 2009년생 국악 기반 트로트 가수로, 어린 시절 판소리를 배우며 ‘국악소녀’로 알려졌다. 2020년 MBN 《보이스트롯》 최연소 준우승에 이어 TV조선 《내일은 미스트롯2》에서 최종 3위(미)에 올라 전국적 인지도를 얻었다. 이후 2023~2024년 MBN 《현역가왕》에도 출연해 최종 3위를 기록했다. 국악 창법을 접목한 트로트 무대로 폭넓은 세대의 지지를 받고 있다.',
    birthDate: '2009-02-23', birthPlace: '충청북도 진천 (경남 하동 청학동에서 성장)', agency: '그레인 엔터테인먼트',
    social: [
      { label: '공식 인스타그램', url: 'https://www.instagram.com/da_hyun_0223/' },
      { label: '유튜브 김다현TV', url: 'https://www.youtube.com/@da-hyunTV' },
    ],
    programSlugs: ['miss-trot', 'legendary-star'],
    awards: [
      { year: 2021, title: '《내일은 미스트롯2》 최종 3위(미)', org: 'TV조선', sourceUrl: 'https://ko.wikipedia.org/wiki/김다현_(가수)' },
      { year: 2020, title: 'MBN 《보이스트롯》 준우승', org: 'MBN', sourceUrl: 'https://ko.wikipedia.org/wiki/김다현_(가수)' },
    ],
    timeline: [
      { date: '2020-09-25', title: '솔로 데뷔곡 「꽃처녀」 발매', sourceUrl: 'https://ko.wikipedia.org/wiki/김다현_(가수)' },
      { date: '2021-03-04', title: '《내일은 미스트롯2》 최종 3위(미)', sourceUrl: 'https://ko.wikipedia.org/wiki/김다현_(가수)' },
    ],
    sources: [
      { t: '김다현 (가수)', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/김다현_(가수)', g: 'B' },
      { t: "'2009년생' 김다현", p: 'OSEN', u: 'http://www.osen.co.kr/article/G1112840729', g: 'B' },
    ],
  });

  // 마이진 (소속사·SNS 미확인 → 생략)
  const mj = await upsertArtist({
    slug: 'mai-jin', stageName: '마이진', realName: '김화진',
    profileSummary: '마이진(본명 김화진)은 1987년 서울 출생의 트로트 가수로, 2013년 데뷔 후 오랜 무명·행사 무대 활동을 이어왔다. 2023~2024년 MBN 《현역가왕》에서 우승자 전유진에 이어 최종 2위(준우승)를 차지하며 대중적 인지도를 크게 높였다. 이후 《한일가왕전》 등 후속 프로그램에도 출연했다. 「세월아 멈춰라」, 「사모애」 등을 대표곡으로 꾸준히 무대에 서고 있다.',
    birthDate: '1987-01-27', birthPlace: '서울특별시',
    programSlugs: ['legendary-star'],
    awards: [
      { year: 2024, title: 'MBN 《현역가왕》 준우승(2위)', org: 'MBN', sourceUrl: 'https://www.newsis.com/view/NISX20240214_0002625478' },
    ],
    timeline: [
      { date: '2013-01-01', title: '싱글 「짝사랑하나봐」로 데뷔', sourceUrl: 'https://ko.wikipedia.org/wiki/마이진_(트로트_가수)' },
      { date: '2024-02-13', title: '《현역가왕》 준우승', sourceUrl: 'https://www.newsis.com/view/NISX20240214_0002625478' },
    ],
    sources: [
      { t: '마이진 (트로트 가수)', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/마이진_(트로트_가수)', g: 'B' },
      { t: "전유진 '현역가왕' 우승, 2위 마이진", p: '뉴시스', u: 'https://www.newsis.com/view/NISX20240214_0002625478', g: 'B' },
    ],
  });

  // 대표곡
  await upsertSingle('sarangege', '사랑에게', jhs, '2023-10-19', '진해성의 대표곡 중 하나.', 'https://music.bugs.co.kr/artist/80124075');
  await upsertSingle('mireo-mireo', '밀어밀어', psj, '2018-01-01', '박서진의 전국적 히트곡.', 'https://ko.wikipedia.org/wiki/박서진_(1995년)');
  await upsertSingle('kkot-cheonyeo', '꽃처녀', kdh, '2020-09-25', '김다현의 솔로 데뷔곡.', 'https://ko.wikipedia.org/wiki/김다현_(가수)');
  await upsertSingle('sewol-a', '세월아 멈춰라', mj, '2019-01-01', '마이진의 대표곡.', 'https://music.bugs.co.kr/album/20264894');

  const [ar, pg, mu] = await Promise.all([
    prisma.artist.count({ where: { status: 'published' } }),
    prisma.program.count({ where: { status: 'published' } }),
    prisma.music.count({ where: { status: 'published' } }),
  ]);
  console.log(`✔ 배치7 완료. published — 가수 ${ar}, 프로그램 ${pg}, 음반/곡 ${mu}`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

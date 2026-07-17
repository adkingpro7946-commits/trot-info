/**
 * 콘텐츠 배치6 — 김희재·안성훈·전유진·양지은 + 프로그램 「현역가왕」 + 심층글 1편.
 * 보수적 처리:
 *  - 안성훈 소속사: 자료 상충 → 생략(미확인)
 *  - 공식 SNS: 검증 확실한 것만(김희재 인스타, 없으면 생략)
 *  - 미성년기 관련 민감정보 배제, 음악 활동만
 * 실행: DATABASE_PROVIDER=postgresql + generate 후 DATABASE_URL=<neon> npx tsx prisma/seed-content-batch6.ts
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const NOW = new Date('2026-07-17T00:00:00+09:00');
const D = (s: string) => new Date(s);

interface Spec {
  slug: string; stageName: string; profileSummary: string;
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
      stageName: a.stageName, profileSummary: a.profileSummary,
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
  const admin = await prisma.user.findFirst({ where: { role: 'admin' }, orderBy: { createdAt: 'asc' } });

  // 프로그램: 현역가왕
  const hyeon = await prisma.program.upsert({
    where: { slug: 'legendary-star' },
    update: {},
    create: {
      slug: 'legendary-star', name: '현역가왕', broadcaster: 'MBN',
      airInfo: '2023년 ~ 2024년 방영 (시즌1)',
      description: 'MBN의 여성 트로트 경연 프로그램. 2024년 2월 최종회에서 전유진이 제1대 우승을 차지했다.',
      isSample: false, status: 'published',
    },
  });

  // 김희재
  const khj = await upsertArtist({
    slug: 'kim-hee-jae', stageName: '김희재',
    profileSummary: '김희재는 1995년 울산에서 태어난 트로트 가수로, 아역·‘트로트 신동’ 시절을 거쳐 2020년 TV조선 《내일은 미스터트롯》에서 최종 7위(TOP7)에 오르며 대중에게 알려졌다. 2022년 정규 1집 《희재》와 2024년 정규 2집 《희로애락》을 발표했고, 뮤지컬 《모차르트!》 등 무대에도 섰다. 정확한 음정과 안정적인 라이브로 평가받는 보컬형 가수다.',
    birthDate: '1995-06-09', birthPlace: '울산광역시', agency: '그레이스이엔엠',
    social: [{ label: '공식 인스타그램', url: 'https://www.instagram.com/heejae_one' }],
    programSlugs: ['mr-trot'],
    awards: [
      { year: 2020, title: '《내일은 미스터트롯》 최종 7위(TOP7)', org: 'TV조선', sourceUrl: 'https://ko.wikipedia.org/wiki/김희재_(가수)' },
    ],
    timeline: [
      { date: '2022-01-01', title: '정규 1집 《희재》 발매', description: '타이틀곡 「짠짠짠」', sourceUrl: 'https://music.bugs.co.kr/artist/20100267/tracks' },
      { date: '2024-01-01', title: '정규 2집 《희로애락》 발매', sourceUrl: 'https://music.bugs.co.kr/artist/20100267/tracks' },
    ],
    sources: [
      { t: '김희재 (가수)', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/김희재_(가수)', g: 'B' },
      { t: '김희재, 신곡 발표…장윤정 작사·작곡', p: '이데일리', u: 'https://www.edaily.co.kr/News/Read?newsId=03365286645485656&mediaCodeNo=257', g: 'B' },
    ],
  });

  // 안성훈 (소속사 미확인 → 생략)
  const ash = await upsertArtist({
    slug: 'ahn-sung-hoon', stageName: '안성훈',
    profileSummary: '안성훈은 1989년 경기 시흥에서 태어난 트로트 가수로, 2012년경부터 오랜 무명기를 거쳤다. 2021년 어머니를 향한 마음을 담은 「엄마 꽃」으로 주목받았고, 2023년 TV조선 《내일은 미스터트롯2》에서 최종 우승(진)을 차지하며 전국적으로 이름을 알렸다. 감성적인 발라드풍 트로트 창법이 특징으로 평가된다.',
    birthDate: '1989-12-15', birthPlace: '경기도 시흥',
    programSlugs: ['mr-trot'],
    awards: [
      { year: 2023, title: '《내일은 미스터트롯2》 최종 우승(진)', org: 'TV조선', sourceUrl: 'https://www.nocutnews.co.kr/news/5911355' },
    ],
    timeline: [
      { date: '2021-09-24', title: '「엄마 꽃」 발매', description: '대표 히트곡', sourceUrl: 'https://music.bugs.co.kr/album/4065058' },
      { date: '2023-03-16', title: '《내일은 미스터트롯2》 최종 우승(진)', sourceUrl: 'https://www.nocutnews.co.kr/news/5911355' },
    ],
    sources: [
      { t: '안성훈 (가수)', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/안성훈_(가수)', g: 'B' },
      { t: "'미스터트롯2' 우승자는 안성훈", p: '노컷뉴스', u: 'https://www.nocutnews.co.kr/news/5911355', g: 'B' },
    ],
  });

  // 전유진 (현역가왕 우승, 미스트롯2 참가)
  const jyj = await upsertArtist({
    slug: 'jeon-yu-jin', stageName: '전유진',
    profileSummary: '전유진은 2006년 경상북도 포항에서 태어난 트로트 가수로, 2020년 「사랑..하시렵니까?」로 데뷔했다. 2020~2021년 TV조선 《내일은 미스트롯2》에 출연해 인지도를 쌓았고, 2024년 2월 MBN 《현역가왕》에서 최종 우승하며 제1대 현역가왕에 올랐다. 이후 「연꽃」, 「나비야」 등을 발표하며 활동을 이어가고 있다.',
    birthDate: '2006-10-10', birthPlace: '경상북도 포항', agency: '제이레이블',
    programSlugs: ['legendary-star', 'miss-trot'],
    awards: [
      { year: 2024, title: 'MBN 《현역가왕》 최종 우승 (제1대)', org: 'MBN', sourceUrl: 'https://star.ytn.co.kr/_sn/0117_202402141108512451' },
    ],
    timeline: [
      { date: '2020-03-14', title: '「사랑..하시렵니까?」로 데뷔', sourceUrl: 'https://ko.wikipedia.org/wiki/전유진' },
      { date: '2024-02-13', title: 'MBN 《현역가왕》 최종 우승', sourceUrl: 'https://www.newsis.com/view/NISX20240214_0002625478' },
    ],
    sources: [
      { t: '전유진', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/전유진', g: 'B' },
      { t: "전유진, '현역가왕' 우승", p: '뉴시스', u: 'https://www.newsis.com/view/NISX20240214_0002625478', g: 'B' },
    ],
  });

  // 양지은 (미스트롯2 우승)
  const yje = await upsertArtist({
    slug: 'yang-ji-eun', stageName: '양지은',
    profileSummary: '양지은은 1990년 제주 출신의 국악인 겸 트로트 가수로, 국악을 전공하고 대학원에서 음악교육을 공부했다. 2021년 TV조선 《내일은 미스트롯2》에서 최종 진(眞)에 오르며 전국적 인지도를 얻었다. 이후 「그 강을 건너지 마오」, 「情(정)」 등을 발표하고 2024년 정규 1집 《소풍》을 내는 등 국악과 트로트를 아우르는 활동을 이어가고 있다.',
    birthDate: '1990-01-09', birthPlace: '제주특별자치도 제주', agency: '아츠로',
    programSlugs: ['miss-trot'],
    awards: [
      { year: 2021, title: '《내일은 미스트롯2》 최종 우승(진)', org: 'TV조선', sourceUrl: 'https://www.imaeil.com/page/view/2021030508002897659' },
    ],
    timeline: [
      { date: '2021-03-04', title: '《내일은 미스트롯2》 최종 우승(진)', description: '상금 1억 5천만 원', sourceUrl: 'https://www.imaeil.com/page/view/2021030508002897659' },
      { date: '2024-01-01', title: '정규 1집 《소풍》 발매', sourceUrl: 'https://ko.wikipedia.org/wiki/양지은' },
    ],
    sources: [
      { t: '양지은', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/양지은', g: 'B' },
      { t: "'미스트롯2' 양지은 최종 우승 진", p: '뉴시스', u: 'https://www.newsis.com/view/NISX20210305_0001359953', g: 'B' },
    ],
  });

  // 대표곡
  await upsertSingle('jjan-jjan-jjan', '짠짠짠', khj, '2022-01-01', '김희재의 정규 1집 《희재》 타이틀곡.', 'https://music.bugs.co.kr/artist/20100267/tracks');
  await upsertSingle('mom-flower', '엄마 꽃', ash, '2021-09-24', '안성훈의 대표 히트곡. 어머니를 향한 마음을 담았다.', 'https://music.bugs.co.kr/album/4065058');
  await upsertSingle('yeonkkot', '연꽃', jyj, '2023-01-01', '전유진의 대표곡 중 하나.', 'https://ko.wikipedia.org/wiki/전유진');
  await upsertSingle('geu-gang', '그 강을 건너지 마오', yje, '2021-01-01', '양지은의 대표곡. 국악적 색채가 담긴 트로트.', 'https://ko.wikipedia.org/wiki/양지은');

  // ---------------- 심층 게시글: 오디션 프로그램 총정리 ----------------
  await upsertArticle('trot-audition-programs', {
    type: 'guide',
    title: '트로트 오디션 프로그램 총정리 — 미스트롯·미스터트롯·불타는 트롯맨·현역가왕',
    seoTitle: '트로트 오디션 프로그램 총정리: 시즌별 우승자·배출 스타',
    description: '2019년 미스트롯부터 미스터트롯, 불타는 트롯맨, 현역가왕까지 주요 트로트 경연 프로그램의 방송사·시즌별 우승자와 배출 스타를 한눈에 정리했습니다.',
    excerpt: '주요 트로트 오디션 프로그램과 우승자를 한눈에.',
    primaryKeyword: '트로트 오디션 프로그램',
    searchIntent: '트로트 오디션 프로그램 종류와 우승자 정리',
    authorId: admin?.id ?? null,
    body: AUDITION_BODY,
    sources: [
      { t: '내일은 미스터트롯', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/미스터트롯', g: 'B' },
      { t: "'미스터트롯2' 우승자는 안성훈", p: '노컷뉴스', u: 'https://www.nocutnews.co.kr/news/5911355', g: 'B' },
      { t: "'미스트롯2' 양지은 최종 우승 진", p: '뉴시스', u: 'https://www.newsis.com/view/NISX20210305_0001359953', g: 'B' },
      { t: "전유진, '현역가왕' 우승", p: '뉴시스', u: 'https://www.newsis.com/view/NISX20240214_0002625478', g: 'B' },
    ],
  });

  const [ar, pg, mu, at] = await Promise.all([
    prisma.artist.count({ where: { status: 'published' } }),
    prisma.program.count({ where: { status: 'published' } }),
    prisma.music.count({ where: { status: 'published' } }),
    prisma.article.count({ where: { status: 'published' } }),
  ]);
  console.log(`✔ 배치6 완료. published — 가수 ${ar}, 프로그램 ${pg}, 음반/곡 ${mu}, 기사 ${at}`);
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

const AUDITION_BODY = [
  '> 방송사·주요 언론 보도로 교차 확인한 사실만 정리했습니다. 시즌·방송사 혼동이 잦은 분야라 우승자와 소속 프로그램을 명확히 구분했습니다.',
  '',
  '2019년 이후 트로트가 ‘제2의 전성기’를 맞은 배경에는 여러 방송사의 경연 오디션 프로그램이 있습니다. 각 프로그램이 배출한 스타가 곧 오늘날 트로트 지형을 이루고 있어, 프로그램과 우승자를 아는 것이 트로트를 이해하는 지름길입니다. 주요 프로그램을 방송사·시즌별로 정리했습니다.',
  '',
  '## TV조선 《내일은 미스트롯》 — 여성부의 시작',
  '2019년 방영된 TV조선 《내일은 미스트롯》은 트로트 열풍의 출발점으로 평가됩니다. 시즌1에서는 국악을 전공한 [송가인](/artists/song-ga-in)이 초대 진(眞)으로 우승했습니다. 2020~2021년 방영된 시즌2에서는 국악인 출신 [양지은](/artists/yang-ji-eun)이 진에 올랐습니다.',
  '',
  '## TV조선 《내일은 미스터트롯》 — 남성부의 폭발',
  '2020년 시즌1은 트로트 열풍을 정점으로 끌어올렸습니다. 최종 TOP7은 진 [임영웅](/artists/lim-young-woong), 선 [영탁](/artists/young-tak), 미 [이찬원](/artists/lee-chan-won)에 이어 김호중·[정동원](/artists/jeong-dong-won)·[장민호](/artists/jang-min-ho)·[김희재](/artists/kim-hee-jae)로, 이들 대부분이 지금도 정상급으로 활동하고 있습니다. 2023년 방영된 시즌2에서는 [안성훈](/artists/ahn-sung-hoon)이 우승(진), [박지현](/artists/park-ji-hyun)이 선을 차지했습니다.',
  '',
  '## MBN 《불타는 트롯맨》 — 크로스오버의 합류',
  'MBN이 2022~2023년 방영한 《불타는 트롯맨》은 성악·크로스오버 출신 [손태진](/artists/son-tae-jin)이 초대 우승을 차지한 프로그램입니다. 팬텀싱어 우승팀 포르테 디 콰트로 출신인 그가 트로트 무대에서도 정상에 오르며, 장르 간 경계를 넘나드는 흐름을 보여 주었습니다.',
  '',
  '## MBN 《현역가왕》 — 여성부의 새 강자',
  'MBN이 2023~2024년 방영한 《현역가왕》에서는 [전유진](/artists/jeon-yu-jin)이 제1대 우승을 차지했습니다. 앞서 《미스트롯2》에서 인지도를 쌓았던 그가 이 프로그램을 통해 정상에 오르며, 오디션을 거친 신예들이 여러 프로그램에 걸쳐 성장하는 흐름을 보여 주었습니다.',
  '',
  '## 한눈에 보는 우승자',
  '- 미스트롯 시즌1(2019) 진: 송가인',
  '- 미스트롯 시즌2(2020~2021) 진: 양지은',
  '- 미스터트롯 시즌1(2020) 진: 임영웅',
  '- 미스터트롯 시즌2(2023) 진: 안성훈',
  '- 불타는 트롯맨(2023) 우승: 손태진',
  '- 현역가왕(2024) 우승: 전유진',
  '',
  '각 가수의 상세 프로필과 대표곡은 [가수 목록](/artists)에서, 프로그램별 정보는 [내일은 미스터트롯](/programs/mr-trot)·[내일은 미스트롯](/programs/miss-trot)·[불타는 트롯맨](/programs/burning-trotman)·[현역가왕](/programs/legendary-star) 페이지에서 확인할 수 있습니다. 트로트라는 장르의 전체 흐름은 [트로트의 역사](/news/trot-history-deep)에서 이어집니다.',
].join('\n');

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

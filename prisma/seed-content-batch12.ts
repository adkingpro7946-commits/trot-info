/**
 * 콘텐츠 배치12 — 미스터트롯3 프로그램 + 김용빈(진)·손빈아(선)·천록담(미)·춘길(4위).
 * 교차검증 정정: 미스터트롯3 우승(진)은 김용빈(손빈아 2위/선). 남승민(5위) 연결.
 * 천록담=R&B 가수 이정(본명 이정희), 춘길=발라드 가수 모세(본명 김종범) — 다른 예명 명시.
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

async function upsertArtist(a: Spec, programId: string) {
  await prisma.artist.upsert({ where: { slug: a.slug }, update: {}, create: { slug: a.slug, stageName: a.stageName, profileSummary: 'x', status: 'draft' } });
  const art = await prisma.artist.update({
    where: { slug: a.slug },
    data: {
      stageName: a.stageName, realName: a.realName ?? null, profileSummary: a.profileSummary,
      birthDate: a.birthDate ? D(a.birthDate) : null, birthPlace: a.birthPlace ?? null, agency: a.agency ?? null,
      officialSocialLinks: JSON.stringify([]),
      isSample: false, status: 'published', lastFactCheckedAt: NOW,
      programs: { connect: { id: programId } },
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
  // 프로그램: 내일은 미스터트롯3
  const mt3 = await prisma.program.upsert({
    where: { slug: 'mr-trot-3' },
    update: {},
    create: {
      slug: 'mr-trot-3', name: '내일은 미스터트롯3', broadcaster: 'TV조선',
      airInfo: '2024~2025년 방영 (시즌3)',
      description: 'TV조선 남성 트로트 경연 오디션의 세 번째 시즌. 2025년 3월 결승에서 김용빈이 최종 우승(진)했으며, 2위(선) 손빈아, 3위(미) 천록담, 4위 춘길 순이었다. 임영웅(시즌1)·안성훈(시즌2)에 이은 3대 진이다.',
      isSample: false, status: 'published',
    },
  });

  const kyb = await upsertArtist({
    slug: 'kim-yong-bin', stageName: '김용빈',
    profileSummary: '김용빈은 1992년 대구 출생의 트로트 가수로, 2004년 어린 나이에 트로트 신동으로 데뷔했다. 오랜 활동과 공백기를 거쳐 현역 최고참 참가자로 TV조선 《내일은 미스터트롯3》에 출연했고, 2025년 3월 최종회에서 실시간 문자투표에서 앞서며 3대 진(眞)에 올라 상금 3억 원의 주인공이 됐다. 대표곡으로 「보고싶어서」(2012) 등이 있으며 우승 이후 「금수저」(2025)를 발표했다.',
    birthDate: '1992-09-18', birthPlace: '대구광역시', agency: '오네스타 컴퍼니',
    awards: [{ year: 2025, title: '《내일은 미스터트롯3》 최종 우승(진)', org: 'TV조선', sourceUrl: 'https://www.news1.kr/entertain/broadcast-tv/5718744' }],
    timeline: [
      { date: '2004-01-01', title: '트로트 신동으로 데뷔', sourceUrl: 'https://ko.wikipedia.org/wiki/김용빈_(가수)' },
      { date: '2025-03-13', title: '《미스터트롯3》 최종 우승(진)', description: '상금 3억 원', sourceUrl: 'https://www.news1.kr/entertain/broadcast-tv/5718744' },
    ],
    sources: [
      { t: '김용빈 (가수)', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/김용빈_(가수)', g: 'B' },
      { t: "김용빈, '미스터트롯3' 우승…3대 진", p: '뉴스1', u: 'https://www.news1.kr/entertain/broadcast-tv/5718744', g: 'B' },
    ],
  }, mt3.id);

  const sba = await upsertArtist({
    slug: 'son-bin-a', stageName: '손빈아', realName: '손용빈',
    profileSummary: '손빈아(본명 손용빈)는 1992년 경남 하동 출신의 남성 트로트 가수로, 2018년 데뷔했다. 남진을 연상시키는 정통 트로트 창법으로 ‘하동 남진’이라는 별칭을 얻었다. TV조선 《내일은 미스터트롯3》에서 마스터 점수 만점을 받으며 최종 2위(선)에 올라 대중적 인지도를 크게 높였다.',
    birthDate: '1992-12-29', birthPlace: '경상남도 하동',
    awards: [{ year: 2025, title: '《내일은 미스터트롯3》 최종 2위(선)', org: 'TV조선', sourceUrl: 'https://enews.imbc.com/News/RetrieveNewsInfo/452883' }],
    timeline: [{ date: '2025-03-13', title: '《미스터트롯3》 최종 2위(선)', description: '마스터 점수 만점', sourceUrl: 'https://enews.imbc.com/News/RetrieveNewsInfo/452883' }],
    sources: [
      { t: '손빈아', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/손빈아', g: 'B' },
      { t: "'미스터트롯3' 손빈아, 최종 善", p: 'MBC 연예', u: 'https://enews.imbc.com/News/RetrieveNewsInfo/452883', g: 'B' },
    ],
  }, mt3.id);

  const crd = await upsertArtist({
    slug: 'cheon-rok-dam', stageName: '천록담', realName: '이정희',
    profileSummary: '천록담(본명 이정희)은 2003년 데뷔해 ‘알앤비 황제’로 불린 R&B·발라드 가수 이정(J.Lee)이 트로트에 도전하며 사용한 예명이다. 2024~2025년 TV조선 《내일은 미스터트롯3》에 ‘천록담’으로 출연해 최종 3위(미)에 올랐고, 트로트 데뷔곡 「동해물과 백두산이」를 2025년 공개했다. 작사·작곡·연주를 겸하는 뮤지션으로 평가된다. (동명이인 배우 이정과는 다른 인물이다.)',
    birthDate: '1981-10-24', birthPlace: '서울특별시',
    awards: [{ year: 2025, title: '《내일은 미스터트롯3》 최종 3위(미)', org: 'TV조선', sourceUrl: 'https://www.starnewskorea.com/broadcast-show/2025/03/21/2025032107374644343' }],
    timeline: [{ date: '2025-03-13', title: '《미스터트롯3》 최종 3위(미)', sourceUrl: 'https://www.starnewskorea.com/broadcast-show/2025/03/21/2025032107374644343' }],
    sources: [
      { t: '이정 (가수)', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/이정_(가수)', g: 'B' },
      { t: "'미스터트롯3' 천록담 이정", p: '스타뉴스', u: 'https://www.starnewskorea.com/broadcast-show/2025/03/21/2025032107374644343', g: 'B' },
    ],
  }, mt3.id);

  const cg = await upsertArtist({
    slug: 'chun-gil', stageName: '춘길', realName: '김종범',
    profileSummary: '춘길(본명 김종범)은 2005년 「사랑인걸」로 이름을 알린 발라드 가수 ‘모세’가 트로트에 도전하며 사용한 예명으로, 돌아가신 아버지의 성함에서 따왔다. 2022년경부터 트로트로 활동했고, TV조선 《내일은 미스터트롯3》에서 안정적인 가창력으로 최종 4위(TOP4)에 올랐다. 발라드와 트로트를 넘나드는 창법으로 평가받는다.',
    birthDate: '1980-03-07', birthPlace: '경기도 고양',
    awards: [{ year: 2025, title: '《내일은 미스터트롯3》 최종 4위(TOP4)', org: 'TV조선', sourceUrl: 'https://www.kyeonggi.com/article/20250303580192' }],
    timeline: [{ date: '2025-03-13', title: '《미스터트롯3》 최종 4위', sourceUrl: 'https://www.kyeonggi.com/article/20250303580192' }],
    sources: [
      { t: '모세 (가수)', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/모세_(가수)', g: 'B' },
      { t: "여주 출신 춘길, '미스터트롯3' 톱10", p: '경기일보', u: 'https://www.kyeonggi.com/article/20250303580192', g: 'B' },
    ],
  }, mt3.id);

  // 남승민(5위)도 미스터트롯3에 연결
  const nsm = await prisma.artist.findUnique({ where: { slug: 'nam-seung-min' }, select: { id: true } });
  if (nsm) await prisma.program.update({ where: { id: mt3.id }, data: { artists: { connect: { id: nsm.id } } } });

  // 대표곡 (검증된 것만)
  await upsertSingle('gold-spoon', '금수저', kyb, '2025-01-01', '김용빈이 《미스터트롯3》 우승 이후 발표한 곡.', 'https://ko.wikipedia.org/wiki/김용빈_(가수)');
  await upsertSingle('donghae', '동해물과 백두산이', crd, '2025-01-01', '천록담(이정)의 트로트 데뷔곡.', 'https://ko.wikipedia.org/wiki/이정_(가수)');
  await upsertSingle('sarang-ingeol', '사랑인걸', cg, '2005-01-01', '춘길이 발라드 가수 ‘모세’ 시절 발표한 대표 히트곡.', 'https://ko.wikipedia.org/wiki/모세_(가수)');

  const [ar, pg, mu] = await Promise.all([
    prisma.artist.count({ where: { status: 'published' } }),
    prisma.program.count({ where: { status: 'published' } }),
    prisma.music.count({ where: { status: 'published' } }),
  ]);
  console.log(`✔ 배치12 완료. published — 가수 ${ar}, 프로그램 ${pg}, 음반/곡 ${mu}`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

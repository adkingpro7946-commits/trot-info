/**
 * 콘텐츠 배치13 — 요요미·강혜연·문희옥·현숙.
 * 교차검증 정정: 현숙 '봄바람 님바람'(황정자 원곡)·'열이면 열' 제외, '타국에서'→'타국에 계신 아빠에게'.
 * 보수적: 연도만 아는 출생(강혜연)은 요약 서술, 검증 약한 소속사/SNS 생략.
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
  const yym = await upsertArtist({
    slug: 'yoyomi', stageName: '요요미', realName: '박연아',
    profileSummary: '요요미(본명 박연아)는 1994년 충북 청주 출신의 트로트 가수다. 정식 데뷔 전 유튜브에 혜은이 등의 곡을 커버해 인지도를 얻으며 ‘리틀 혜은이’로 불렸고, 2018년 싱글 「이 오빠 뭐야」로 데뷔했다. 《불후의 명곡》 등 음악 예능에서 활동하며 청량한 음색의 트로트 가수로 자리 잡았다.',
    birthDate: '1994-10-08', birthPlace: '충청북도 청주', agency: '스쿨뮤직 엔터테인먼트',
    awards: [{ year: 2020, title: 'KBS 《불후의 명곡》 우승', org: 'KBS', sourceUrl: 'https://ko.wikipedia.org/wiki/요요미' }],
    timeline: [{ date: '2018-02-23', title: '싱글 「이 오빠 뭐야」로 데뷔', sourceUrl: 'https://ko.wikipedia.org/wiki/요요미' }],
    sources: [
      { t: '요요미', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/요요미', g: 'B' },
      { t: '요요미 공식 홈페이지', p: '공식', u: 'https://www.yoyomi.co.kr/', g: 'A' },
    ],
  });

  const khy = await upsertArtist({
    slug: 'kang-hye-yeon', stageName: '강혜연',
    profileSummary: '강혜연은 1990년 제주 출신으로, EXID·베스티를 거친 아이돌 출신 트로트 가수다. 2018년 「왔다야」로 트로트에 전향해 세대를 아우르는 히트를 기록했다. TV조선 《내일은 미스트롯2》에서 최종 8위에 올랐고, 2026년 MBN 《현역가왕3》에서 최종 5위로 국가대표 TOP7에 선정되며 재도약했다.',
    birthPlace: '제주특별자치도 제주', agency: 'SOO 엔터테인먼트',
    programSlugs: ['miss-trot', 'legendary-star'],
    awards: [
      { year: 2021, title: '《내일은 미스트롯2》 최종 8위', org: 'TV조선', sourceUrl: 'https://ko.wikipedia.org/wiki/강혜연' },
      { year: 2026, title: 'MBN 《현역가왕3》 최종 5위 (TOP7)', org: 'MBN', sourceUrl: 'https://news.nate.com/view/20260311n00315' },
    ],
    timeline: [
      { date: '2018-10-31', title: '「왔다야」로 트로트 데뷔', sourceUrl: 'https://ko.wikipedia.org/wiki/강혜연' },
      { date: '2026-03-10', title: '《현역가왕3》 최종 5위·국가대표 TOP7', sourceUrl: 'https://news.nate.com/view/20260311n00315' },
    ],
    sources: [
      { t: '강혜연', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/강혜연', g: 'B' },
      { t: "'현역가왕3' 최종 TOP7", p: '네이트/스타뉴스', u: 'https://news.nate.com/view/20260311n00315', g: 'B' },
    ],
  });

  const mho = await upsertArtist({
    slug: 'moon-hee-ok', stageName: '문희옥', realName: '문지영',
    profileSummary: '문희옥(본명 문지영)은 1969년 강원 태백 출신의 트로트 가수로, 1987년 사투리 메들리 앨범으로 데뷔했다. 서울예술전문대학 재학 중 발표한 「사랑의 거리」(1989)가 인기차트 상위권에 오르며 전성기를 맞았고, 이후 「성은 김이요」(1991) 등 정통 트로트로 입지를 굳혔다. 메들리 가창과 정통 트로트 창법을 함께 소화하는 가수로 평가된다.',
    birthDate: '1969-07-27', birthPlace: '강원도 태백',
    awards: [
      { year: 1987, title: '제2회 골든디스크 신인가수상', sourceUrl: 'https://ko.wikipedia.org/wiki/문희옥' },
    ],
    timeline: [{ date: '1989-01-01', title: '「사랑의 거리」로 전성기', sourceUrl: 'https://gangnam.grandculture.net/gangnam/toc/GC04801513' }],
    sources: [
      { t: '문희옥', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/문희옥', g: 'B' },
      { t: '「사랑의 거리」', p: '디지털강남문화대전', u: 'https://gangnam.grandculture.net/gangnam/toc/GC04801513', g: 'B' },
    ],
  });

  const hsk = await upsertArtist({
    slug: 'hyun-sook', stageName: '현숙', realName: '정현숙',
    profileSummary: '현숙(본명 정현숙)은 1959년 전북 김제 출신의 트로트 가수로, 1978년경 데뷔해 「타국에 계신 아빠에게」(1979)로 이름을 알렸다. 1980년대 초 MBC 10대 가수상을 받으며 인기를 얻었고, 1997년 경쾌한 트로트 「요즘여자 요즘남자」로 큰 반향을 일으켜 한국방송대상 가수상을 받았다. 「오빠는 잘 있단다」, 「춤추는 탬버린」 등 대중적 히트곡과 무대 퍼포먼스로 알려져 있으며 ‘효녀 가수’로 불린다.',
    birthDate: '1959-06-22', birthPlace: '전라북도 김제',
    awards: [
      { year: 1997, title: '한국방송대상 가수상 (「요즘여자 요즘남자」)', sourceUrl: 'https://ko.wikipedia.org/wiki/현숙' },
    ],
    timeline: [
      { date: '1979-01-01', title: '「타국에 계신 아빠에게」로 인지도 상승', sourceUrl: 'https://ko.wikipedia.org/wiki/현숙' },
      { date: '1997-01-01', title: '「요즘여자 요즘남자」 대히트', sourceUrl: 'https://ko.wikipedia.org/wiki/현숙' },
    ],
    sources: [
      { t: '현숙', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/현숙', g: 'B' },
      { t: "'효녀 가수' 현숙효열비", p: '경상일보', u: 'https://www.ksilbo.co.kr/news/articleView.html?idxno=754710', g: 'B' },
    ],
  });

  // 대표곡
  await upsertSingle('this-oppa', '이 오빠 뭐야', yym, '2018-02-23', '요요미의 데뷔 타이틀곡.', 'https://ko.wikipedia.org/wiki/요요미');
  await upsertSingle('watdaya', '왔다야', khy, '2018-10-31', '강혜연의 트로트 데뷔곡이자 대표곡.', 'https://ko.wikipedia.org/wiki/강혜연');
  await upsertSingle('street-of-love', '사랑의 거리', mho, '1989-01-01', '문희옥의 대표 히트곡.', 'https://gangnam.grandculture.net/gangnam/toc/GC04801513');
  await upsertSingle('yojeum', '요즘여자 요즘남자', hsk, '1997-01-01', '현숙의 대표곡. 1997년 한국방송대상 가수상을 안겼다.', 'https://ko.wikipedia.org/wiki/현숙');

  const [ar, mu] = await Promise.all([
    prisma.artist.count({ where: { status: 'published' } }),
    prisma.music.count({ where: { status: 'published' } }),
  ]);
  console.log(`✔ 배치13 완료. published — 가수 ${ar}, 음반/곡 ${mu}`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

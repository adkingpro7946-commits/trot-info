/**
 * 콘텐츠 배치10 — 이미자·김수희·심수봉·현철·박현빈·홍진영 + 레전드 글 내부링크 보강.
 * 민감 처리: 현철 별세 2024-07-15(사실만, 사인 배제), 심수봉/홍진영 논란·정치·사생활 전부 배제.
 * 보수적: 박현빈 출신지 상충→생략.
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
  const imj = await upsertArtist({
    slug: 'lee-mi-ja', stageName: '이미자',
    profileSummary: '이미자는 1941년 서울에서 태어난 대한민국의 원로 가수로, 1959년 「열아홉 순정」으로 데뷔했다. 1964년 「동백아가씨」의 대성공으로 한국 트로트를 대표하는 가수로 자리 잡았고, ‘엘레지의 여왕’으로 불리며 반세기 넘는 활동 동안 방대한 취입곡과 다수의 히트곡을 남겼다. 여러 차례 문화훈장을 받는 등 대중가요계 원로로서 위상을 인정받았다.',
    birthDate: '1941-10-30', birthPlace: '서울특별시',
    awards: [
      { year: 1995, title: '화관문화훈장', sourceUrl: 'https://ko.wikipedia.org/wiki/이미자' },
      { year: 2009, title: '은관문화훈장', sourceUrl: 'https://ko.wikipedia.org/wiki/이미자' },
    ],
    timeline: [
      { date: '1959-01-01', title: '「열아홉 순정」으로 데뷔', sourceUrl: 'https://ko.wikipedia.org/wiki/이미자' },
      { date: '1964-01-01', title: '「동백아가씨」 대성공', sourceUrl: 'https://ko.wikipedia.org/wiki/동백아가씨' },
    ],
    sources: [
      { t: '이미자', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/이미자', g: 'B' },
      { t: '동백아가씨', p: '한국민족문화대백과사전', u: 'https://encykorea.aks.ac.kr/Article/E0072207', g: 'A' },
    ],
  });

  const ksh = await upsertArtist({
    slug: 'kim-su-hui', stageName: '김수희', realName: '김희수',
    profileSummary: '김수희는 1953년 경북 봉화 출신의 트로트·성인가요 가수로, 1976년 데뷔했다. 「멍에」(1982)로 이름을 알리고 「남행열차」(1987)와 「애모」로 폭넓은 인기를 얻었다. 특히 「애모」는 1990년 발매 후 1993년 크게 역주행하며 가요 순위 정상에 올라 그해 KBS 가요대상 대상을 받았다. 허스키한 음색과 풍부한 가창력이 특징이며, 「남행열차」는 세대를 넘어 애창되는 곡이다.',
    birthDate: '1953-04-26', birthPlace: '경상북도 봉화',
    awards: [
      { year: 1993, title: 'KBS 가요대상 대상 (「애모」)', org: 'KBS', sourceUrl: 'https://ko.wikipedia.org/wiki/김수희' },
    ],
    timeline: [
      { date: '1987-06-01', title: '「남행열차」 발표', sourceUrl: 'https://ko.wikipedia.org/wiki/남행열차' },
      { date: '1993-01-01', title: '「애모」 역주행 대히트·KBS 가요대상 대상', sourceUrl: 'https://ko.wikipedia.org/wiki/김수희' },
    ],
    sources: [
      { t: '김수희', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/김수희', g: 'B' },
      { t: '남행열차', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/남행열차', g: 'B' },
    ],
  });

  const ssb = await upsertArtist({
    slug: 'sim-su-bong', stageName: '심수봉', realName: '심민경',
    profileSummary: '심수봉은 1955년 충남 서산 출신의 가수로, 1978년 MBC 대학가요제에 자작곡 「그때 그 사람」으로 출전하며 등장했다. 이후 「남자는 배 여자는 항구」, 「사랑밖엔 난 몰라」 등 직접 쓰고 작곡한 곡들을 다수 발표하며 독자적인 음악 세계를 구축했다. 트로트와 발라드를 오가는 서정적 창법과 자작곡 역량으로 대표적인 싱어송라이터형 가수로 평가받는다.',
    birthDate: '1955-07-11', birthPlace: '충청남도 서산',
    awards: [
      { year: 1979, title: 'KBS 가요대상 신인상', org: 'KBS', sourceUrl: 'https://ko.wikipedia.org/wiki/심수봉' },
    ],
    timeline: [
      { date: '1978-01-01', title: 'MBC 대학가요제 「그때 그 사람」 출전', sourceUrl: 'https://ko.wikipedia.org/wiki/심수봉' },
      { date: '1984-01-01', title: '「남자는 배 여자는 항구」 발표', sourceUrl: 'https://ko.wikipedia.org/wiki/심수봉' },
    ],
    sources: [
      { t: '심수봉', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/심수봉', g: 'B' },
    ],
  });

  const hc = await upsertArtist({
    slug: 'hyun-cheol', stageName: '현철', realName: '강상수',
    profileSummary: '현철(본명 강상수)은 1942년 경남 김해 출신의 트로트 가수로, 1969년 데뷔했다. 송대관·태진아·설운도와 더불어 ‘트로트 4대 천왕’으로 불렸다. 「봉선화 연정」으로 1988년 KBS 가요대상을 수상하며 최고의 인기를 누렸고, 「앉으나 서나 당신 생각」, 「사랑은 나비인가봐」, 「싫다 싫어」 등 다수의 히트곡을 남겼다. 오랜 기간 트로트를 대표한 가수로 꼽히며 2024년 7월 15일 별세했다.',
    birthDate: '1942-07-29', birthPlace: '경상남도 김해',
    awards: [
      { year: 1988, title: 'KBS 가요대상 (「봉선화 연정」)', org: 'KBS', sourceUrl: 'https://ko.wikipedia.org/wiki/현철_(가수)' },
      { year: 2006, title: '옥관문화훈장', sourceUrl: 'https://ko.wikipedia.org/wiki/현철_(가수)' },
    ],
    timeline: [
      { date: '1988-01-01', title: '「봉선화 연정」으로 KBS 가요대상 수상', sourceUrl: 'https://ko.wikipedia.org/wiki/현철_(가수)' },
      { date: '2024-07-15', title: '별세', sourceUrl: 'https://www.imaeil.com/page/view/2024071603212646748' },
    ],
    sources: [
      { t: '현철 (가수)', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/현철_(가수)', g: 'B' },
      { t: "트로트 4대 천왕 '현철' 별세", p: '매일신문', u: 'https://www.imaeil.com/page/view/2024071603212646748', g: 'B' },
    ],
  });

  const phb = await upsertArtist({
    slug: 'park-hyun-bin', stageName: '박현빈', realName: '박지웅',
    profileSummary: '박현빈은 2006년 트로트로 데뷔한 대한민국 가수로, 데뷔곡 「빠라빠빠」와 히트곡 「곤드레 만드레」로 인지도를 얻었다. 「샤방샤방」, 「오빠만 믿어」 등 경쾌한 댄스 트로트로 2000년대 후반 신세대 트로트를 대표하는 남성 가수로 자리 잡았다. 2011년 일본에 진출해 이듬해 일본 골드디스크상 신인상을 받았고, 2025년 데뷔 20주년을 맞아 첫 단독 콘서트와 전국투어를 열었다.',
    birthDate: '1982-10-18', agency: 'IW엔터테인먼트',
    awards: [
      { year: 2006, title: '대한민국 트로트가요대상 올해의 가수상', sourceUrl: 'https://ko.wikipedia.org/wiki/박현빈' },
      { year: 2020, title: '제1회 트롯어워즈 남자 베스트 가수상', sourceUrl: 'https://ko.wikipedia.org/wiki/박현빈' },
    ],
    timeline: [
      { date: '2006-01-01', title: '「곤드레 만드레」·「빠라빠빠」로 데뷔', sourceUrl: 'https://ko.wikipedia.org/wiki/박현빈' },
    ],
    sources: [
      { t: '박현빈', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/박현빈', g: 'B' },
      { t: "'곤드레 만드레' 박현빈, 데뷔 20주년 전국투어", p: '이데일리', u: 'https://www.edaily.co.kr/News/Read?newsId=02863446645316080&mediaCodeNo=257', g: 'B' },
    ],
  });

  const hjy2 = await upsertArtist({
    slug: 'hong-jin-young', stageName: '홍진영',
    profileSummary: '홍진영은 2009년 「사랑의 배터리」로 데뷔한 대한민국 트로트 가수다. 중독성 있는 멜로디와 친숙한 가사를 앞세운 「산다는 건」, 「엄지 척」, 「잘가라」 등을 잇달아 히트시키며 폭넓은 연령층에서 인지도를 쌓았다. MAMA 트롯 음악상, 멜론뮤직어워드 트로트부문상 등 주요 시상식에서 수상했으며, 2019년 본인 기획사 IMH엔터테인먼트를 설립해 활동을 이어가고 있다.',
    birthDate: '1985-08-09', birthPlace: '광주광역시', agency: 'IMH엔터테인먼트',
    awards: [
      { year: 2015, title: '골든디스크 베스트 트로트상', sourceUrl: 'https://ko.wikipedia.org/wiki/홍진영' },
      { year: 2020, title: '제1회 트롯어워즈 여자 베스트 가수상', sourceUrl: 'https://ko.wikipedia.org/wiki/홍진영' },
    ],
    timeline: [
      { date: '2009-06-19', title: '「사랑의 배터리」로 데뷔', sourceUrl: 'https://ko.wikipedia.org/wiki/홍진영' },
      { date: '2014-01-01', title: '「산다는 건」 발표', sourceUrl: 'https://ko.wikipedia.org/wiki/홍진영' },
    ],
    sources: [
      { t: '홍진영', p: '위키백과', u: 'https://ko.wikipedia.org/wiki/홍진영', g: 'B' },
      { t: '홍진영 아티스트', p: '벅스', u: 'https://music.bugs.co.kr/artist/8013105', g: 'B' },
    ],
  });

  // 대표곡
  await upsertSingle('dongbaek-agassi', '동백아가씨', imj, '1964-01-01', '이미자의 대표곡. 가요 프로그램에서 장기간 1위를 기록했다.', 'https://ko.wikipedia.org/wiki/동백아가씨');
  await upsertSingle('aemo', '애모', ksh, '1990-01-01', '김수희의 대표곡. 1990년 발매 후 1993년 크게 역주행해 가요 순위 정상에 올랐다.', 'https://ko.wikipedia.org/wiki/김수희');
  await upsertSingle('namja-bae', '남자는 배 여자는 항구', ssb, '1984-01-01', '심수봉이 직접 작사·작곡한 대표곡.', 'https://ko.wikipedia.org/wiki/심수봉');
  await upsertSingle('bongseonhwa', '봉선화 연정', hc, '1988-01-01', '현철의 대표곡으로 1988년 KBS 가요대상을 안겼다.', 'https://ko.wikipedia.org/wiki/현철_(가수)');
  await upsertSingle('gondre', '곤드레 만드레', phb, '2006-01-01', '박현빈의 대표 히트곡.', 'https://ko.wikipedia.org/wiki/박현빈');
  await upsertSingle('battery', '사랑의 배터리', hjy2, '2009-06-19', '홍진영의 데뷔곡이자 대표곡.', 'https://ko.wikipedia.org/wiki/홍진영');

  // 레전드 글: 현철·이미자·김수희·심수봉 내부링크 반영
  await prisma.article.update({
    where: { slug: 'trot-legends' },
    data: { body: LEGENDS_BODY_V2, lastFactCheckedAt: NOW },
  });

  const [ar, mu] = await Promise.all([
    prisma.artist.count({ where: { status: 'published' } }),
    prisma.music.count({ where: { status: 'published' } }),
  ]);
  console.log(`✔ 배치10 완료. published — 가수 ${ar}, 음반/곡 ${mu}`);
}

const LEGENDS_BODY_V2 = [
  '> 백과·주요 언론으로 교차 확인한 사실만 정리했습니다. 원로 가수의 사생활·건강 관련 내용은 다루지 않습니다.',
  '',
  '오늘날의 트로트 열풍은 하루아침에 만들어진 것이 아닙니다. 수십 년에 걸쳐 장르의 토대를 다진 원로·전설의 가수들이 있었기에 가능했습니다. 이 글에서는 한국 트로트의 뼈대를 만든 대표적인 레전드들을 세대별로 정리합니다.',
  '',
  '## 전성기를 연 1960~70년대',
  '1960년대 트로트가 하나의 장르로 자리 잡는 과정에서 [남진](/artists/nam-jin)과 [나훈아](/artists/na-hoon-a)는 당대 남성 트로트를 양분하는 라이벌 구도를 형성했습니다. 남진의 「가슴 아프게」·「님과 함께」, 나훈아의 「사랑은 눈물의 씨앗」·「고향역」 등은 지금도 널리 불리는 고전입니다. 여성 쪽에서는 [이미자](/artists/lee-mi-ja)가 「동백아가씨」로 트로트의 대중적 저변을 크게 넓히며 ‘엘레지의 여왕’으로 불렸습니다.',
  '',
  '## 1980~90년대를 수놓은 목소리',
  '1980년대에는 [주현미](/artists/joo-hyun-mi)가 「비 내리는 영동교」·「신사동 그 사람」 등으로 정통 트로트의 계보를 이었고, [김수희](/artists/kim-su-hui)는 「남행열차」와 「애모」로 폭넓은 사랑을 받았습니다. 자작곡을 앞세운 싱어송라이터 [심수봉](/artists/sim-su-bong)의 「남자는 배 여자는 항구」 역시 이 시기를 대표하는 명곡입니다.',
  '',
  '## 트로트 4대 천왕',
  '1990년대 이후 남성 트로트를 이야기할 때 빠지지 않는 것이 이른바 ‘트로트 4대 천왕’입니다. [송대관](/artists/song-dae-kwan)의 「해뜰날」·「네박자」, [태진아](/artists/tae-jin-ah)의 「옥경이」·「동반자」, [설운도](/artists/seol-un-do)의 「잃어버린 30년」·「다함께 차차차」, 그리고 [현철](/artists/hyun-cheol)의 「봉선화 연정」 등은 세대를 아우르는 히트곡으로 사랑받았습니다. 이들은 흥겨운 리듬과 친숙한 가사로 남녀노소가 함께 즐기는 트로트 무대를 정립했습니다. 이 가운데 현철은 2024년, 송대관은 2025년 별세했습니다.',
  '',
  '## 전설이 남긴 것',
  '이 원로·전설 가수들이 다진 토대 위에서 2019년 이후의 오디션 세대가 새로운 전성기를 열 수 있었습니다. 고전 명곡들은 오늘날 경연 무대에서 후배 가수들이 다시 부르며 세대를 잇고 있습니다. 각 가수의 상세 프로필과 대표곡은 [가수 목록](/artists)에서, 트로트라는 장르의 전체 흐름은 [트로트의 역사](/news/trot-history-deep)에서, 오늘날의 스타를 배출한 프로그램은 [트로트 오디션 프로그램 총정리](/news/trot-audition-programs)에서 이어서 확인할 수 있습니다.',
].join('\n');

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

/**
 * 콘텐츠 배치16 — 공연·음반 추가 보강 (전량 2출처 교차검증).
 *  - 신규 앨범/싱글: 아래 ALBUMS 배열
 *  - 신규 공연/페스티벌: 아래 EVENTS 배열
 * 데이터는 조사팀이 2개 이상 독립 출처로 교차확인한 것만 수록. 불확실 항목은 제외.
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const NOW = new Date('2026-07-22T00:00:00+09:00');
const D = (s: string) => new Date(s);
const idOf = async (slug: string) => (await prisma.artist.findUnique({ where: { slug }, select: { id: true } }))?.id ?? null;

type Src = { title: string; publisher: string; url: string };

async function upsertAlbum(a: {
  slug: string; title: string; artistSlug: string; type: string; releaseDate: string;
  tracks: string[]; description: string; sources: Src[];
}) {
  const aid = await idOf(a.artistSlug);
  await prisma.music.upsert({ where: { slug: a.slug }, update: {}, create: { slug: a.slug, title: a.title, status: 'draft' } });
  const m = await prisma.music.update({
    where: { slug: a.slug },
    data: {
      title: a.title, type: a.type, releaseDate: D(a.releaseDate), trackList: JSON.stringify(a.tracks),
      description: a.description, isSample: false, status: 'published', artists: { set: aid ? [{ id: aid }] : [] },
    },
  });
  await prisma.source.deleteMany({ where: { musicId: m.id } });
  for (const s of a.sources) {
    await prisma.source.create({ data: { musicId: m.id, sourceTitle: s.title, sourcePublisher: s.publisher, sourceUrl: s.url, sourceGrade: 'B', factType: 'release', verificationStatus: 'cross_checked', accessedAt: NOW } });
  }
}

async function upsertEvent(e: {
  slug: string; eventName: string; start: string; end?: string | null; venue?: string | null; region: string;
  artistSlugs: string[]; ticketVendor?: string | null; ticketOpen?: string | null; priceInformation?: string | null;
  eventStatus: string; officialSourceUrl?: string | null; sources: Src[];
}) {
  await prisma.event.upsert({ where: { slug: e.slug }, update: {}, create: { slug: e.slug, eventName: e.eventName, startDateTime: D(e.start), status: 'draft' } });
  const ids: { id: string }[] = [];
  for (const s of e.artistSlugs) { const id = await idOf(s); if (id) ids.push({ id }); }
  const ev = await prisma.event.update({
    where: { slug: e.slug },
    data: {
      eventName: e.eventName, eventType: 'concert', startDateTime: D(e.start), endDateTime: e.end ? D(e.end) : null,
      venue: e.venue ?? null, region: e.region, ticketVendor: e.ticketVendor ?? null, ticketOpenDate: e.ticketOpen ? D(e.ticketOpen) : null,
      priceInformation: e.priceInformation ?? null, officialSourceUrl: e.officialSourceUrl ?? null, eventStatus: e.eventStatus,
      isSample: false, status: 'published', sourceCheckedAt: NOW, artists: { set: ids },
    },
  });
  await prisma.source.deleteMany({ where: { eventId: ev.id } });
  for (const s of e.sources) {
    await prisma.source.create({ data: { eventId: ev.id, sourceTitle: s.title, sourcePublisher: s.publisher, sourceUrl: s.url, sourceGrade: 'B', factType: 'schedule', verificationStatus: 'cross_checked', accessedAt: NOW } });
  }
}

// ==================== 검증된 앨범 (조사팀 결과로 채움) ====================
const ALBUMS: Parameters<typeof upsertAlbum>[0][] = [
  {
    slug: 'song-ga-in-gain-dal', title: '가인;달', artistSlug: 'song-ga-in', type: 'album', releaseDate: '2025-02-11',
    tracks: ['평생', '아사달', '눈물이 난다', '이별가', '붉은 목단꽃', '왜 나를', '색동저고리', '아버지의 눈물', '지나간다고'],
    description: '송가인의 정규 4집. 더블 타이틀곡 「아사달」과 심수봉이 프로듀싱한 「눈물이 난다」를 포함해 9곡을 수록했다.',
    sources: [
      { title: '가인;달', publisher: '벅스', url: 'https://music.bugs.co.kr/album/4114458' },
      { title: "송가인, 정규 4집 '가인;달' 수록곡 공개", publisher: '이투데이', url: 'https://www.etoday.co.kr/news/view/2441038' },
    ],
  },
  {
    slug: 'lee-chan-won-chanran', title: '찬란(燦爛)', artistSlug: 'lee-chan-won', type: 'album', releaseDate: '2025-10-20',
    tracks: ['오늘은 왠지', '낙엽처럼 떨어진 너와 나', '말했잖아', '첫사랑', '엄마의 봄날', '시월의 시', '나의 오랜 여행', '나를 떠나지 마요', '락앤롤 인생', '빛나는 별'],
    description: '이찬원의 정규 2집. 조영수 프로듀싱, 타이틀곡 「오늘은 왠지」 등 다양한 장르 10곡을 수록했다.',
    sources: [
      { title: '찬란(燦爛)', publisher: '벅스', url: 'https://music.bugs.co.kr/album/20762338' },
      { title: "이찬원, 두 번째 정규 앨범 '찬란' 하이라이트 메들리 공개", publisher: '스타뉴스', url: 'https://www.starnewskorea.com/music/2025/10/17/2025101705154556152' },
    ],
  },
  {
    slug: 'lee-chan-won-changa', title: '찬가(燦歌)', artistSlug: 'lee-chan-won', type: 'mini', releaseDate: '2025-03-17',
    tracks: ['세월 베고 길게 누운 구름 한 조각', '제비처럼', '사랑했어요', '존재의 이유', '날개', '일편단심 민들레야'],
    description: '이찬원의 EP. 명곡을 재해석한 6곡을 수록했으며 타이틀곡은 「세월 베고 길게 누운 구름 한 조각」이다.',
    sources: [
      { title: '찬가(燦歌)', publisher: '벅스', url: 'https://music.bugs.co.kr/album/20711609' },
      { title: '이찬원 발매 앨범 목록', publisher: '벅스', url: 'https://music.bugs.co.kr/artist/20100255' },
    ],
  },
  {
    slug: 'kim-hee-jae-heestory', title: "HEE'story", artistSlug: 'kim-hee-jae', type: 'mini', releaseDate: '2025-09-18',
    tracks: ['Forever with u', '다신 볼 수 없는 내 사랑', '안아줘야 했는데', '내가 그대를 많이 아껴요', '비가 오면 비를 맞아요'],
    description: '김희재의 첫 미니앨범. 감성 발라드 5곡을 담았고 타이틀곡은 「다신 볼 수 없는 내 사랑」이다.',
    sources: [
      { title: "HEE'story", publisher: '벅스', url: 'https://music.bugs.co.kr/album/20756482' },
      { title: "김희재, 미니 1집 'HEE'story' 발매", publisher: '브릿지경제', url: 'https://www.viva100.com/article/20250903500571' },
    ],
  },
  {
    slug: 'ahn-sung-hoon-love-story', title: '러브스토리', artistSlug: 'ahn-sung-hoon', type: 'mini', releaseDate: '2025-05-13',
    tracks: ['사랑해요', '한 사람을...', '웃어라 친구야', '무정한 야간열차', '비밀이라서'],
    description: '안성훈의 첫 미니앨범. 더블 타이틀곡 「사랑해요」와 「한 사람을...」을 포함해 5곡을 수록했다.',
    sources: [
      { title: '러브스토리', publisher: '벅스', url: 'https://music.bugs.co.kr/album/4119686' },
      { title: "안성훈, 첫 미니 '러브스토리' 발매", publisher: 'MBC', url: 'https://imnews.imbc.com/news/2025/enter/article/6715860_36758.html' },
    ],
  },
  {
    slug: 'young-tak-juicy-go', title: '주시고 (Juicy Go) (Duet with 김연자)', artistSlug: 'young-tak', type: 'single', releaseDate: '2025-07-22',
    tracks: ['주시고 (Juicy Go) (Duet with 김연자)'],
    description: '영탁이 선배 가수 김연자와 함께한 하이브리드 댄스 트로트 디지털 싱글.',
    sources: [
      { title: '주시고 (Juicy Go)', publisher: '벅스', url: 'https://music.bugs.co.kr/album/4123490' },
      { title: "영탁, 김연자와 듀엣…7월 22일 신곡 '주시고' 발매", publisher: '한강타임즈', url: 'https://www.hg-times.com/news/articleView.html?idxno=273278' },
    ],
  },
  {
    slug: 'jeong-dong-won-sopumjip-vol2', title: '소품집 Vol.2', artistSlug: 'jeong-dong-won', type: 'mini', releaseDate: '2026-02-05',
    tracks: ['오늘을 건너 내일 다시 만나는 길', '너에게로 또 다시', '거짓말', '당신', '이등병의 편지'],
    description: '정동원의 리메이크 시리즈 두 번째 미니앨범. 신곡 「오늘을 건너 내일 다시 만나는 길」과 변진섭 「너에게로 또 다시」 리메이크가 더블 타이틀이다.',
    sources: [
      { title: '소품집 Vol.2', publisher: '벅스', url: 'https://music.bugs.co.kr/album/4140022' },
      { title: '해병대 입대 앞둔 정동원, 2월5일 미니앨범 발매', publisher: '문화일보', url: 'https://www.munhwa.com/article/11558648' },
    ],
  },
  {
    slug: 'son-tae-jin-shine', title: 'SHINE', artistSlug: 'son-tae-jin', type: 'album', releaseDate: '2024-10-28',
    tracks: ['그대가 있어 다시', '가면', '꽃', '가을비', '다 잘될 거예요', '널 부르리', '그대 고마워요'],
    description: '손태진의 정규 1집. 트리플 타이틀곡 「가면」·「꽃」·「널 부르리」를 포함한 클래식 기반 보컬 앨범이다.',
    sources: [
      { title: 'SHINE', publisher: '벅스', url: 'https://music.bugs.co.kr/album/20680625' },
      { title: '손태진 발매 앨범 목록', publisher: '벅스', url: 'https://music.bugs.co.kr/artist/31978/albums' },
    ],
  },
  {
    slug: 'son-tae-jin-summer-nostalgia', title: '여름 향수', artistSlug: 'son-tae-jin', type: 'album', releaseDate: '2026-06-10',
    tracks: ['맨 처음 고백', '못 잊어', '잃어버린 우산', '하숙생', '나 그대에게 모두 드리리', '장미', '노래하는 곳에', '오늘 같은 밤', '당신은 안개였나요', '사랑하리 (Duet With 나문희)'],
    description: '손태진의 리메이크 앨범. 트리플 타이틀 「하숙생」·「노래하는 곳에」와 나문희와 듀엣한 「사랑하리」 등 명곡 10곡을 재해석했다.',
    sources: [
      { title: '여름 향수', publisher: '벅스', url: 'https://music.bugs.co.kr/album/20816868' },
      { title: '손태진, 나문희와 듀엣…리메이크 앨범', publisher: '한국경제', url: 'https://www.hankyung.com/article/202606108887H' },
    ],
  },
  {
    slug: 'yang-ji-eun-seokyang', title: '석양', artistSlug: 'yang-ji-eun', type: 'album', releaseDate: '2026-05-13',
    tracks: ['지금은 남이 된 타인', '석양의 길목', '십 년만', '나 미쳐', '남이사', '좋구나 좋아', '둥글둥글', '이화령 하늘재', '사랑한 게 죄라면', '꽃바람 다시 불면', '마중'],
    description: '양지은의 정규 2집. 트리플 타이틀 「지금은 남이 된 타인」 등 정통 트로트에 댄스·EDM을 더한 11곡을 수록했다.',
    sources: [
      { title: '석양', publisher: '벅스', url: 'https://music.bugs.co.kr/album/20810155' },
      { title: "양지은, 정규 2집 '석양' 11곡", publisher: '톱스타뉴스', url: 'https://www.topstarnews.net/news/articleView.html?idxno=16071705' },
    ],
  },
];

// ==================== 검증된 공연 (조사팀 결과로 채움) ====================
const EVENTS: Parameters<typeof upsertEvent>[0][] = [
  {
    slug: 'lim-young-woong-the-stadium2-2026-goyang',
    eventName: '2026 임영웅 콘서트 IM HERO – THE STADIUM 2',
    artistSlugs: ['lim-young-woong'],
    start: '2026-09-04T18:30:00+09:00', end: '2026-09-06T18:30:00+09:00',
    venue: '고양종합운동장 주경기장', region: 'gyeonggi',
    ticketVendor: 'NOL 티켓(인터파크)', ticketOpen: '2026-07-16T20:00:00+09:00',
    eventStatus: 'ticket_open',
    officialSourceUrl: 'https://sports.khan.co.kr/article/202606170818003/',
    sources: [
      { title: '임영웅, 9월 4일 고양을 흔든다', publisher: '스포츠경향', url: 'https://sports.khan.co.kr/article/202606170818003/' },
      { title: "임영웅, 9월 고양서 콘서트 개최…16일 '피케팅' 예고", publisher: '헤럴드경제', url: 'https://biz.heraldcorp.com/article/10801014' },
    ],
  },
  {
    slug: 'miss-trot-4-national-tour-2026',
    eventName: '미스트롯4 전국투어 콘서트',
    artistSlugs: [],
    start: '2026-07-25T00:00:00+09:00', end: '2026-09-05T18:00:00+09:00',
    venue: null, region: 'gyeonggi',
    ticketVendor: '인터파크(NOL 티켓)', eventStatus: 'ticket_open',
    officialSourceUrl: 'https://tickets.interpark.com/contents/notice/detail/12825',
    priceInformation: null,
    sources: [
      { title: '미스트롯4 전국투어 콘서트 – 서울', publisher: 'StagePick', url: 'https://www.stagepick.co.kr/performances/detail/211478' },
      { title: '미스트롯4 전국투어 콘서트 오픈 공지', publisher: '인터파크 NOL 티켓', url: 'https://tickets.interpark.com/contents/notice/detail/12825' },
    ],
  },
];

// 미스트롯4 전국투어: TV조선 《미스트롯4》 TOP7의 방송 연계 투어. 서울 개막(4/25) 이후
// 하반기 잔여 일정으로 의정부(7/25)·안산(8/8)·성남(8/16)·춘천(9/5) 등이 이어짐(StagePick·공연장 공식일정).
// TOP7이 DB 미등록이라 artistSlugs는 빈 배열, 대표 일정만 등록.

async function main() {
  for (const a of ALBUMS) await upsertAlbum(a);
  for (const e of EVENTS) await upsertEvent(e);
  const [ev, mu] = await Promise.all([
    prisma.event.count({ where: { status: 'published' } }),
    prisma.music.count({ where: { status: 'published' } }),
  ]);
  console.log(`✔ 배치16 완료. 추가 앨범 ${ALBUMS.length}, 공연 ${EVENTS.length} · published 공연 ${ev}, 음반/곡 ${mu}`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

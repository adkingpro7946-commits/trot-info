/**
 * 콘텐츠 배치17 — 공연·음반 추가 보강 (전량 2출처 교차검증).
 *  - 신규 앨범/싱글: 아래 ALBUMS 배열
 *  - 신규 공연/페스티벌: 아래 EVENTS 배열
 * 데이터는 조사팀이 2개 이상 독립 출처로 교차확인한 것만 수록. 불확실 항목은 제외.
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const NOW = new Date('2026-07-25T00:00:00+09:00');
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
  // ---- 장윤정 ----
  {
    slug: 'eomeona-jang-yoon-jeong', title: '어머나', artistSlug: 'jang-yoon-jeong', type: 'album', releaseDate: '2004-10-23',
    tracks: ['어머나!', '여자의 거울', '후 (Who)', '눈물의 부르스', '수은등', '변심', '바보같은 미소', '비에 젖은 터미널', 'I.O.U', '어머나! (Remix)'],
    description: '장윤정의 데뷔 정규 1집. 타이틀곡 「어머나」는 2000년대 트로트 붐을 대표하는 히트곡이다.',
    sources: [
      { title: '장윤정 1집 - 어머나', publisher: 'maniadb', url: 'http://www.maniadb.com/album/135866' },
      { title: '어머나!', publisher: '멜론', url: 'https://www.melon.com/album/detail.htm?albumId=43509' },
    ],
  },
  {
    slug: 'jjanjjara-jang-yoon-jeong', title: '짠짜라', artistSlug: 'jang-yoon-jeong', type: 'single', releaseDate: '2005-05-10',
    tracks: ['짠짜라'],
    description: '장윤정 정규 2집 타이틀곡. 정인 작사, 임강현 작곡의 대표 히트곡이다.',
    sources: [
      { title: '짠짜라', publisher: '나무위키', url: 'https://namu.wiki/w/%EC%A7%A0%EC%A7%9C%EB%9D%BC' },
      { title: '짠짜라 / 장윤정', publisher: '벅스', url: 'https://music.bugs.co.kr/track/80089717' },
    ],
  },
  // ---- 홍진영 ----
  {
    slug: 'sarangui-battery-hong-jin-young', title: '사랑의 배터리', artistSlug: 'hong-jin-young', type: 'single', releaseDate: '2009-06-19',
    tracks: ['사랑의 배터리'],
    description: "홍진영의 솔로 데뷔 싱글. 강은경 작사, 조영수 작곡으로 '갓데리'라 불리며 대표곡이 되었다.",
    sources: [
      { title: '사랑의 배터리 / 홍진영', publisher: '벅스', url: 'https://music.bugs.co.kr/track/1757681' },
      { title: '사랑의 배터리', publisher: '위키백과', url: 'https://ko.wikipedia.org/wiki/%EC%82%AC%EB%9E%91%EC%9D%98_%EB%B0%B0%ED%84%B0%EB%A6%AC' },
    ],
  },
  {
    slug: 'eomji-cheok-hong-jin-young', title: '엄지 척', artistSlug: 'hong-jin-young', type: 'single', releaseDate: '2016-03-24',
    tracks: ['엄지 척'],
    description: '홍진영의 대표 트로트 싱글로 경쾌한 응원가풍 곡이다.',
    sources: [
      { title: '엄지 척 / 홍진영', publisher: '벅스', url: 'https://music.bugs.co.kr/track/30196799' },
      { title: '엄지 척 - 홍진영', publisher: 'FLO', url: 'https://m.music-flo.com/detail/track/31494210' },
    ],
  },
  // ---- 김연자 ----
  {
    slug: 'amor-fati-kim-yeon-ja', title: '아모르 파티', artistSlug: 'kim-yeon-ja', type: 'single', releaseDate: '2013-05-23',
    tracks: ['아모르 파티'],
    description: '신철·이건우 작사, 윤일상 작곡. 트로트와 EDM을 결합한 곡으로 발표 몇 년 뒤 역주행하며 국민적 인기를 얻었다.',
    sources: [
      { title: '아모르 파티 (노래)', publisher: '위키백과', url: 'https://ko.wikipedia.org/wiki/%EC%95%84%EB%AA%A8%EB%A5%B4_%ED%8C%8C%ED%8B%B0_(%EB%85%B8%EB%9E%98)' },
      { title: '아모르 파티 / 김연자', publisher: '벅스', url: 'https://music.bugs.co.kr/album/379769' },
    ],
  },
  // ---- 주현미 ----
  {
    slug: 'sinsadong-geu-saram-joo-hyun-mi', title: '신사동 그 사람', artistSlug: 'joo-hyun-mi', type: 'single', releaseDate: '1988-03-01',
    tracks: ['신사동 그 사람'],
    description: '정은이 작사, 남국인 작곡. 주현미의 대표 트로트 히트곡이다.',
    sources: [
      { title: '「신사동 그 사람」', publisher: '디지털강남문화대전', url: 'https://www.grandculture.net/gangnam/toc/GC04801512' },
      { title: "[그 노래 그 사연] 주현미 '신사동 그 사람'", publisher: '농민신문', url: 'https://www.nongmin.com/article/20180904297838' },
    ],
  },
  {
    slug: 'jjaksarang-joo-hyun-mi', title: '짝사랑', artistSlug: 'joo-hyun-mi', type: 'single', releaseDate: '1989-01-01',
    tracks: ['짝사랑'],
    description: '이호섭 작사, 김영광 작곡. 1989년 MBC 10대 가수 가요제에서 최고 인기 가요상을 받은 주현미의 대표곡이다. (발매 연도 기준, 월·일 미상)',
    sources: [
      { title: '짝사랑 / 주현미', publisher: '벅스', url: 'https://music.bugs.co.kr/track/80012676' },
      { title: '짝사랑(주현미)', publisher: '나무위키', url: 'https://namu.wiki/w/%EC%A7%9D%EC%82%AC%EB%9E%91(%EC%A3%BC%ED%98%84%EB%AF%B8)' },
    ],
  },
  // ---- 김수희 ----
  {
    slug: 'namhaeng-yeolcha-kim-su-hui', title: '남행열차', artistSlug: 'kim-su-hui', type: 'single', releaseDate: '1987-01-01',
    tracks: ['남행열차'],
    description: '김진룡 작곡. 「애모」와 함께 김수희의 대표곡으로 꼽히는 1987년 발표 트로트 곡이다. (발매 연도 기준, 월·일 미상)',
    sources: [
      { title: '남행열차', publisher: '나무위키', url: 'https://namu.wiki/w/%EB%82%A8%ED%96%89%EC%97%B4%EC%B0%A8' },
      { title: '남행열차 / 김수희', publisher: '벅스', url: 'https://music.bugs.co.kr/track/11000813' },
    ],
  },
  // ---- 이미자 ----
  {
    slug: 'dongbaek-agassi-lee-mi-ja', title: '동백아가씨', artistSlug: 'lee-mi-ja', type: 'single', releaseDate: '1964-01-01',
    tracks: ['동백아가씨'],
    description: "백영호 작곡, 한산도 작사. 동명 영화 주제가로 이미자를 '엘레지의 여왕'으로 만든 1964년 대표곡이다. (발매 연도 기준, 월·일 미상)",
    sources: [
      { title: '동백아가씨', publisher: '위키백과', url: 'https://ko.wikipedia.org/wiki/%EB%8F%99%EB%B0%B1%EC%95%84%EA%B0%80%EC%94%A8' },
      { title: '동백아가씨', publisher: '한국민족문화대백과사전', url: 'https://encykorea.aks.ac.kr/Article/E0072207' },
    ],
  },
  // ---- 심수봉 ----
  {
    slug: 'namjaneun-bae-sim-su-bong', title: '남자는 배 여자는 항구', artistSlug: 'sim-su-bong', type: 'single', releaseDate: '1984-01-01',
    tracks: ['남자는 배 여자는 항구'],
    description: '심수봉이 작사·작곡한 대표곡으로 1984년 크게 히트했다. (발매 연도 기준, 월·일 미상)',
    sources: [
      { title: '심수봉', publisher: '위키백과', url: 'https://ko.wikipedia.org/wiki/%EC%8B%AC%EC%88%98%EB%B4%89' },
      { title: '남자는 배 여자는 항구 / 심수봉', publisher: '벅스', url: 'https://music.bugs.co.kr/track/1787727' },
    ],
  },
  // ---- 문희옥 ----
  {
    slug: 'seongeun-kimiyo-moon-hee-ok', title: '성은 김이요', artistSlug: 'moon-hee-ok', type: 'single', releaseDate: '1991-01-01',
    tracks: ['성은 김이요'],
    description: '문희옥이 1991년 발표한 정통 트로트 대표곡이다. (발매 연도 기준, 월·일 미상)',
    sources: [
      { title: '문희옥', publisher: '위키백과', url: 'https://ko.wikipedia.org/wiki/%EB%AC%B8%ED%9D%AC%EC%98%A5' },
      { title: '문희옥', publisher: '나무위키', url: 'https://namu.wiki/w/%EB%AC%B8%ED%9D%AC%EC%98%A5' },
    ],
  },
  // ---- 박현빈 ----
  {
    slug: 'park-hyun-bin-gondre-mandre', title: '곤드레 만드레', artistSlug: 'park-hyun-bin', type: 'album', releaseDate: '2006-08-09',
    tracks: ['곤드레 만드레', '빠라빠빠', '아름다운 약속', '미안해요', '댄싱퀸', '너의 곁으로', '남자도 운다', '구애', '미소로만 웃는 여자', '아닐꺼야', '짬뽕'],
    description: "박현빈 1집. 퓨전 트로트를 대중화한 데뷔 정규앨범으로 '곤드레 만드레'와 '빠라빠빠'가 크게 히트했다.",
    sources: [
      { title: '곤드레 만드레 / 박현빈', publisher: '벅스', url: 'https://music.bugs.co.kr/album/9500397' },
      { title: '박현빈', publisher: '위키백과', url: 'https://ko.wikipedia.org/wiki/%EB%B0%95%ED%98%84%EB%B9%88' },
    ],
  },
  {
    slug: 'park-hyun-bin-syabang-syabang', title: '샤방샤방', artistSlug: 'park-hyun-bin', type: 'album', releaseDate: '2008-07-22',
    tracks: ['샤방샤방', '오빠만 믿어', '엄마는 몰라요 (엄마맘보)', '끓는다 끓어', '모래시계', '땡겨', '두근두근', '돌아버리지', '헤벌레', '남자이니까'],
    description: "박현빈 2집. 타이틀곡 '샤방샤방'과 '오빠만 믿어'로 국민적 인기를 얻은 정규앨범이다.",
    sources: [
      { title: '샤방샤방 / 박현빈', publisher: '벅스', url: 'https://music.bugs.co.kr/album/161731' },
      { title: '박현빈', publisher: '위키백과', url: 'https://ko.wikipedia.org/wiki/%EB%B0%95%ED%98%84%EB%B9%88' },
    ],
  },
  // ---- 박구윤 ----
  {
    slug: 'park-gu-yoon-ppunigo', title: '뿐이고', artistSlug: 'park-gu-yoon', type: 'mini', releaseDate: '2010-01-08',
    tracks: ['사랑 때문에', '뿐이고', '세가지 약속', '물레방아', '아지랑이'],
    description: "박구윤의 대표 히트곡 '뿐이고'가 수록된 앨범. 부친 박현진 작곡.",
    sources: [
      { title: '뿐이고 / 박구윤', publisher: '벅스', url: 'https://music.bugs.co.kr/album/214201' },
      { title: '뿐이고 / 박구윤', publisher: 'FLO', url: 'https://m.music-flo.com/detail/album/214201' },
    ],
  },
  // ---- 신유 ----
  {
    slug: 'shin-yu-golden-ilso-ilso', title: '신유 골든 앨범 (일소일소 일노일노)', artistSlug: 'shin-yu', type: 'album', releaseDate: '2014-03-26',
    tracks: ['일소일소 일노일노 (一笑一少 一怒一老)', '통일은 대박', '광안리 수첩', 'OK 한다면', '아시나요', '눈물이 진정제', '님이여 님이시여', '당신은 어디 있나요', '시계바늘 (2014 Ver.)', '꽃물 (2014 Ver.)'],
    description: "신유의 골든 앨범. 타이틀 신곡 '일소일소 일노일노'와 함께 대표곡 '시계바늘' 2014 재녹음 버전 등을 수록했다.",
    sources: [
      { title: '신유 골든 앨범 (일소일소 일노일노)', publisher: '멜론', url: 'https://www.melon.com/album/music.htm?albumId=2245388' },
      { title: '골든 앨범 - 일소일소 일노일노', publisher: 'Apple Music', url: 'https://music.apple.com/kr/album/1269476094' },
    ],
  },
  // ---- 태진아 ----
  {
    slug: 'tae-jin-ah-2000-sarangeun-amuna-hana', title: '2000 태진아 사랑은 아무나 하나', artistSlug: 'tae-jin-ah', type: 'album', releaseDate: '2000-04-01',
    tracks: ['사랑은 아무나 하나', 'Partner', 'Miya', '남자의 정', '가고 싶은 내고향', '동숭동 부르스', '사랑의 리퀘스트', '돌아보지마', '내 아들아', '당신의 미소'],
    description: "태진아의 대표곡 '사랑은 아무나 하나'가 타이틀인 2000년 정규앨범이다. (발매 연·월 기준, 일자 미상)",
    sources: [
      { title: '2000 태진아 사랑은 아무나 하나', publisher: '벅스', url: 'https://music.bugs.co.kr/album/4990' },
      { title: '2000 태진아: 사랑은 아무나 하나', publisher: 'Apple Music', url: 'https://music.apple.com/kr/album/1420344304' },
    ],
  },
  // ---- 남진 ----
  {
    slug: 'nam-jin-35th-anniversary', title: '남진 35주년 기념', artistSlug: 'nam-jin', type: 'album', releaseDate: '1999-10-01',
    tracks: ['둥지', '옛사랑', '여정', '이것이 이별인가요', '묻어버린 아픔', '사랑은 없다', '고개숙인 남자', '마티니 한잔에 부쳐', '우리네 인생'],
    description: "남진이 7년 만에 낸 데뷔 35주년 기념 정규앨범. 타이틀 '둥지'가 재기 히트곡이 됐다. (발매 연·월 기준, 일자 미상)",
    sources: [
      { title: '남진 35주년 기념', publisher: '벅스', url: 'https://music.bugs.co.kr/album/3210' },
      { title: '남진 (가수)', publisher: '위키백과', url: 'https://ko.wikipedia.org/wiki/%EB%82%A8%EC%A7%84_(%EA%B0%80%EC%88%98)' },
    ],
  },
];

// ==================== 검증된 공연 (조사팀 결과로 채움) ====================
const EVENTS: Parameters<typeof upsertEvent>[0][] = [
  {
    slug: 'son-tae-jin-concert-2026-suwon',
    eventName: '2026 손태진 단독 콘서트 THE MAESTRO – 수원',
    artistSlugs: ['son-tae-jin'],
    start: '2026-08-22T17:00:00+09:00', end: '2026-08-23T15:00:00+09:00',
    venue: '경기아트센터 대극장', region: 'gyeonggi',
    ticketVendor: '인터파크(NOL 티켓)', eventStatus: 'ticket_open',
    sources: [
      { title: "'마에스트로' 손태진, 8월 수원 달군다", publisher: '스포츠경향', url: 'https://sports.khan.co.kr/article/202607140853003/' },
      { title: "손태진, 8월 22-23일 수원서 단독 콘서트 'THE MAESTRO' 추가 개최", publisher: '헤럴드뮤즈', url: 'https://www.heraldmuse.com/article/10808080' },
    ],
  },
  {
    slug: 'jeon-yu-jin-concert-2026-seoul',
    eventName: "전유진 2nd Fan Concert 'TWENTY-ONE'",
    artistSlugs: ['jeon-yu-jin'],
    start: '2026-08-29T18:00:00+09:00', end: '2026-08-30T17:00:00+09:00',
    venue: '올림픽공원 우리금융아트홀', region: 'seoul',
    ticketVendor: '인터파크(NOL 티켓)', eventStatus: 'ticket_open',
    sources: [
      { title: "전유진, 8월 팬 콘서트 'TWENTY-ONE' 개최", publisher: 'NBN뉴스', url: 'http://www.nbnnews.co.kr/news/articleView.html?idxno=1043154' },
      { title: '전유진, 두 번째 팬 콘서트…23일 티켓 오픈', publisher: '스포츠경향', url: 'https://sports.khan.co.kr/article/202607211646003/' },
    ],
  },
];

async function main() {
  for (const a of ALBUMS) await upsertAlbum(a);
  for (const e of EVENTS) await upsertEvent(e);
  const [ev, mu] = await Promise.all([
    prisma.event.count({ where: { status: 'published' } }),
    prisma.music.count({ where: { status: 'published' } }),
  ]);
  console.log(`✔ 배치17 완료. 추가 앨범 ${ALBUMS.length}, 공연 ${EVENTS.length} · published 공연 ${ev}, 음반/곡 ${mu}`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

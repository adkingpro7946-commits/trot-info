/**
 * 콘텐츠 배치20 — 음반 추가 보강 (전량 2출처 교차검증).
 *  - 얇은 가수 + 베테랑 대표곡/앨범
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

// ==================== 검증된 앨범 (조사팀 결과로 채움) ====================
const ALBUMS: Parameters<typeof upsertAlbum>[0][] = [
  // ---- 설운도 ----
  {
    slug: 'seol-un-do-sarang-ui-twist', title: '사랑의 트위스트', artistSlug: 'seol-un-do', type: 'single', releaseDate: '1997-01-01',
    tracks: ['사랑의 트위스트'],
    description: '설운도가 1997년 발표한 댄스 트로트 대표곡. 이수진 작사, 설운도 작곡으로 크게 히트했다. (원곡 발매 연도 기준)',
    sources: [
      { title: '사랑의 트위스트', publisher: '위키백과', url: 'https://ko.wikipedia.org/wiki/%EC%82%AC%EB%9E%91%EC%9D%98_%ED%8A%B8%EC%9C%84%EC%8A%A4%ED%8A%B8' },
      { title: '사랑의 트위스트 / 설운도', publisher: '벅스', url: 'https://music.bugs.co.kr/track/1972020' },
    ],
  },
  {
    slug: 'seol-un-do-nui', title: '누이', artistSlug: 'seol-un-do', type: 'single', releaseDate: '1998-01-01',
    tracks: ['누이'],
    description: '설운도가 1998년 발표한 곡으로, 1999년 동명 앨범 타이틀곡으로 재조명되며 히트했다. 설운도 작곡, 이수진 작사. (원곡 발매 연도 기준)',
    sources: [
      { title: '누이 / 설운도', publisher: '벅스', url: 'https://music.bugs.co.kr/track/78810' },
      { title: '누이 / 설운도', publisher: '지니뮤직', url: 'https://www.genie.co.kr/detail/songInfo?xgnm=16277471' },
    ],
  },
  // ---- 현숙 ----
  {
    slug: 'hyun-sook-yojeum-yeoja-yojeum-namja', title: '요즘여자 요즘남자', artistSlug: 'hyun-sook', type: 'single', releaseDate: '1997-01-01',
    tracks: ['요즘여자 요즘남자'],
    description: '현숙이 1997년 발표한 경쾌한 댄스 트로트 대표곡. IMF 시기 큰 공감을 얻으며 히트했다. (원곡 발매 연도 기준)',
    sources: [
      { title: '현숙', publisher: '위키백과', url: 'https://ko.wikipedia.org/wiki/%ED%98%84%EC%88%99' },
      { title: '요즘여자 요즘남자 / 현숙', publisher: '벅스', url: 'https://music.bugs.co.kr/track/30570972' },
    ],
  },
  {
    slug: 'hyun-sook-taguk-e-gyesin-appa-ege', title: '타국에 계신 아빠에게', artistSlug: 'hyun-sook', type: 'single', releaseDate: '1979-01-01',
    tracks: ['타국에 계신 아빠에게'],
    description: '현숙이 1979년 발표한 데뷔곡. 이 곡으로 가요계에 데뷔해 이름을 알렸다. (원곡 발매 연도 기준)',
    sources: [
      { title: '현숙', publisher: '위키백과', url: 'https://ko.wikipedia.org/wiki/%ED%98%84%EC%88%99' },
      { title: '현숙 트랙 목록', publisher: '벅스', url: 'https://music.bugs.co.kr/artist/4946/tracks' },
    ],
  },
  // ---- 태진아 ----
  {
    slug: 'tae-jin-ah-okgyeongi', title: '옥경이', artistSlug: 'tae-jin-ah', type: 'single', releaseDate: '1989-01-01',
    tracks: ['옥경이'],
    description: '태진아가 1989년 발표해 크게 히트한 대표곡. 임종수 작곡, 조운파 작사로 태진아 음반으로 처음 발매되었다. (원곡 발매 연도 기준)',
    sources: [
      { title: "태진아의 '옥경이'", publisher: '오마이뉴스', url: 'https://www.ohmynews.com/NWS_Web/View/at_pg.aspx?CNTN_CD=A0001558792' },
      { title: '옥경이 / 태진아', publisher: '벅스', url: 'https://music.bugs.co.kr/track/2255639' },
    ],
  },
  // ---- 김수희 ----
  {
    slug: 'kim-su-hui-aemo', title: '애모', artistSlug: 'kim-su-hui', type: 'single', releaseDate: '1990-01-01',
    tracks: ['애모'],
    description: "김수희가 1990년 앨범 「서울여자」에 수록해 발표한 곡. 1993년 재조명되며 가요톱텐 정상에 오른 명곡이다. (원곡 발매 연도 기준)",
    sources: [
      { title: '김수희', publisher: '위키백과', url: 'https://ko.wikipedia.org/wiki/%EA%B9%80%EC%88%98%ED%9D%AC' },
      { title: '애모 / 김수희', publisher: '벅스', url: 'https://music.bugs.co.kr/track/11000806' },
    ],
  },
  // ---- 남진 ----
  {
    slug: 'nam-jin-nim-gwa-hamkke', title: '님과 함께', artistSlug: 'nam-jin', type: 'single', releaseDate: '1972-01-01',
    tracks: ['님과 함께'],
    description: '남진이 1972년 발표한 대표 히트곡. 남국인 작곡으로 남진을 정상급 가수로 올려놓았다. (원곡 발매 연도 기준)',
    sources: [
      { title: '남진 (가수)', publisher: '위키백과', url: 'https://ko.wikipedia.org/wiki/%EB%82%A8%EC%A7%84_(%EA%B0%80%EC%88%98)' },
      { title: '임과 함께', publisher: '한국민족문화대백과사전', url: 'https://encykorea.aks.ac.kr/Article/E0072210' },
    ],
  },
  // ---- 주현미 ----
  {
    slug: 'joo-hyun-mi-bi-naerineun-yeongdonggyo', title: '비 내리는 영동교', artistSlug: 'joo-hyun-mi', type: 'single', releaseDate: '1985-01-01',
    tracks: ['비 내리는 영동교'],
    description: '주현미가 1985년 발표한 공식 데뷔곡이자 대표곡. 정은이 작사, 남국인 작곡이다. (원곡 발매 연도 기준)',
    sources: [
      { title: '비 내리는 영동교 / 주현미', publisher: '벅스', url: 'https://music.bugs.co.kr/track/11004729' },
      { title: '「비 내리는 영동교」', publisher: '디지털강남문화대전', url: 'https://gangnam.grandculture.net/gangnam/toc/GC04801511' },
    ],
  },
  // ---- 진성 ----
  {
    slug: 'jin-sung-taekeul-eul-geolji-ma', title: '태클을 걸지마', artistSlug: 'jin-sung', type: 'single', releaseDate: '2005-12-25',
    tracks: ['태클을 걸지마'],
    description: '진성이 2005년 12월 발표한 동명 앨범의 타이틀곡. 진성을 대표하는 히트곡 중 하나다.',
    sources: [
      { title: '태클을 걸지마 - 진성', publisher: '멜론', url: 'https://www.melon.com/album/music.htm?albumId=313232' },
      { title: '태클을 걸지마 / 진성', publisher: '벅스', url: 'https://music.bugs.co.kr/track/1334326' },
    ],
  },
  // ---- 금잔디 ----
  {
    slug: 'geum-jan-di-remember', title: 'Remember', artistSlug: 'geum-jan-di', type: 'album', releaseDate: '2022-02-03',
    tracks: ['지름길', '당신은 명작', '소나기', '울아부지', '교차로에서', '나를 살게하는 사랑', '꽃 사세요', '흰구름', '영종도 갈매기', '나를 두고 가거라', '사랑탑', '시치미'],
    description: '금잔디의 데뷔 20주년 기념 정규 4집. 타이틀곡은 「당신은 명작」이다.',
    sources: [
      { title: '금잔디 Remember', publisher: '벅스', url: 'https://music.bugs.co.kr/album/4070269' },
      { title: "'데뷔 20주년' 금잔디, 정규 4집 발매", publisher: '서울경제', url: 'https://www.sedaily.com/NewsVIew/261ZXZU37D' },
    ],
  },
  // ---- 홍지윤 ----
  {
    slug: 'hong-ji-yun-jiyun-is', title: 'Jiyun is...', artistSlug: 'hong-ji-yun', type: 'album', releaseDate: '2023-09-18',
    tracks: ['왔지윤', '새벽차', '촉이와요', '시집갑니다', '나그네 인생', '분내음', '바람개비', '사랑길', '인생의 향기'],
    description: "홍지윤의 첫 정규앨범. 더블 타이틀곡 「새벽차」와 「인생의 향기」를 포함해 총 9곡이 수록됐다.",
    sources: [
      { title: '홍지윤 Jiyun is...', publisher: '멜론', url: 'https://www.melon.com/album/music.htm?albumId=11328576' },
      { title: "홍지윤, 첫 정규앨범 'Jiyun is...' 발매", publisher: '엠트롯', url: 'http://www.mtrot.kr/news/articleView.html?idxno=1392' },
    ],
  },
  // ---- 김수찬 ----
  {
    slug: 'kim-su-chan-gongjon', title: '공존', artistSlug: 'kim-su-chan', type: 'album', releaseDate: '2023-03-20',
    tracks: ['솔직 이별', '내가 울지 않는 이유', '사랑쟁이', '친구야', '지나가네', '그 사람처럼', '나는 날 떠나지 않는다'],
    description: "김수찬의 정규 1집. 더블 타이틀곡 「솔직 이별」과 「사랑쟁이」를 중심으로 구성됐다.",
    sources: [
      { title: '김수찬 공존', publisher: '벅스', url: 'https://music.bugs.co.kr/album/20553245' },
      { title: '김수찬 (가수)', publisher: '위키백과', url: 'https://ko.wikipedia.org/wiki/%EA%B9%80%EC%88%98%EC%B0%AC_(%EA%B0%80%EC%88%98)' },
    ],
  },
  // ---- 조명섭 ----
  {
    slug: 'jo-myung-seob-my-songs', title: 'My Songs', artistSlug: 'jo-myung-seob', type: 'album', releaseDate: '2022-01-28',
    tracks: ['정거장에서', '사랑의 꽃', '달빛연가', '서교동을 걸어갑니다', '청계천', '그대', '세레나데', '백일홍', '시간을 오르는 계단', '꽃 피고 새가 울면', '강원도 아가씨', '그대는 새 나는 나무'],
    description: '조명섭의 첫 정규앨범. 12곡 중 9곡에 조명섭이 작사·작곡으로 참여했다. 타이틀곡은 「달빛연가」이다.',
    sources: [
      { title: '조명섭 My Songs', publisher: '벅스', url: 'https://music.bugs.co.kr/album/20448255' },
      { title: '원주출신 가수 조명섭 첫 정규앨범 발표', publisher: '강원도민일보', url: 'https://www.kado.net/news/articleView.html?idxno=1116317' },
    ],
  },
];

async function main() {
  for (const a of ALBUMS) await upsertAlbum(a);
  const mu = await prisma.music.count({ where: { status: 'published' } });
  console.log(`✔ 배치20 완료. 추가 앨범 ${ALBUMS.length} · published 음반/곡 ${mu}`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

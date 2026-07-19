/**
 * 콘텐츠 배치15 — 음반·공연 대폭 보강.
 *  - 정규앨범 6종(수록곡 전체): 임영웅 IM HERO·송가인 佳人·영탁 MMM·이찬원 ONE·박지현 MASTER VOICE·장민호 에세이 ep.3
 *  - 다가오는 검증 공연 11건: 무명전설 전국투어 8, 현역가왕 패밀리 페스티벌 3 (+ 무명전설 프로그램)
 *  - 김용빈 대표곡을 검증된 우승 특전곡으로 정정
 * 현역가왕 페스티벌은 날짜·도시·예매처 다출처 확인, 공연장은 미공개라 venue 미표기.
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const NOW = new Date('2026-07-19T00:00:00+09:00');
const D = (s: string) => new Date(s);
const idOf = async (slug: string) => (await prisma.artist.findUnique({ where: { slug }, select: { id: true } }))?.id ?? null;

async function upsertAlbum(slug: string, title: string, artistSlug: string, releaseDate: string, tracks: string[], description: string, sourceUrl: string, sourcePublisher: string, type = 'album') {
  const aid = await idOf(artistSlug);
  await prisma.music.upsert({ where: { slug }, update: {}, create: { slug, title, status: 'draft' } });
  const m = await prisma.music.update({
    where: { slug },
    data: { title, type, releaseDate: D(releaseDate), trackList: JSON.stringify(tracks), description, isSample: false, status: 'published', artists: { set: aid ? [{ id: aid }] : [] } },
  });
  await prisma.source.deleteMany({ where: { musicId: m.id } });
  await prisma.source.create({ data: { musicId: m.id, sourceTitle: `${title} 수록곡`, sourcePublisher, sourceUrl, sourceGrade: 'B', factType: 'release', verificationStatus: 'cross_checked', accessedAt: NOW } });
}

async function upsertEvent(e: {
  slug: string; eventName: string; start: string; end?: string; venue?: string | null; region: string; artistSlugs: string[];
  ticketVendor?: string; ticketOpen?: string; priceInformation?: string; eventStatus: string; officialSourceUrl?: string;
  sourceTitle: string; sourcePublisher: string; sourceUrl: string; sourceGrade?: string;
}) {
  await prisma.event.upsert({ where: { slug: e.slug }, update: {}, create: { slug: e.slug, eventName: e.eventName, startDateTime: D(e.start), status: 'draft' } });
  const ids: { id: string }[] = [];
  for (const s of e.artistSlugs) { const id = await idOf(s); if (id) ids.push({ id }); }
  const ev = await prisma.event.update({
    where: { slug: e.slug },
    data: {
      eventName: e.eventName, eventType: 'concert', startDateTime: D(e.start), endDateTime: e.end ? D(e.end) : null,
      venue: e.venue ?? null, region: e.region, ticketVendor: e.ticketVendor, ticketOpenDate: e.ticketOpen ? D(e.ticketOpen) : null,
      priceInformation: e.priceInformation, officialSourceUrl: e.officialSourceUrl, eventStatus: e.eventStatus,
      isSample: false, status: 'published', sourceCheckedAt: NOW, artists: { set: ids },
    },
  });
  await prisma.source.deleteMany({ where: { eventId: ev.id } });
  await prisma.source.create({ data: { eventId: ev.id, sourceTitle: e.sourceTitle, sourcePublisher: e.sourcePublisher, sourceUrl: e.sourceUrl, sourceGrade: e.sourceGrade ?? 'B', factType: 'schedule', verificationStatus: 'cross_checked', accessedAt: NOW } });
}

async function main() {
  // ---------------- 앨범 6종 ----------------
  await upsertAlbum('im-hero', 'IM HERO', 'lim-young-woong', '2022-05-02',
    ['다시 만날 수 있을까', '무지개', '손이 참 곱던 그대', '우리들의 블루스', '아버지', 'A bientot', '사랑역', '보금자리', '사랑해 진짜', '연애편지', '사랑해요 그대를', '인생찬가'],
    '임영웅의 정규 1집. 타이틀곡은 「다시 만날 수 있을까」이다.', 'https://music.bugs.co.kr/album/20462525', '벅스');

  await upsertAlbum('ga-in-album', '가인(佳人)', 'song-ga-in', '2019-11-04',
    ['엄마아리랑', '이별의 영동선', '서울의 달', '가인이어라', '사랑에 빠져봅시다', '어머님 사랑합니다', '무명배우', '단장의 미아리 고개', '영동 블루스', '용두산 엘레지', '한 많은 대동강'],
    '송가인의 정규 1집. 「엄마아리랑」·「가인이어라」 등이 수록됐다. (인스트루멘털 버전 포함 총 21트랙)', 'https://music.bugs.co.kr/album/20286036', '벅스');

  await upsertAlbum('youngtak-mmm', 'MMM', 'young-tak', '2022-07-04',
    ['담', '재잘대', '우주선', '신사답게 (MMM)', 'Second Chance', '달이 되어', '머선 129', '찬찬히', '갈색우산', '아내', '한량가', '안녕 김녕'],
    '영탁의 정규 1집. 타이틀곡은 「신사답게 (MMM)」이다.', 'https://music.bugs.co.kr/album/4077412', '벅스');

  await upsertAlbum('leechanwon-one', 'ONE', 'lee-chan-won', '2023-02-20',
    ['사나이 청춘', '건배', '풍등', '바람 같은 사람', '트위스트고고', '밥 한 번 먹자', '오.내.언.사', '나와 함께 가시렵니까', '망원동 부르스', '좋아 좋아'],
    '이찬원의 정규 1집. 타이틀곡은 「풍등」이다.', 'https://www.melon.com/album/detail.htm?albumId=11180361', '멜론');

  await upsertAlbum('master-voice', 'MASTER VOICE', 'park-ji-hyun', '2026-02-23',
    ['Opening', '기도', '아름다운 인생 이야기', 'Dancing In Love', '안녕이란 슬픈 말', '애간장', '만물트럭', '초대장', '무(無)', '무(無) (Inst.)'],
    '박지현의 데뷔 첫 정규앨범. 타이틀곡은 「무(無)」이며 전곡을 윤명선이 프로듀싱했다.', 'https://www.spotvnews.co.kr/news/articleView.html?idxno=799300', 'SPOTV뉴스');

  await upsertAlbum('jangminho-essay3', '에세이 ep.3', 'jang-min-ho', '2024-11-28',
    ['오십(五十)', '사랑의 티키타카', '홀씨', '마음의 나이', '살자', '으라차차차'],
    '장민호의 세 번째 미니앨범. 타이틀곡은 「사랑의 티키타카」이다.', 'https://m.ekn.kr/view.php?key=20241107022457940', 'EKN', 'album');

  // 김용빈 대표곡을 검증된 우승 특전곡으로 정정
  const kyb = await idOf('kim-yong-bin');
  if (kyb) {
    await prisma.music.update({
      where: { slug: 'gold-spoon' },
      data: {
        title: '어제도 너였고 오늘도 너여서', type: 'single', releaseDate: D('2025-07-17'),
        description: '김용빈의 《미스터트롯3》 우승 특전곡(영탁 프로듀싱).', status: 'published',
      },
    });
    await prisma.source.deleteMany({ where: { music: { slug: 'gold-spoon' } } });
    const gm = await prisma.music.findUnique({ where: { slug: 'gold-spoon' }, select: { id: true } });
    if (gm) await prisma.source.create({ data: { musicId: gm.id, sourceTitle: '김용빈 우승 특전곡', sourcePublisher: '아시아경제', sourceUrl: 'https://view.asiae.co.kr/article/2025071710352821283', sourceGrade: 'B', factType: 'release', verificationStatus: 'cross_checked', accessedAt: NOW } });
  }

  // ---------------- 프로그램: 무명전설 ----------------
  await prisma.program.upsert({
    where: { slug: 'unsung-legend' },
    update: {},
    create: {
      slug: 'unsung-legend', name: '무명전설 - 트롯 사내들의 서열전쟁', broadcaster: 'MBN',
      airInfo: '2026년 방영', description: 'MBN의 남성 트로트 경연 프로그램(2026). TOP7이 전국투어 콘서트를 이어간다.',
      isSample: false, status: 'published',
    },
  });

  // ---------------- 무명전설 전국투어 8건 ----------------
  const IP = '인터파크(NOL 티켓)';
  const umSrc = { sourceTitle: '2026 무명전설 전국투어 안내', sourcePublisher: IP, sourceUrl: 'https://tickets.interpark.com/goods/26006022' };
  const tour: [string, string, string, string, string, string][] = [
    ['unsung-2026-suwon', '수원', '2026-07-25T18:00:00+09:00', '2026-07-26T18:00:00+09:00', '경희대 국제캠퍼스 선승관', 'gyeonggi'],
    ['unsung-2026-daejeon', '대전', '2026-08-01T18:00:00+09:00', '', 'DCC 대전컨벤션센터 제2전시장', 'daejeon'],
    ['unsung-2026-goyang', '고양', '2026-08-08T18:00:00+09:00', '', '고양아람누리 아람극장', 'gyeonggi'],
    ['unsung-2026-gwangju', '광주', '2026-08-22T18:00:00+09:00', '', '김대중컨벤션센터', 'gwangju'],
    ['unsung-2026-busan', '부산', '2026-08-29T18:00:00+09:00', '', '벡스코 제1전시장 1홀', 'busan'],
    ['unsung-2026-bucheon', '부천', '2026-09-05T18:00:00+09:00', '', '부천실내체육관', 'gyeonggi'],
    ['unsung-2026-jeonju', '전주', '2026-09-12T18:00:00+09:00', '', '한국소리문화의전당 야외공연장', 'other'],
    ['unsung-2026-cheongju', '청주', '2026-09-19T18:00:00+09:00', '', '청주대 석우문화체육관', 'other'],
  ];
  for (const [slug, city, start, end, venue, region] of tour) {
    await upsertEvent({
      slug, eventName: `2026 무명전설 전국투어 콘서트 – ${city}`, start, end: end || undefined, venue, region,
      artistSlugs: ['hwang-yun-seong'], ticketVendor: IP, priceInformation: 'R 154,000 / S 143,000원',
      eventStatus: 'ticket_open', officialSourceUrl: 'https://tickets.interpark.com/goods/26006022', ...umSrc,
    });
  }

  // ---------------- 현역가왕 패밀리 페스티벌 3건 (공연장 미공개 → venue 미표기) ----------------
  const hf = { sourcePublisher: '스포츠경향', sourceUrl: 'https://sports.khan.co.kr/article/202607100833003/' };
  await upsertEvent({
    slug: 'hyeon-festival-2026-busan', eventName: '2026 현역가왕 패밀리 페스티벌 – 부산',
    start: '2026-08-15T18:00:00+09:00', end: '2026-08-16T18:00:00+09:00', venue: null, region: 'busan',
    artistSlugs: ['hong-ji-yun', 'jeon-yu-jin', 'kang-hye-yeon', 'park-seo-jin', 'byeol-sarang'],
    ticketVendor: IP, ticketOpen: '2026-07-10T14:00:00+09:00', eventStatus: 'scheduled',
    sourceTitle: '현역가왕 패밀리 페스티벌 개최', ...hf,
  });
  await upsertEvent({
    slug: 'hyeon-festival-2026-seoul', eventName: '2026 현역가왕 패밀리 페스티벌 – 서울',
    start: '2026-08-22T18:00:00+09:00', end: '2026-08-23T18:00:00+09:00', venue: null, region: 'seoul',
    artistSlugs: ['jeon-yu-jin'], ticketVendor: IP, ticketOpen: '2026-07-10T15:00:00+09:00', eventStatus: 'scheduled',
    sourceTitle: '현역가왕 패밀리 페스티벌 개최', ...hf,
  });
  await upsertEvent({
    slug: 'hyeon-festival-2026-daegu', eventName: '2026 현역가왕 패밀리 페스티벌 – 대구',
    start: '2026-08-29T18:00:00+09:00', venue: null, region: 'daegu',
    artistSlugs: [], ticketVendor: IP, ticketOpen: '2026-07-10T16:00:00+09:00', eventStatus: 'scheduled',
    sourceTitle: '현역가왕 패밀리 페스티벌 개최', ...hf,
  });

  const [ev, mu] = await Promise.all([
    prisma.event.count({ where: { status: 'published' } }),
    prisma.music.count({ where: { status: 'published' } }),
  ]);
  console.log(`✔ 배치15 완료. published — 공연 ${ev}, 음반/곡 ${mu}`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

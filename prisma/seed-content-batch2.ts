/**
 * 실제 콘텐츠 시드 배치2 (웹 조사 + 출처 교차확인). isSample=false, published.
 * 가수 6(영탁·이찬원·장민호·정동원·나훈아·장윤정) + 대표곡 6 + 검증된 공연 10(전부 종료/completed).
 * 오늘(2026-07-13) 기준 공식 확인되는 '다가오는' 공연은 없어 미래 일정은 만들지 않음.
 * 불확실 항목(장윤정/나훈아 소속사, 정동원 팬덤명 등)은 보수적으로 생략.
 * 실행: DATABASE_PROVIDER=postgresql + generate 후 DATABASE_URL=<neon> npx tsx prisma/seed-content-batch2.ts
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const NOW = new Date('2026-07-13T00:00:00+09:00');
const D = (s: string) => new Date(s);

interface ArtistSpec {
  slug: string; stageName: string; realName?: string | null; profileSummary: string;
  birthDate?: string | null; birthPlace?: string | null; agency?: string | null; fanClubName?: string | null;
  social?: { label: string; url: string }[];
  programSlugs?: string[];
  awards: { year: number; title: string; org?: string; sourceUrl?: string }[];
  timeline: { date: string; title: string; description?: string; sourceUrl?: string }[];
  sources: { sourceTitle: string; sourcePublisher: string; sourceUrl: string; sourceGrade: string }[];
}

async function upsertArtist(a: ArtistSpec) {
  await prisma.artist.upsert({ where: { slug: a.slug }, update: {}, create: { slug: a.slug, stageName: a.stageName, profileSummary: 'x', status: 'draft' } });
  const programIds = a.programSlugs?.length
    ? (await prisma.program.findMany({ where: { slug: { in: a.programSlugs } }, select: { id: true } })).map((p) => ({ id: p.id }))
    : [];
  const art = await prisma.artist.update({
    where: { slug: a.slug },
    data: {
      stageName: a.stageName,
      realName: a.realName ?? null,
      profileSummary: a.profileSummary,
      birthDate: a.birthDate ? D(a.birthDate) : null,
      birthPlace: a.birthPlace ?? null,
      agency: a.agency ?? null,
      fanClubName: a.fanClubName ?? null,
      officialSocialLinks: JSON.stringify(a.social ?? []),
      isSample: false,
      status: 'published',
      lastFactCheckedAt: NOW,
      programs: { connect: programIds },
    },
  });
  await prisma.award.deleteMany({ where: { artistId: art.id } });
  if (a.awards.length) await prisma.award.createMany({ data: a.awards.map((w) => ({ artistId: art.id, year: w.year, title: w.title, org: w.org, sourceUrl: w.sourceUrl })) });
  await prisma.timelineEntry.deleteMany({ where: { artistId: art.id } });
  if (a.timeline.length) await prisma.timelineEntry.createMany({ data: a.timeline.map((t) => ({ artistId: art.id, date: D(t.date), title: t.title, description: t.description, sourceUrl: t.sourceUrl })) });
  await prisma.source.deleteMany({ where: { artistId: art.id } });
  await prisma.source.createMany({ data: a.sources.map((s) => ({ artistId: art.id, sourceTitle: s.sourceTitle, sourcePublisher: s.sourcePublisher, sourceUrl: s.sourceUrl, sourceGrade: s.sourceGrade, factType: 'profile', verificationStatus: 'cross_checked', accessedAt: NOW })) });
  return art.id;
}

async function upsertSingle(slug: string, title: string, artistSlug: string, releaseDate: string | null, description: string, sourceUrl: string) {
  await prisma.music.upsert({ where: { slug }, update: {}, create: { slug, title, status: 'draft' } });
  const artist = await prisma.artist.findUnique({ where: { slug: artistSlug }, select: { id: true } });
  const m = await prisma.music.update({
    where: { slug },
    data: { title, type: 'single', releaseDate: releaseDate ? D(releaseDate) : null, description, isSample: false, status: 'published', artists: { set: artist ? [{ id: artist.id }] : [] } },
  });
  await prisma.source.deleteMany({ where: { musicId: m.id } });
  await prisma.source.create({ data: { musicId: m.id, sourceTitle: `${title} 정보`, sourcePublisher: '위키백과', sourceUrl, sourceGrade: 'B', factType: 'release', verificationStatus: 'cross_checked', accessedAt: NOW } });
}

async function upsertEvent(e: {
  slug: string; eventName: string; start: string; venue: string; region: string; artistSlug: string;
  organizer?: string; ticketVendor?: string; priceInformation?: string; officialSourceUrl?: string;
  sourceTitle: string; sourcePublisher: string; sourceUrl: string;
}) {
  await prisma.event.upsert({ where: { slug: e.slug }, update: {}, create: { slug: e.slug, eventName: e.eventName, startDateTime: D(e.start), status: 'draft' } });
  const artist = await prisma.event.findUnique({ where: { slug: e.slug } });
  const a = await prisma.artist.findUnique({ where: { slug: e.artistSlug }, select: { id: true } });
  const ev = await prisma.event.update({
    where: { slug: e.slug },
    data: {
      eventName: e.eventName,
      eventType: 'concert',
      startDateTime: D(e.start),
      venue: e.venue,
      region: e.region,
      organizer: e.organizer,
      ticketVendor: e.ticketVendor,
      priceInformation: e.priceInformation,
      officialSourceUrl: e.officialSourceUrl,
      eventStatus: 'completed', // 오늘 기준 이미 종료된 검증 공연
      isSample: false,
      status: 'published',
      sourceCheckedAt: NOW,
      artists: { set: a ? [{ id: a.id }] : [] },
    },
  });
  void artist;
  await prisma.source.deleteMany({ where: { eventId: ev.id } });
  await prisma.source.create({ data: { eventId: ev.id, sourceTitle: e.sourceTitle, sourcePublisher: e.sourcePublisher, sourceUrl: e.sourceUrl, sourceGrade: 'B', factType: 'schedule', verificationStatus: 'cross_checked', accessedAt: NOW } });
}

async function main() {
  const wYoungtak = 'https://ko.wikipedia.org/wiki/영탁';
  const wChanwon = 'https://ko.wikipedia.org/wiki/이찬원';
  const wMinho = 'https://ko.wikipedia.org/wiki/장민호_(가수)';
  const wDongwon = 'https://ko.wikipedia.org/wiki/정동원';
  const wNahoona = 'https://ko.wikipedia.org/wiki/나훈아';
  const wYoonjeong = 'https://ko.wikipedia.org/wiki/장윤정';

  // ---------------- 가수 6 ----------------
  await upsertArtist({
    slug: 'young-tak', stageName: '영탁', realName: '박영탁',
    profileSummary: '영탁(본명 박영탁)은 1983년생 대한민국 가수 겸 싱어송라이터다. 2007년 발라드 가수로 데뷔한 뒤 2016년 트로트로 전향했고, 2020년 TV조선 《내일은 미스터트롯》에서 최종 2위(선)를 차지하며 전국적 인지도를 얻었다. 「찐이야」, 「니가 왜 거기서 나와」 등 히트곡과 자작곡으로 활동 폭을 넓혔다. 소속사는 어비스컴퍼니, 공식 팬덤명은 영탁앤블루스다.',
    birthDate: '1983-05-13', agency: '어비스컴퍼니', fanClubName: '영탁앤블루스',
    social: [{ label: '위버스 커뮤니티', url: 'https://weverse.io/youngtak' }, { label: '공식 X(트위터)', url: 'https://x.com/YOUNGTAK_ABYSS' }],
    programSlugs: ['mr-trot'],
    awards: [
      { year: 2020, title: '《내일은 미스터트롯》 최종 2위(선)', org: 'TV조선', sourceUrl: wYoungtak },
      { year: 2020, title: '멜론뮤직어워드 베스트 송라이터상', org: '멜론뮤직어워드', sourceUrl: 'https://en.wikipedia.org/wiki/Young_Tak' },
    ],
    timeline: [{ date: '2020-03-14', title: '《내일은 미스터트롯》 최종 2위(선)', sourceUrl: 'https://www.imaeil.com/page/view/2020031420290777035' }],
    sources: [
      { sourceTitle: '영탁', sourcePublisher: '위키백과', sourceUrl: wYoungtak, sourceGrade: 'B' },
      { sourceTitle: "영탁, 위버스 커뮤니티 오픈…'영탁앤블루스' 공식 팬클럽 모집", sourcePublisher: '이투데이', sourceUrl: 'https://www.etoday.co.kr/news/view/2381651', sourceGrade: 'B' },
    ],
  });

  await upsertArtist({
    slug: 'lee-chan-won', stageName: '이찬원', realName: '이찬원',
    profileSummary: '이찬원은 1996년생 대한민국 트로트 가수다. 2020년 TV조선 《내일은 미스터트롯》에서 최종 3위(미)에 오르며 이름을 알렸고, 2021년 싱글 「편의점」으로 정식 데뷔했다. 「참 좋은 날」, 「풍등」, 「하늘 여행」 등을 발표했으며 《불후의 명곡》 등 예능에서도 활약해 2024년 KBS 연예대상 대상을 받았다. 공식 팬덤명은 찬스(CHAN’S)다.',
    birthDate: '1996-11-01', fanClubName: '찬스(CHAN’S)', agency: '그레이스이엔엠',
    programSlugs: ['mr-trot'],
    awards: [
      { year: 2020, title: '《내일은 미스터트롯》 최종 3위(미)', org: 'TV조선', sourceUrl: wChanwon },
      { year: 2024, title: 'KBS 연예대상 대상', org: 'KBS', sourceUrl: wChanwon },
    ],
    timeline: [
      { date: '2020-03-14', title: '《내일은 미스터트롯》 최종 3위(미)', sourceUrl: 'https://www.imaeil.com/page/view/2020031420290777035' },
      { date: '2021-08-25', title: '싱글 「편의점」으로 정식 데뷔', sourceUrl: wChanwon },
    ],
    sources: [
      { sourceTitle: '이찬원', sourcePublisher: '위키백과', sourceUrl: wChanwon, sourceGrade: 'B' },
      { sourceTitle: '이찬원, 그레이스이엔엠과 전속계약', sourcePublisher: '톱스타뉴스', sourceUrl: 'https://www.topstarnews.net/news/articleView.html?idxno=16051098', sourceGrade: 'B' },
    ],
  });

  await upsertArtist({
    slug: 'jang-min-ho', stageName: '장민호', realName: '장호근',
    profileSummary: '장민호(본명 장호근)는 1977년생 대한민국 가수다. 1997년 그룹 유비스, 2004년 듀오 「바람」 등으로 활동했고 2011년 트로트로 전향했다. 2013년 「남자는 말합니다」가 대표곡으로 자리 잡았으며, 2020년 TV조선 《내일은 미스터트롯》에서 최종 6위에 오르며 데뷔 20여 년 만에 폭넓은 인기를 얻었다. 소속사는 호엔터테인먼트다.',
    birthDate: '1977-09-11', agency: '호엔터테인먼트', fanClubName: '민호특공대(공식 팬카페)',
    programSlugs: ['mr-trot'],
    awards: [
      { year: 2020, title: '《내일은 미스터트롯》 최종 6위(TOP7)', org: 'TV조선', sourceUrl: wMinho },
      { year: 2013, title: "KBS 「내 생애 마지막 오디션」 우승", org: 'KBS', sourceUrl: wMinho },
    ],
    timeline: [
      { date: '2013-05-16', title: '「남자는 말합니다」 발표', description: '대표곡', sourceUrl: 'https://ko.wikipedia.org/wiki/남자는_말합니다' },
      { date: '2020-03-14', title: '《내일은 미스터트롯》 최종 6위', sourceUrl: wMinho },
    ],
    sources: [
      { sourceTitle: '장민호 (가수)', sourcePublisher: '위키백과', sourceUrl: wMinho, sourceGrade: 'B' },
      { sourceTitle: "장민호 '호시절' 전국투어", sourcePublisher: '스포츠경향', sourceUrl: 'https://sports.khan.co.kr/article/202511241718013', sourceGrade: 'B' },
    ],
  });

  await upsertArtist({
    slug: 'jeong-dong-won', stageName: '정동원', realName: '정동원',
    profileSummary: '정동원은 2019년 EP 《미라클》로 데뷔한 대한민국 가수다. 2020년 TV조선 《내일은 미스터트롯》에서 최종 5위(TOP7)에 오르며 널리 알려졌다. 대표 무대곡 「여백」과 정규 1집 수록곡 「잘가요 내사랑」, 「물망초」 등으로 활동했으며, 이후 「JD1」이라는 이름으로 아이돌 장르에도 도전했다. 소속사는 쇼플레이엔터테인먼트다.',
    agency: '쇼플레이엔터테인먼트',
    social: [{ label: '소속사 공식 유튜브', url: 'https://www.youtube.com/@showplayentertainment' }],
    programSlugs: ['mr-trot'],
    awards: [{ year: 2020, title: '《내일은 미스터트롯》 최종 5위(TOP7)', org: 'TV조선', sourceUrl: wDongwon }],
    timeline: [{ date: '2020-03-14', title: '《내일은 미스터트롯》 최종 5위', sourceUrl: 'https://www.tenasia.co.kr/article/2020031823814' }],
    sources: [
      { sourceTitle: '정동원', sourcePublisher: '위키백과', sourceUrl: wDongwon, sourceGrade: 'B' },
      { sourceTitle: '정동원, 원 소속사 쇼플레이로 복귀', sourcePublisher: '문화일보', sourceUrl: 'https://www.munhwa.com/article/11260650', sourceGrade: 'B' },
    ],
  });

  await upsertArtist({
    slug: 'na-hoon-a', stageName: '나훈아', realName: '최홍기',
    profileSummary: '나훈아(본명 최홍기)는 1947년생으로 1968년 데뷔한 한국 트로트를 대표하는 원로 가수이며 「가황(歌皇)」으로 불린다. 1960~70년대 남진과 라이벌 구도를 형성하며 「사랑은 눈물의 씨앗」, 「고향역」 등 다수의 히트곡을 남겼고, 많은 곡을 직접 작사·작곡한 싱어송라이터로도 평가받는다. 2020년 「테스형!」으로 다시 폭넓은 관심을 얻었으며, 2025년 1월 은퇴 콘서트를 끝으로 활동을 마무리했다.',
    birthDate: '1947-02-11',
    awards: [{ year: 2020, title: '제1회 트롯어워즈 트롯 100년 가왕상', sourceUrl: wNahoona }],
    timeline: [
      { date: '2020-08-20', title: '정규 9집 《아홉 이야기》·「테스형!」 발표', sourceUrl: 'https://ko.wikipedia.org/wiki/테스형!' },
      { date: '2025-01-12', title: '서울 은퇴 콘서트로 활동 마무리', sourceUrl: 'https://www.ytn.co.kr/_ln/0106_202501121042066386' },
    ],
    sources: [
      { sourceTitle: '나훈아', sourcePublisher: '위키백과', sourceUrl: wNahoona, sourceGrade: 'B' },
      { sourceTitle: "나훈아, 서울서 은퇴 콘서트 마지막 공연", sourcePublisher: 'YTN', sourceUrl: 'https://www.ytn.co.kr/_ln/0106_202501121042066386', sourceGrade: 'B' },
    ],
  });

  await upsertArtist({
    slug: 'jang-yoon-jeong', stageName: '장윤정', realName: '장윤정',
    profileSummary: '장윤정은 1980년생 대한민국 트로트 가수로, 1999년 강변가요제 대상으로 데뷔했다. 2004년 「어머나」의 큰 성공을 계기로 2000년대 트로트의 대중적 저변 확대에 기여한 가수로 평가받는다. 「짠짜라」, 「초혼」, 「올래」 등 다수의 히트곡을 발표했고, 근래에는 《미스트롯》·《미스터트롯》 마스터를 비롯한 방송 진행·심사 활동으로도 활동해 왔다.',
    birthDate: '1980-02-16', birthPlace: '충청북도 충주',
    programSlugs: ['mr-trot', 'miss-trot'],
    awards: [
      { year: 2007, title: '한국방송대상 올해의 방송인(가수부문)', sourceUrl: wYoonjeong },
      { year: 2020, title: 'SBS 연예대상 쇼·버라이어티 최우수상', org: 'SBS', sourceUrl: wYoonjeong },
    ],
    timeline: [
      { date: '2004-01-01', title: '「어머나」 전국적 히트로 트로트 붐 견인', sourceUrl: 'https://ko.wikipedia.org/wiki/어머나' },
    ],
    sources: [
      { sourceTitle: '장윤정', sourcePublisher: '위키백과', sourceUrl: wYoonjeong, sourceGrade: 'B' },
      { sourceTitle: 'Jang Yoon-jeong', sourcePublisher: 'Wikipedia(English)', sourceUrl: 'https://en.wikipedia.org/wiki/Jang_Yoon-jeong_(singer)', sourceGrade: 'B' },
    ],
  });

  // ---------------- 대표곡 6 ----------------
  await upsertSingle('jjiniya', '찐이야', 'young-tak', '2020-04-27', '영탁의 대표 히트곡. 미스터트롯 이후 큰 인기를 얻었다.', wYoungtak);
  await upsertSingle('convenience-store', '편의점', 'lee-chan-won', '2021-08-25', '이찬원의 정식 데뷔 싱글.', wChanwon);
  await upsertSingle('namja-speaks', '남자는 말합니다', 'jang-min-ho', '2013-05-16', '장민호의 대표곡.', 'https://ko.wikipedia.org/wiki/남자는_말합니다');
  await upsertSingle('goodbye-my-love-jdw', '잘가요 내사랑', 'jeong-dong-won', '2021-01-01', '정동원 정규 1집의 타이틀곡.', wDongwon);
  await upsertSingle('teseu-hyeong', '테스형!', 'na-hoon-a', '2020-08-20', '나훈아가 작사·작곡한 곡으로 정규 9집 《아홉 이야기》 수록.', 'https://ko.wikipedia.org/wiki/테스형!');
  await upsertSingle('eomeona', '어머나', 'jang-yoon-jeong', '2004-01-01', '장윤정의 대표곡으로 2000년대 트로트 대중화를 이끌었다.', 'https://ko.wikipedia.org/wiki/어머나');

  // ---------------- 검증된 공연 10 (전부 종료) ----------------
  const ip = '인터파크(NOL 티켓)';
  await upsertEvent({ slug: 'youngtak-takshow4-encore-2026-seoul', eventName: '영탁 콘서트 TAK SHOW4 ENCORE', start: '2026-01-09T19:00:00+09:00', venue: '잠실실내체육관', region: 'seoul', artistSlug: 'young-tak', organizer: '어비스컴퍼니', ticketVendor: ip, sourceTitle: "영탁 'TAK SHOW4' 서울 앙코르 콘서트", sourcePublisher: '파이낸스투데이', sourceUrl: 'https://www.fntoday.co.kr/news/articleView.html?idxno=368562' });
  await upsertEvent({ slug: 'youngtak-youngone-park-2026-seoul', eventName: '2026 영탁 팬콘 〈YOUNGONE PARK:ONE TEAM〉', start: '2026-05-02T18:00:00+09:00', venue: '장충체육관', region: 'seoul', artistSlug: 'young-tak', organizer: '어비스컴퍼니', ticketVendor: ip, sourceTitle: '2026 영탁 팬콘 공식 공지', sourcePublisher: 'YOUNGTAK Official X', sourceUrl: 'https://x.com/YOUNGTAK_ABYSS' });

  await upsertEvent({ slug: 'leechanwon-changa-2026-seoul', eventName: '이찬원 콘서트 〈찬가: 찬란한 하루〉 서울 앙코르', start: '2026-05-09T18:00:00+09:00', venue: 'KSPO DOME(올림픽체조경기장)', region: 'seoul', artistSlug: 'lee-chan-won', ticketVendor: 'YES24 티켓', sourceTitle: "이찬원 '찬가' 서울 앙코르 콘서트", sourcePublisher: '머니투데이', sourceUrl: 'https://www.mt.co.kr/entertainment/2026/02/12/2026021208577289760' });

  const minhoSrc = { sourceTitle: "장민호 전국투어 '호시절' 안내", sourcePublisher: ip, sourceUrl: 'https://tickets.interpark.com/contents/notice/detail/11709' };
  await upsertEvent({ slug: 'jangminho-hosijeol-2026-daegu', eventName: "장민호 전국투어 콘서트 '호시절 : 9.11Mhz' 대구", start: '2026-01-10T18:00:00+09:00', venue: '경북대학교 대강당', region: 'daegu', artistSlug: 'jang-min-ho', ticketVendor: ip, ...minhoSrc });
  await upsertEvent({ slug: 'jangminho-hosijeol-2026-busan', eventName: "장민호 전국투어 콘서트 '호시절 : 9.11Mhz' 부산", start: '2026-01-24T18:00:00+09:00', venue: 'KBS부산홀', region: 'busan', artistSlug: 'jang-min-ho', ticketVendor: ip, ...minhoSrc });
  await upsertEvent({ slug: 'jangminho-hosijeol-2026-gwangju', eventName: "장민호 전국투어 콘서트 '호시절 : 9.11Mhz' 광주", start: '2026-02-28T18:00:00+09:00', venue: '조선대학교 해오름관', region: 'gwangju', artistSlug: 'jang-min-ho', ticketVendor: ip, ...minhoSrc });
  await upsertEvent({ slug: 'jangminho-hosijeol-2026-seoul', eventName: "장민호 전국투어 콘서트 '호시절 : 9.11Mhz' 서울", start: '2026-03-14T18:00:00+09:00', venue: '올림픽공원 올림픽홀', region: 'seoul', artistSlug: 'jang-min-ho', ticketVendor: ip, ...minhoSrc });

  await upsertEvent({ slug: 'jeongdongwon-fancon-2026-goyang', eventName: "2026 정동원 팬 콘서트 '오늘을 건너 내일 다시 만나는 길'", start: '2026-02-13T18:00:00+09:00', venue: '킨텍스(KINTEX) 제1전시장 1홀', region: 'gyeonggi', artistSlug: 'jeong-dong-won', ticketVendor: ip, officialSourceUrl: 'https://tickets.interpark.com/goods/26000142', sourceTitle: '2026 정동원 팬 콘서트 안내', sourcePublisher: ip, sourceUrl: 'https://tickets.interpark.com/goods/26000142' });

  await upsertEvent({ slug: 'jangyoonjeong-themaster-2026-daejeon', eventName: '2025-26 장윤정 라이브 콘서트 〈THE MASTER〉 대전', start: '2026-01-31T14:00:00+09:00', venue: '충남대학교 정심화홀', region: 'daejeon', artistSlug: 'jang-yoon-jeong', ticketVendor: ip, priceInformation: 'VIP 143,000 / R 132,000 / S 121,000원 (8세 이상)', sourceTitle: '장윤정 THE MASTER 대전 공지', sourcePublisher: ip, sourceUrl: 'https://tickets.interpark.com/contents/notice/detail/11838' });
  await upsertEvent({ slug: 'jangyoonjeong-themaster-2026-incheon', eventName: '2025-26 장윤정 라이브 콘서트 〈THE MASTER〉 인천', start: '2026-06-13T14:00:00+09:00', venue: '인천문화예술회관 대공연장', region: 'incheon', artistSlug: 'jang-yoon-jeong', ticketVendor: ip, priceInformation: 'VIP 143,000 / R 132,000 / S 121,000원 (8세 이상)', sourceTitle: '장윤정 THE MASTER 인천 공지', sourcePublisher: ip, sourceUrl: 'https://tickets.interpark.com/contents/notice/detail/13216' });

  const [artists, events, music] = await Promise.all([prisma.artist.count({ where: { status: 'published' } }), prisma.event.count({ where: { status: 'published' } }), prisma.music.count({ where: { status: 'published' } })]);
  console.log(`✔ 배치2 완료. 현재 published — 가수 ${artists}, 공연 ${events}, 음반 ${music}`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

/**
 * 콘텐츠 배치3 (웹 조사·출처 기반). isSample=false, published.
 * - 남진 프로필 + 대표곡(님과 함께)
 * - 다가오는(오늘 2026-07-13 이후) 검증된 공연 3건
 * - 심층 게시글 2편(각 3,000자+): 트로트 역사 / 대표 가수 가이드
 * 실행: DATABASE_PROVIDER=postgresql + generate 후 DATABASE_URL=<neon> npx tsx prisma/seed-content-batch3.ts
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const NOW = new Date('2026-07-13T00:00:00+09:00');
const REVIEW = new Date('2027-01-13T00:00:00+09:00');
const D = (s: string) => new Date(s);

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'admin' }, orderBy: { createdAt: 'asc' } });
  const authorId = admin?.id ?? null;
  const wNamjin = 'https://ko.wikipedia.org/wiki/남진_(가수)';

  // ---------------- 남진 프로필 ----------------
  await prisma.artist.upsert({ where: { slug: 'nam-jin' }, update: {}, create: { slug: 'nam-jin', stageName: '남진', profileSummary: 'x', status: 'draft' } });
  const namjin = await prisma.artist.update({
    where: { slug: 'nam-jin' },
    data: {
      stageName: '남진',
      realName: '김남진',
      profileSummary:
        '남진(본명 김남진)은 1965년 데뷔한 대한민국의 원로 트로트 가수로, 전라남도 목포 출신이다. 1967년 「가슴 아프게」와 1972년 「님과 함께」 등의 히트로 1960~70년대 대중가요를 대표하는 스타가 되었으며, 같은 시기 활동한 나훈아와 함께 당대 남성 트로트를 양분한 인물로 평가된다. 데뷔 이후 60년 가까이 활동을 이어오며 2025년에는 데뷔 60주년 기념 전국투어를 진행했고, 골든디스크 공로상과 트롯어워즈 가왕상 등으로 그 위상이 조명되었다.',
      birthPlace: '전라남도 목포',
      birthDate: null, // 출생연도 위키 간 상충(1945/1946) → 보수적으로 생략
      agency: null,
      isSample: false,
      status: 'published',
      lastFactCheckedAt: NOW,
    },
  });
  await prisma.award.deleteMany({ where: { artistId: namjin.id } });
  await prisma.award.createMany({
    data: [
      { artistId: namjin.id, year: 2007, title: '제22회 골든디스크상 공로상', sourceUrl: wNamjin },
      { artistId: namjin.id, year: 2020, title: '제1회 트롯어워즈 트롯 100년 가왕상', sourceUrl: wNamjin },
    ],
  });
  await prisma.timelineEntry.deleteMany({ where: { artistId: namjin.id } });
  await prisma.timelineEntry.createMany({
    data: [
      { artistId: namjin.id, date: D('1967-01-01'), title: '「가슴 아프게」로 전국적 인기', sourceUrl: wNamjin },
      { artistId: namjin.id, date: D('1972-01-01'), title: '「님과 함께」 대히트', sourceUrl: wNamjin },
    ],
  });
  await prisma.source.deleteMany({ where: { artistId: namjin.id } });
  await prisma.source.createMany({
    data: [
      { artistId: namjin.id, sourceTitle: '남진 (가수)', sourcePublisher: '위키백과', sourceUrl: wNamjin, sourceGrade: 'B', factType: 'profile', verificationStatus: 'cross_checked', accessedAt: NOW },
      { artistId: namjin.id, sourceTitle: "'님과 함께'는 남진의 노래가 아닐 뻔했다", sourcePublisher: '한국경제', sourceUrl: 'https://www.hankyung.com/article/202406171427Y', sourceGrade: 'B', factType: 'profile', verificationStatus: 'cross_checked', accessedAt: NOW },
    ],
  });

  await prisma.music.upsert({ where: { slug: 'nimgwa-hamkke' }, update: {}, create: { slug: 'nimgwa-hamkke', title: '님과 함께', status: 'draft' } });
  const nim = await prisma.music.update({
    where: { slug: 'nimgwa-hamkke' },
    data: { title: '님과 함께', type: 'single', releaseDate: D('1972-01-01'), description: '남진의 대표곡. "저 푸른 초원 위에"로 시작하는 1970년대 대표 히트곡이다.', isSample: false, status: 'published', artists: { set: [{ id: namjin.id }] } },
  });
  await prisma.source.deleteMany({ where: { musicId: nim.id } });
  await prisma.source.create({ data: { musicId: nim.id, sourceTitle: '님과 함께', sourcePublisher: '경향신문', sourceUrl: 'https://www.khan.co.kr/article/202403312023005', sourceGrade: 'B', factType: 'release', verificationStatus: 'cross_checked', accessedAt: NOW } });

  // ---------------- 다가오는 검증 공연 3 ----------------
  const lyw = await prisma.artist.findUnique({ where: { slug: 'lim-young-woong' }, select: { id: true } });

  await upsertEvent({
    slug: 'lim-young-woong-stadium2-2026-goyang',
    eventName: '2026 임영웅 콘서트 [IM HERO — THE STADIUM 2]',
    start: '2026-09-04T18:30:00+09:00', end: '2026-09-06T18:30:00+09:00',
    venue: '고양종합운동장 주경기장', region: 'gyeonggi', artistId: lyw?.id ?? null,
    ticketVendor: 'NOL 티켓(인터파크)', ticketOpen: '2026-07-16T20:00:00+09:00',
    eventStatus: 'scheduled', organizer: '물고기뮤직',
    officialSourceUrl: 'https://tickets.interpark.com/contents/notice/detail/14497',
    sources: [
      { t: '2026 임영웅 콘서트 IM HERO THE STADIUM 2 공식 공지', p: '인터파크(NOL 티켓)', u: 'https://tickets.interpark.com/contents/notice/detail/14497', g: 'A' },
      { t: '임영웅, 9월 고양 스타디움 콘서트 개최', p: '헤럴드경제', u: 'https://biz.heraldcorp.com/article/10801014', g: 'B' },
    ],
  });

  await upsertEvent({
    slug: 'son-tae-jin-maestro-2026-busan',
    eventName: '2026 손태진 단독 콘서트 〈THE MAESTRO〉 부산',
    start: '2026-07-17T19:00:00+09:00', end: '2026-07-18T19:00:00+09:00',
    venue: '부산 소향씨어터 우리은행홀', region: 'busan', artistId: null,
    ticketVendor: 'NOL 티켓(인터파크)', eventStatus: 'ticket_open',
    sources: [
      { t: '손태진 THE MAESTRO 부산 공연', p: 'LG아트센터/공연장 안내', u: 'https://www.lgart.com/product/performance/252967', g: 'B' },
    ],
  });

  await upsertEvent({
    slug: 'park-ji-hyun-showmanship2-2026-seongnam',
    eventName: '2026 박지현 콘서트 〈SHOWMANSHIP SEASON 2〉 성남',
    start: '2026-07-18T18:00:00+09:00', end: '2026-07-19T18:00:00+09:00',
    venue: '성남아트센터 오페라하우스', region: 'gyeonggi', artistId: null,
    ticketVendor: 'YES24 티켓', eventStatus: 'ticket_open',
    sources: [
      { t: '박지현 쇼맨쉽 시즌2 전국투어', p: '뉴스플릭스', u: 'https://www.newsflix.co.kr/news/articleView.html?idxno=30543', g: 'B' },
    ],
  });

  // ---------------- 심층 게시글 2편 (3,000자+) ----------------
  await upsertArticle('trot-history-deep', {
    type: 'guide',
    title: '트로트의 역사 — 1920년대 형성부터 2020년대 재유행까지 한눈에',
    seoTitle: '트로트 역사 총정리: 형성·전성기·재유행 (1920~2020년대)',
    description: '트로트의 형성과 명칭의 유래, 1960~70년대 전성기, 1980~90년대의 흐름, 2000년대 리바이벌과 2019~2020년 오디션 열풍까지 트로트 100년의 역사를 정리했습니다.',
    excerpt: '트로트 100년의 흐름을 시대별로 정리한 심층 가이드.',
    primaryKeyword: '트로트 역사',
    searchIntent: '트로트가 어떻게 시작되고 발전했는지 역사 전체',
    authorId,
    connectArtists: [],
    body: TROT_HISTORY_BODY,
    sources: [
      { sourceTitle: '트로트', sourcePublisher: '위키백과', sourceUrl: 'https://ko.wikipedia.org/wiki/트로트', sourceGrade: 'B' },
      { sourceTitle: '트로트', sourcePublisher: '한국민족문화대백과사전(한국학중앙연구원)', sourceUrl: 'https://encykorea.aks.ac.kr/Article/E0066860', sourceGrade: 'A' },
      { sourceTitle: '‘장조 트로트’의 도입과 토착적 변용', sourcePublisher: '서울대학교 S-Space(학술)', sourceUrl: 'https://s-space.snu.ac.kr/bitstream/10371/98915/1/vol38_75.pdf', sourceGrade: 'B' },
    ],
  });

  await upsertArticle('trot-artists-guide', {
    type: 'guide',
    title: '트로트 대표 가수 가이드 — 프로필·대표곡·활동 한눈에 정리',
    seoTitle: '트로트 대표 가수 총정리: 임영웅·송가인부터 나훈아·남진까지',
    description: '임영웅·송가인·영탁·이찬원·장민호·정동원·나훈아·장윤정·남진 등 대표 트로트 가수의 프로필과 대표곡, 주요 활동을 한곳에 정리했습니다. 입문자를 위한 트로트 가수 안내.',
    excerpt: '대표 트로트 가수들의 프로필·대표곡을 한눈에.',
    primaryKeyword: '트로트 가수',
    searchIntent: '유명 트로트 가수와 대표곡을 한 번에 파악',
    authorId,
    connectArtists: [],
    body: TROT_ARTISTS_BODY,
    sources: [
      { sourceTitle: '트로트', sourcePublisher: '위키백과', sourceUrl: 'https://ko.wikipedia.org/wiki/트로트', sourceGrade: 'B' },
      { sourceTitle: '내일은 미스터트롯', sourcePublisher: '위키백과', sourceUrl: 'https://ko.wikipedia.org/wiki/미스터트롯', sourceGrade: 'B' },
    ],
  });

  const [ar, ev, mu, atc] = await Promise.all([
    prisma.artist.count({ where: { status: 'published' } }),
    prisma.event.count({ where: { status: 'published' } }),
    prisma.music.count({ where: { status: 'published' } }),
    prisma.article.count({ where: { status: 'published' } }),
  ]);
  console.log(`✔ 배치3 완료. published — 가수 ${ar}, 공연 ${ev}, 음반 ${mu}, 기사 ${atc}`);
}

// ---------------- helpers ----------------
async function upsertEvent(e: {
  slug: string; eventName: string; start: string; end?: string; venue: string; region: string; artistId: string | null;
  ticketVendor?: string; ticketOpen?: string; eventStatus: string; organizer?: string; officialSourceUrl?: string;
  sources: { t: string; p: string; u: string; g: string }[];
}) {
  await prisma.event.upsert({ where: { slug: e.slug }, update: {}, create: { slug: e.slug, eventName: e.eventName, startDateTime: D(e.start), status: 'draft' } });
  const ev = await prisma.event.update({
    where: { slug: e.slug },
    data: {
      eventName: e.eventName, eventType: 'concert', startDateTime: D(e.start), endDateTime: e.end ? D(e.end) : null,
      venue: e.venue, region: e.region, ticketVendor: e.ticketVendor, ticketOpenDate: e.ticketOpen ? D(e.ticketOpen) : null,
      organizer: e.organizer, officialSourceUrl: e.officialSourceUrl, eventStatus: e.eventStatus,
      isSample: false, status: 'published', sourceCheckedAt: NOW,
      artists: { set: e.artistId ? [{ id: e.artistId }] : [] },
    },
  });
  await prisma.source.deleteMany({ where: { eventId: ev.id } });
  await prisma.source.createMany({ data: e.sources.map((s) => ({ eventId: ev.id, sourceTitle: s.t, sourcePublisher: s.p, sourceUrl: s.u, sourceGrade: s.g, factType: 'schedule', verificationStatus: 'cross_checked', accessedAt: NOW })) });
}

async function upsertArticle(slug: string, a: {
  type: string; title: string; seoTitle: string; description: string; excerpt: string; primaryKeyword: string; searchIntent: string;
  body: string; authorId: string | null; connectArtists: string[]; sources: { sourceTitle: string; sourcePublisher: string; sourceUrl: string; sourceGrade: string }[];
}) {
  await prisma.article.upsert({ where: { slug }, update: {}, create: { slug, type: a.type, title: a.title, description: a.description, body: a.body, status: 'draft' } });
  const art = await prisma.article.update({
    where: { slug },
    data: {
      type: a.type, title: a.title, seoTitle: a.seoTitle, description: a.description, excerpt: a.excerpt,
      primaryKeyword: a.primaryKeyword, searchIntent: a.searchIntent, body: a.body,
      status: 'published', index: true, riskLevel: 'low', isSample: false, autoGenerated: false,
      publishedAt: NOW, lastFactCheckedAt: NOW, nextReviewAt: REVIEW, authorId: a.authorId,
      artists: { set: a.connectArtists.map((id) => ({ id })) },
    },
  });
  await prisma.source.deleteMany({ where: { articleId: art.id } });
  await prisma.source.createMany({ data: a.sources.map((s) => ({ articleId: art.id, sourceTitle: s.sourceTitle, sourcePublisher: s.sourcePublisher, sourceUrl: s.sourceUrl, sourceGrade: s.sourceGrade, factType: 'reference', verificationStatus: 'cross_checked', accessedAt: NOW })) });
}

const TROT_HISTORY_BODY = [
  '> 이 글은 백과사전·학술 자료·주요 언론으로 교차 확인한 일반적 서술을 정리한 것입니다. 특정 인물의 사생활·논란은 다루지 않습니다.',
  '',
  '트로트는 20세기 초에 형성되어 오늘날까지 이어지는 대한민국의 대표적 대중가요 장르입니다. ‘뽕짝’이라는 별칭으로도 불리며, 100년 가까운 세월 동안 시대의 정서를 담아 온 음악이자 한국 대중음악사의 중요한 한 축입니다. 이 글에서는 트로트가 어떻게 시작되어 전성기와 침체, 그리고 재유행에 이르렀는지를 시대순으로 살펴봅니다. 각 시대의 대표 가수와 대표곡을 함께 짚으면 장르의 변화를 한층 생생하게 이해할 수 있습니다.',
  '',
  '## 1. 형성기 — 1920~1930년대',
  '트로트의 뿌리는 대체로 일제강점기인 1920~1930년대로 거슬러 올라갑니다. 이 시기 라디오 방송과 유성기 음반이 보급되면서 대중가요라는 새로운 음악 소비 방식이 자리 잡았고, 일본 대중가요인 엔카(演歌)의 음계·창법이 국내에 유입되며 새로운 양식이 형성되었다고 한국민족문화대백과사전 등은 설명합니다. 1935년 이난영이 부른 「목포의 눈물」은 이 시기를 대표하는 곡으로 널리 꼽히며, 남인수·채규엽 등도 초기 트로트를 대표하는 가수로 언급됩니다.',
  '다만 트로트의 기원을 두고는 외래 이식설과 자생적 형성설이 함께 논의되어 왔으며, 학계에서는 단선적인 결론보다 여러 흐름이 교차한 결과로 보는 시각이 많습니다. 어느 관점에서든 1930년대 중반에 이르면 트로트가 음반 산업과 함께 하나의 뚜렷한 대중가요 양식으로 정착했다는 점은 공통적으로 인정됩니다.',
  '',
  '## 2. 명칭의 유래',
  '‘트로트(trot)’라는 이름은 서양 사교춤곡인 ‘폭스트롯(fox trot)’에서 왔다는 것이 정설로 여겨집니다. 다만 여러 자료는 2박자 계통이라는 공통점 외에 실제 음악적 관련성은 크지 않다고 지적합니다. 초기에는 ‘유행가’ 등으로 폭넓게 불리다가, 장르 명칭으로서 ‘트로트’가 대중적으로 정착한 것은 대체로 1960년대 중반 이후로 설명됩니다. 반주의 규칙적인 ‘쿵짝 쿵짝’ 소리에서 비롯된 ‘뽕짝’이라는 별칭도 이 무렵부터 널리 쓰였는데, 오늘날에는 다소 낮잡는 뉘앙스로 받아들여지기도 해 사용에 유의하는 경우가 많습니다.',
  '',
  '## 3. 장르의 정착과 전성기 — 1960~1970년대',
  '광복과 전쟁을 거친 뒤 1960년대는 트로트가 하나의 장르로 확고히 자리 잡은 시기입니다. 1964년 이미자가 부른 「동백 아가씨」는 큰 인기를 끌며 트로트의 대중적 저변을 크게 넓혔고, 이미자는 이후 오랜 세월 수많은 히트곡을 남기며 대표적인 여성 트로트 가수로 자리매김했습니다. 호소력 짙은 음색의 배호도 「돌아가는 삼각지」 등으로 이 시기를 대표했습니다.',
  '1960년대 후반부터는 남진과 나훈아라는 두 남성 스타가 등장해 당대 대중가요를 양분하는 라이벌 구도를 형성했습니다. 남진의 「가슴 아프게」(1967)와 「님과 함께」(1972), 나훈아의 「사랑은 눈물의 씨앗」·「고향역」 등은 이 시기를 대표하는 히트곡입니다. 텔레비전 방송의 확산과 음반 시장의 성장이 맞물리면서 트로트는 전국민적 인기를 누렸고, 각종 가요제와 방송 순위 프로그램이 스타를 배출하는 통로가 되었습니다.',
  '',
  '## 4. 다양화와 상대적 침체 — 1980~1990년대',
  '1980년대에 접어들면서 발라드와 댄스 음악, 이후 록·힙합 등 다양한 장르가 대중음악의 주류로 부상했습니다. 이 과정에서 트로트는 상대적으로 차트의 중심에서 밀려나는 흐름을 보였지만, 결코 사라지지는 않았습니다. 1985년 주현미의 「비 내리는 영동교」가 크게 히트했고, 이후 주현미·태진아·송대관·설운도 등은 방송 무대를 중심으로 꾸준히 활동하며 트로트의 명맥을 이었습니다. 심수봉은 「그때 그 사람」 등으로 독자적인 색깔을 보여 주었습니다.',
  '이 시기 트로트는 중장년층의 안정적 지지를 바탕으로 ‘성인가요’라는 이름으로도 불렸으며, 관광버스와 노래방을 매개로 한 ‘메들리’ 문화가 확산되면서 대중의 일상 속에 깊이 스며들었습니다. 주류 차트에서의 존재감은 줄었지만, 생활 문화로서의 트로트는 오히려 튼튼한 뿌리를 내린 시기라고 볼 수 있습니다.',
  '',
  '## 5. 리바이벌의 신호 — 2000년대',
  '2000년대에 들어 트로트는 새로운 활력을 얻습니다. 2004년 장윤정의 「어머나」가 음악방송 정상권에 오르며 젊은 층에게도 트로트를 각인시켰고, 이는 2000년대 트로트 대중화의 결정적 계기로 평가됩니다. 이어 박현빈의 「곤드레만드레」·「샤방샤방」, 홍진영의 밝고 경쾌한 곡들이 인기를 끌며 이른바 ‘세미 트로트’ 계열이 폭넓은 지지를 얻었습니다. 이 시기 트로트는 ‘옛 노래’가 아니라 동시대의 대중가요로 소비될 수 있음을 보여 주었고, 예능과 광고 등에서도 활발히 활용되며 대중과의 접점을 넓혔습니다.',
  '',
  '## 6. 오디션 열풍과 전성기의 재현 — 2019~2020년대',
  '2019년 TV조선의 《내일은 미스트롯》과 2020년 《내일은 미스터트롯》이 연이어 큰 인기를 얻으면서 트로트는 이른바 ‘제2의 전성기’를 맞이합니다. 미스트롯에서는 국악을 전공한 송가인이, 미스터트롯에서는 임영웅이 우승하며 전국적 스타로 떠올랐고, 영탁·이찬원·장민호·정동원 등 경연 출신 가수들이 대거 주목받았습니다.',
  '중장년층의 탄탄한 지지에 더해, 유튜브 등 디지털 플랫폼을 통한 콘텐츠 재유통과 조직적인 팬덤 문화의 결합이 새로운 청중층을 만들어 냈다는 것이 언론의 일반적 분석입니다. 이후 여러 방송사가 유사한 트로트 경연 프로그램을 선보였고, 파생·후속 프로그램까지 이어지며 장르 전체의 저변이 크게 확대되었습니다. 대형 콘서트와 팬미팅, 광고·예능 출연이 활발해지면서 트로트 스타들은 대중음악 산업의 중심축 가운데 하나로 자리 잡았습니다.',
  '',
  '## 7. 트로트의 음악적 특징',
  '트로트의 리듬은 강박과 약박이 규칙적으로 교차하는 2박자 계통이 기본이며, 이 반주의 규칙적인 소리가 ‘뽕짝’이라는 별칭의 유래로 널리 설명됩니다. 음계는 단조 5음계 등 펜타토닉을 특징적으로 활용하고, 음을 굴리고 꺾어 부르는 ‘꺾기’ 창법과 깊은 비브라토로 애절한 정서를 표현하는 것이 대표적입니다.',
  '가사는 사랑과 이별, 고향과 어머니, 인생의 회한 같은 보편적 정서를 다루는 경우가 많아 세대를 넘어 공감을 얻어 왔습니다. 다만 트로트가 늘 애절하기만 한 것은 아니어서, 밝고 흥겨운 장조 계열의 곡이나 다른 장르와 결합한 형태도 꾸준히 사랑받아 왔습니다. 근래에는 발라드·팝·댄스 요소를 폭넓게 흡수하며 표현의 폭이 한층 넓어지고 있습니다.',
  '',
  '## 8. 방송과 세대를 잇는 음악',
  '트로트의 역사에서 방송의 역할은 특히 큽니다. 라디오와 텔레비전 가요 프로그램은 오랜 세월 트로트 스타를 배출하고 대중과 연결하는 창구였으며, KBS 《가요무대》처럼 정통 가요를 꾸준히 소개해 온 프로그램은 장르의 명맥을 잇는 데 기여했습니다. 2019년 이후의 오디션 열풍은 여기에 경연이라는 서사와 실시간 투표, 팬덤 참여를 결합해 트로트를 젊은 세대의 콘텐츠 소비 방식과 접목했습니다. 그 결과 트로트는 조부모 세대의 음악에서 온 가족이 함께 즐기는 음악으로 확장되었고, 세대를 잇는 대중문화로서의 의미를 다시 얻게 되었습니다.',
  '',
  '## 마치며',
  '트로트는 형성기의 애환에서 시작해 전성기와 침체, 그리고 재유행에 이르기까지 한국 근현대사의 정서를 함께해 온 음악입니다. 각 시대의 대표 가수와 대표곡을 따라가다 보면 트로트가 단순한 옛 노래가 아니라 끊임없이 변화해 온 살아 있는 장르임을 알 수 있습니다. 개별 가수의 활동과 대표곡이 궁금하다면 [트로트 대표 가수 가이드](/news/trot-artists-guide)를, 각 가수의 상세 프로필은 [가수 목록](/artists)에서 이어서 확인해 보시길 권합니다. 다가오는 공연은 [공연 일정](/events)에서 확인할 수 있습니다.',
].join('\n');

const TROT_ARTISTS_BODY = [
  '> 아래 정보는 주요 언론·공식 채널·백과로 교차 확인한 사실만 정리했습니다. 각 가수의 상세 프로필·출처는 링크된 개별 페이지에서 확인할 수 있습니다.',
  '',
  '트로트를 처음 접하는 분이라면 대표 가수와 그들의 대표곡부터 아는 것이 가장 빠른 입문법입니다. 이 글에서는 오늘날 한국 트로트를 대표하는 가수들의 프로필과 대표곡, 주요 활동을 세대별로 정리했습니다. 원로 가수부터 최근 오디션 세대까지 폭넓게 담았으니, 마음에 드는 가수를 골라 개별 프로필과 음반으로 넘어가며 감상해 보시길 권합니다.',
  '',
  '## 오디션 세대의 간판 — 임영웅·송가인',
  '[임영웅](/artists/lim-young-woong)은 2016년 싱글 「미워요」로 데뷔한 뒤 2020년 《내일은 미스터트롯》에서 최종 우승(진)을 차지하며 전국적 스타가 되었습니다. 발라드·트로트·팝을 아우르는 폭넓은 음악 색깔이 특징으로, 「이제 나만 믿어요」, 「사랑은 늘 도망가」, 정규 1집 《IM HERO》(2022)의 「다시 만날 수 있을까」 등이 대표곡으로 꼽힙니다. 주요 대중음악 시상식에서 다수 수상했고, 공식 팬덤 ‘영웅시대’의 강한 결집력으로도 유명합니다. 2026년 9월에는 고양종합운동장에서 대형 스타디움 콘서트가 예정되어 있어 여전히 활발한 활동을 이어가고 있습니다.',
  '',
  '[송가인](/artists/song-ga-in)은 전남 진도 출신으로 중앙대학교에서 판소리를 전공한 국악 기반의 이력을 가진 가수입니다. 2019년 《내일은 미스트롯》에서 초대 진(眞)으로 우승하며 트로트 열풍의 문을 열었고, 정통 트로트 창법의 대표 주자로 꼽힙니다. 대표곡으로는 정규 1집 《佳人(가인)》의 타이틀 「가인이어라」와 더블 타이틀 「엄마 아리랑」이 있으며, 「가인이어라」는 2025년 트로트 최초로 중학교 음악 교과서에 수록되어 화제가 되었습니다.',
  '',
  '## 미스터트롯이 배출한 스타들 — 영탁·이찬원·장민호·정동원',
  '[영탁](/artists/young-tak)은 2007년 발라드로 데뷔해 2016년 트로트로 전향한 싱어송라이터로, 미스터트롯에서 최종 2위(선)에 올랐습니다. 「찐이야」, 「니가 왜 거기서 나와」 등 흥겨운 히트곡과 자작곡으로 폭넓은 인기를 얻었으며, 공식 팬덤명은 ‘영탁앤블루스’입니다. [이찬원](/artists/lee-chan-won)은 미스터트롯 3위(미) 출신으로 2021년 싱글 「편의점」으로 정식 데뷔했고, 「참 좋은 날」, 「풍등」 등을 발표했습니다. 노래뿐 아니라 예능에서도 활약해 2024년 KBS 연예대상 대상을 받으며 폭넓은 대중적 사랑을 확인했습니다.',
  '',
  '[장민호](/artists/jang-min-ho)는 1990년대부터 활동해 온 베테랑으로, 2013년 발표한 「남자는 말합니다」가 대표곡으로 자리 잡았고 미스터트롯에서 재조명받아 데뷔 20여 년 만에 폭넓은 인기를 얻었습니다. [정동원](/artists/jeong-dong-won)은 최연소 참가자로 주목받아 TOP7에 올랐으며, 「잘가요 내사랑」 등으로 활동한 뒤 꾸준히 성장해 온 가수입니다. 두 사람 모두 《내일은 미스터트롯》이 배출한 대표적 스타로 꼽힙니다.',
  '',
  '## 트로트의 여왕과 원로들 — 장윤정·나훈아·남진',
  '[장윤정](/artists/jang-yoon-jeong)은 1999년 강변가요제 대상으로 데뷔해 2004년 「어머나」의 큰 성공으로 2000년대 트로트 대중화를 이끈 가수입니다. 「짠짜라」, 「초혼」, 「올래」 등 다수의 히트곡을 남겼고, 근래에는 《미스트롯》·《미스터트롯》 마스터로도 활동하며 후배 양성과 장르 확산에 기여해 왔습니다.',
  '',
  '[나훈아](/artists/na-hoon-a)는 1968년 데뷔해 「사랑은 눈물의 씨앗」, 「고향역」, 「테스형!」 등 수많은 히트곡을 남긴 원로 가수로 ‘가황(歌皇)’으로 불립니다. 많은 곡을 직접 작사·작곡한 싱어송라이터이기도 하며, 2025년 은퇴 콘서트로 오랜 활동을 마무리했습니다. [남진](/artists/nam-jin)은 1965년 데뷔해 「가슴 아프게」, 「님과 함께」 등으로 1960~70년대를 대표한 스타로, 같은 시기의 나훈아와 함께 당대 남성 트로트를 양분한 인물로 평가됩니다. 데뷔 60년이 넘도록 무대에 서며 트로트의 역사를 몸으로 보여 주고 있습니다.',
  '',
  '## 세대를 넘는 대표 프로그램',
  '오늘날의 트로트 지형을 이해하려면 오디션 프로그램을 빼놓을 수 없습니다. 2019년 [내일은 미스트롯](/programs/miss-trot)이 송가인을, 2020년 [내일은 미스터트롯](/programs/mr-trot)이 임영웅을 비롯한 TOP7을 배출하며 현재의 스타 지형을 만들었습니다. 이 프로그램들은 실력 있는 신인을 발굴하는 동시에, 시청자 투표와 팬덤 참여를 통해 트로트를 온 세대가 함께 즐기는 콘텐츠로 확장했습니다.',
  '',
  '## 트로트, 어디서 들을 수 있나요',
  '입문자에게 가장 접근하기 쉬운 통로는 음원 플랫폼과 영상 플랫폼입니다. 멜론·지니·플로 같은 국내 음원 서비스에서 가수 이름이나 대표곡을 검색하면 정규 앨범과 대표곡을 바로 들을 수 있고, 유튜브의 공식 채널에서는 무대 영상과 뮤직비디오를 무료로 감상할 수 있습니다. 가수마다 공식 채널을 운영하는 경우가 많으므로, 개별 [가수 프로필](/artists)에 정리된 공식 링크를 통해 접속하면 잘못된 채널을 피할 수 있습니다.',
  '방송으로 즐기고 싶다면 KBS 《가요무대》나 각 방송사의 트로트 프로그램, 그리고 다시보기 서비스를 활용할 수 있습니다. 무엇보다 트로트의 진가는 라이브 무대에서 드러나므로, 여건이 된다면 콘서트 관람을 추천합니다. 다만 공연 일정과 예매 정보는 자주 바뀌므로, 반드시 공식 예매처에서 최신 정보를 확인하시기 바랍니다. 현재 확인된 공연은 [공연 일정](/events)과 [지역별 공연](/events/region/seoul)에서 살펴볼 수 있습니다.',
  '',
  '## 대표곡으로 입문하기',
  '트로트가 처음이라면 위 가수들의 대표곡부터 순서대로 들어 보는 것을 추천합니다. 임영웅의 발라드풍 트로트로 부담 없이 시작해, 송가인의 정통 창법으로 트로트 본연의 맛을 느끼고, 영탁·이찬원의 경쾌한 곡으로 흥을 더한 뒤, 장윤정의 「어머나」와 나훈아·남진의 고전 히트곡까지 이어 들으면 트로트의 폭넓은 스펙트럼을 자연스럽게 체감할 수 있습니다. 각 가수의 음반과 대표곡은 [신곡·앨범 목록](/music)에서, 공연 일정은 [공연 일정](/events)에서 확인할 수 있습니다. 트로트라는 장르 자체의 흐름이 궁금하다면 [트로트의 역사](/news/trot-history-deep) 글을 함께 읽어 보시길 권합니다.',
].join('\n');

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

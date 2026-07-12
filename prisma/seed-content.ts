/**
 * 실제 콘텐츠 시드 (웹 조사 + 출처 교차확인 기반). isSample=false, status='published'.
 * 모든 사실은 주요 언론/공식 채널/백과로 2개 이상 교차확인한 것만 사용.
 * 불확실 항목(예: 송가인 현행 소속사 상충)은 보수적으로 생략함.
 * 멱등: slug 기준 upsert + 하위(출처/수상/연대기) 재생성.
 *
 * 실행(프로덕션):
 *   DATABASE_PROVIDER=postgresql node scripts/set-db-provider.mjs && npx prisma generate
 *   DATABASE_URL="<neon>" npx tsx prisma/seed-content.ts
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const NOW = new Date('2026-07-13T00:00:00+09:00');
const REVIEW = new Date('2027-01-13T00:00:00+09:00');
const D = (s: string) => new Date(s);

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'admin' }, orderBy: { createdAt: 'asc' } });
  const authorId = admin?.id ?? null;

  // ============================ 프로그램 ============================
  const mrTrot = await prisma.program.upsert({
    where: { slug: 'mr-trot' },
    update: {},
    create: {
      slug: 'mr-trot',
      name: '내일은 미스터트롯',
      broadcaster: 'TV조선',
      airInfo: '2020년 1월 2일 ~ 3월 14일 방영 (시즌1)',
      description:
        '남성 참가자를 대상으로 한 TV조선의 트로트 경연 오디션 프로그램. 마스터 점수와 시청자 문자투표를 합산해 순위를 정하며 최종 상위 3인에게 진(眞)·선(善)·미(美)를 부여한다. 2019년 《내일은 미스트롯》의 후속 남성부 프로그램이다.',
      isSample: false,
      status: 'published',
    },
  });

  const missTrot = await prisma.program.upsert({
    where: { slug: 'miss-trot' },
    update: {},
    create: {
      slug: 'miss-trot',
      name: '내일은 미스트롯',
      broadcaster: 'TV조선',
      airInfo: '2019년 방영 (시즌1)',
      description:
        'TV조선의 여성 트로트 경연 오디션 프로그램. 2019년 방영된 시즌1에서 송가인이 초대 진(眞)으로 우승했으며, 2019~2020년 트로트 열풍의 시작점으로 평가된다.',
      isSample: false,
      status: 'published',
    },
  });

  // ============================ 가수: 임영웅 ============================
  await prisma.artist.upsert({ where: { slug: 'lim-young-woong' }, update: {}, create: { slug: 'lim-young-woong', stageName: '임영웅', profileSummary: 'x', status: 'draft' } });
  const lyw = await prisma.artist.update({
    where: { slug: 'lim-young-woong' },
    data: {
      stageName: '임영웅',
      realName: null, // 활동명과 동일하게 공개
      profileSummary:
        '임영웅은 1991년 경기도 포천에서 태어난 대한민국 가수다. 2016년 싱글 《미워요》로 데뷔했고, 2020년 TV조선 《내일은 미스터트롯》에서 최종 우승(진)을 차지하며 전국적 인지도를 얻었다. 이후 발라드·트로트·팝을 아우르는 활동으로 정규 1집 《IM HERO》(2022)를 발매했고 주요 대중음악 시상식에서 다수 수상했다. 소속사는 물고기뮤직, 공식 팬덤명은 영웅시대다.',
      birthDate: D('1991-06-16'),
      birthPlace: '경기도 포천',
      debutDate: D('2016-08-08'),
      agency: '물고기뮤직',
      fanClubName: '영웅시대',
      officialWebsite: null,
      officialSocialLinks: JSON.stringify([
        { label: '공식 유튜브', url: 'https://www.youtube.com/channel/UC3WZlO2Zl8NE1yIUgtwUtQw' },
        { label: '공식 인스타그램', url: 'https://www.instagram.com/limyoungwoong.official/' },
      ]),
      isSample: false,
      status: 'published',
      lastFactCheckedAt: NOW,
      programs: { connect: { id: mrTrot.id } },
    },
  });
  await prisma.award.deleteMany({ where: { artistId: lyw.id } });
  await prisma.award.createMany({
    data: [
      { artistId: lyw.id, year: 2020, title: '《내일은 미스터트롯》 최종 우승(진)', org: 'TV조선', sourceUrl: 'https://www.hankookilbo.com/News/Read/202003142285322624' },
      { artistId: lyw.id, year: 2022, title: '멜론뮤직어워드 올해의 아티스트·올해의 앨범(대상)', org: '멜론뮤직어워드', sourceUrl: 'https://www.harpersbazaar.co.kr/article/72731' },
      { artistId: lyw.id, year: 2022, title: '골든디스크어워즈 베스트 솔로 아티스트상', org: '골든디스크어워즈', sourceUrl: 'https://ko.wikipedia.org/wiki/임영웅' },
    ],
  });
  await prisma.timelineEntry.deleteMany({ where: { artistId: lyw.id } });
  await prisma.timelineEntry.createMany({
    data: [
      { artistId: lyw.id, date: D('2016-08-08'), title: '싱글 《미워요》로 데뷔', sourceUrl: 'https://ko.wikipedia.org/wiki/임영웅' },
      { artistId: lyw.id, date: D('2020-03-14'), title: '《내일은 미스터트롯》 최종 우승(진)', description: '최종 137만여 표로 1위', sourceUrl: 'https://www.imaeil.com/page/view/2020031420290777035' },
      { artistId: lyw.id, date: D('2022-05-02'), title: '정규 1집 《IM HERO》 발매', sourceUrl: 'https://ko.wikipedia.org/wiki/임영웅' },
    ],
  });
  await prisma.source.deleteMany({ where: { artistId: lyw.id } });
  await prisma.source.createMany({
    data: [
      { artistId: lyw.id, sourceTitle: '임영웅', sourcePublisher: '위키백과', sourceUrl: 'https://ko.wikipedia.org/wiki/임영웅', sourceGrade: 'B', factType: 'profile', verificationStatus: 'cross_checked', accessedAt: NOW },
      { artistId: lyw.id, sourceTitle: "임영웅 '미스터트롯' 최종 우승", sourcePublisher: '한국일보', sourceUrl: 'https://www.hankookilbo.com/News/Read/202003142285322624', sourceGrade: 'B', factType: 'award', verificationStatus: 'cross_checked', accessedAt: NOW },
      { artistId: lyw.id, sourceTitle: '공식 유튜브 채널', sourcePublisher: 'YouTube(공식)', sourceUrl: 'https://www.youtube.com/channel/UC3WZlO2Zl8NE1yIUgtwUtQw', sourceGrade: 'A', factType: 'official', verificationStatus: 'verified', accessedAt: NOW },
    ],
  });

  // 음반: IM HERO
  await prisma.music.upsert({ where: { slug: 'im-hero' }, update: {}, create: { slug: 'im-hero', title: 'IM HERO', status: 'draft' } });
  const imhero = await prisma.music.update({
    where: { slug: 'im-hero' },
    data: {
      title: 'IM HERO',
      type: 'album',
      releaseDate: D('2022-05-02'),
      description: '임영웅의 정규 1집. 2022년 5월 발매됐으며 타이틀곡은 「다시 만날 수 있을까」이다.',
      trackList: JSON.stringify(['다시 만날 수 있을까', '무지개', '우리들의 블루스']),
      isSample: false,
      status: 'published',
      artists: { set: [{ id: lyw.id }] },
    },
  });
  await prisma.source.deleteMany({ where: { musicId: imhero.id } });
  await prisma.source.create({ data: { musicId: imhero.id, sourceTitle: '임영웅', sourcePublisher: '위키백과', sourceUrl: 'https://ko.wikipedia.org/wiki/임영웅', sourceGrade: 'B', factType: 'release', verificationStatus: 'cross_checked', accessedAt: NOW } });

  // ============================ 가수: 송가인 ============================
  await prisma.artist.upsert({ where: { slug: 'song-ga-in' }, update: {}, create: { slug: 'song-ga-in', stageName: '송가인', profileSummary: 'x', status: 'draft' } });
  const sgi = await prisma.artist.update({
    where: { slug: 'song-ga-in' },
    data: {
      stageName: '송가인',
      realName: '조은심',
      profileSummary:
        '송가인은 전라남도 진도 출신의 대한민국 트로트 가수로, 본명은 조은심이며 1986년생이다. 중학생 때부터 판소리를 배워 중앙대학교에서 국악을 전공한 국악 기반의 이력을 갖고 있다. 2012년 데뷔한 뒤 2019년 TV조선 《내일은 미스트롯》에서 초대 진(眞)으로 우승하며 널리 알려졌다. 대표곡으로 「가인이어라」, 「엄마 아리랑」 등이 있으며, 2025년 「가인이어라」가 트로트 최초로 중학교 음악 교과서에 수록됐다.',
      birthDate: D('1986-12-26'),
      birthPlace: '전라남도 진도',
      debutDate: D('2012-10-01'),
      agency: null, // 출처 간 상충 → 보수적으로 생략
      fanClubName: '어게인(AGAIN)',
      officialSocialLinks: JSON.stringify([
        { label: '공식 유튜브', url: 'https://www.youtube.com/channel/UCJ-8qxJb6_YCLIS1Fwb0aZw' },
        { label: '공식 인스타그램', url: 'https://www.instagram.com/songgain_/' },
      ]),
      isSample: false,
      status: 'published',
      lastFactCheckedAt: NOW,
      programs: { connect: { id: missTrot.id } },
    },
  });
  await prisma.award.deleteMany({ where: { artistId: sgi.id } });
  await prisma.award.createMany({
    data: [
      { artistId: sgi.id, year: 2019, title: '《내일은 미스트롯》 최종 우승(진)', org: 'TV조선', sourceUrl: 'https://www.news1.kr/entertain/celebrity-topic/3612731' },
      { artistId: sgi.id, year: 2020, title: '제34회 골든디스크 어워즈 베스트 트로트상', org: '골든디스크어워즈', sourceUrl: 'https://www.tenasia.co.kr/article/2020010425814' },
    ],
  });
  await prisma.timelineEntry.deleteMany({ where: { artistId: sgi.id } });
  await prisma.timelineEntry.createMany({
    data: [
      { artistId: sgi.id, date: D('2012-10-01'), title: '본명(조은심)으로 데뷔', sourceUrl: 'https://ko.wikipedia.org/wiki/송가인' },
      { artistId: sgi.id, date: D('2019-05-09'), title: '《내일은 미스트롯》 최종 우승(진)', sourceUrl: 'https://www.news1.kr/entertain/celebrity-topic/3612731' },
      { artistId: sgi.id, date: D('2025-10-29'), title: '「가인이어라」 중학교 음악 교과서 수록(트로트 최초)', sourceUrl: 'https://tvreport.co.kr/star/article/952405/' },
    ],
  });
  await prisma.source.deleteMany({ where: { artistId: sgi.id } });
  await prisma.source.createMany({
    data: [
      { artistId: sgi.id, sourceTitle: '송가인', sourcePublisher: '위키백과', sourceUrl: 'https://ko.wikipedia.org/wiki/송가인', sourceGrade: 'B', factType: 'profile', verificationStatus: 'cross_checked', accessedAt: NOW },
      { artistId: sgi.id, sourceTitle: "'미스트롯' 1대 우승자 송가인", sourcePublisher: '뉴스1', sourceUrl: 'https://www.news1.kr/entertain/celebrity-topic/3612731', sourceGrade: 'B', factType: 'award', verificationStatus: 'cross_checked', accessedAt: NOW },
    ],
  });

  // 음반: 佳人(가인)
  await prisma.music.upsert({ where: { slug: 'ga-in-album' }, update: {}, create: { slug: 'ga-in-album', title: '佳人(가인)', status: 'draft' } });
  const gain = await prisma.music.update({
    where: { slug: 'ga-in-album' },
    data: {
      title: '佳人(가인)',
      type: 'album',
      releaseDate: D('2019-11-27'),
      description: '송가인의 정규 1집. 타이틀곡 「가인이어라」와 더블 타이틀 「엄마 아리랑」이 수록됐다.',
      trackList: JSON.stringify(['가인이어라', '엄마 아리랑']),
      isSample: false,
      status: 'published',
      artists: { set: [{ id: sgi.id }] },
    },
  });
  await prisma.source.deleteMany({ where: { musicId: gain.id } });
  await prisma.source.create({ data: { musicId: gain.id, sourceTitle: '송가인', sourcePublisher: '위키백과', sourceUrl: 'https://ko.wikipedia.org/wiki/송가인', sourceGrade: 'B', factType: 'release', verificationStatus: 'cross_checked', accessedAt: NOW } });

  // 프로그램 ↔ 가수 연결(미스터트롯에 임영웅)
  await prisma.program.update({ where: { id: mrTrot.id }, data: { artists: { connect: { id: lyw.id } } } });

  // ============================ 기사 ============================
  // 1) 트로트 입문 가이드
  await upsertArticle('trot-beginner-guide', {
    type: 'guide',
    title: '트로트란 무엇인가 — 역사·특징·감상 포인트 입문 가이드',
    seoTitle: '트로트 입문 가이드: 정의·역사·특징·감상 포인트',
    description: '트로트의 정의와 음악적 특징, 명칭의 유래, 시대별 흐름과 2020년 전후 재유행 현상까지 입문자를 위해 정리했습니다.',
    excerpt: '트로트가 처음인 분을 위한 장르 개괄 — 특징·역사·감상 포인트.',
    primaryKeyword: '트로트 입문',
    searchIntent: '트로트가 무엇인지, 어떻게 감상하는지',
    body: [
      '> 이 글은 백과사전·언론·학술 자료로 교차 확인한 일반적 설명을 정리한 것입니다. 특정 인물의 사생활·논란은 다루지 않습니다.',
      '',
      '## 트로트란 무엇인가',
      '트로트는 20세기 초에 형성되어 오늘날까지 이어지는 대한민국의 대표적 대중가요 장르입니다. 한국어 위키백과와 한국민족문화대백과사전은 트로트를 일제강점기에 일본 엔카(演歌)의 영향을 받아 형성된 대중가요 양식으로 설명하며, ‘뽕짝’이라는 별칭으로도 불립니다.',
      '',
      '## 음악적 특징 — 리듬·음계·창법',
      '리듬은 강박과 약박이 규칙적으로 교차하는 2박자 계통이 기본이며, 이 반주의 ‘쿵짝 쿵짝’ 소리가 ‘뽕짝’이라는 별칭의 유래로 널리 설명됩니다. 음계는 단조 5음계 등 펜타토닉을 특징적으로 사용하고, 음을 꺾어 부르는 ‘꺾기’와 비브라토로 애절한 정서를 표현하는 것이 널리 알려진 설명입니다.',
      '',
      '## 명칭의 유래',
      '‘트로트(trot)’라는 이름은 서양 사교춤곡 ‘폭스트롯(fox trot)’에서 왔다는 것이 정설입니다. 다만 여러 자료는 2박자라는 공통점 외에 실제 음악적 관련성은 크지 않다고 지적합니다. 장르명으로 ‘트로트’가 정착한 것은 대체로 1960년대 중반으로 설명됩니다.',
      '',
      '## 역사와 시대 구분',
      '트로트는 1920년대 엔카 번안곡 유입을 배경으로 1930년대 중반 하나의 대중가요 양식으로 자리 잡았고, 1960년대 이후 장르로 굳어졌습니다. 1980~90년대에는 발라드·댄스 음악의 부상으로 상대적 침체를 겪었으나 방송 무대에서 꾸준히 명맥을 유지했습니다.',
      '',
      '## 2020년 전후의 재유행',
      '2019년 TV조선 《내일은 미스트롯》과 2020년 《내일은 미스터트롯》이 큰 인기를 얻으며 트로트는 새로운 전성기를 맞았습니다. 중장년층의 문화 소비력 확대와 디지털 플랫폼을 통한 과거 곡 재유통이 맞물려 새로운 청중층이 형성됐다는 것이 언론의 일반적 분석입니다.',
      '',
      '## 입문자를 위한 감상 포인트',
      '먼저 2박자의 규칙적 리듬(‘쿵짝’)과 5음계 특유의 정서를 귀로 익히면 트로트 특유의 느낌을 쉽게 감지할 수 있습니다. ‘꺾기’ 창법과 비브라토가 만드는 애절함이 핵심 매력으로 꼽히며, 가사는 사랑과 이별·고향·인생 같은 보편적 정서를 다루는 경우가 많습니다.',
    ].join('\n'),
    sources: [
      { sourceTitle: '트로트', sourcePublisher: '위키백과', sourceUrl: 'https://ko.wikipedia.org/wiki/트로트', sourceGrade: 'B' },
      { sourceTitle: '트로트', sourcePublisher: '한국민족문화대백과사전(한국학중앙연구원)', sourceUrl: 'https://encykorea.aks.ac.kr/Article/E0066860', sourceGrade: 'A' },
      { sourceTitle: '‘장조 트로트’의 도입과 토착적 변용', sourcePublisher: '서울대학교 S-Space(학술)', sourceUrl: 'https://s-space.snu.ac.kr/bitstream/10371/98915/1/vol38_75.pdf', sourceGrade: 'B' },
    ],
    authorId,
    connectArtists: [],
    connectPrograms: [],
  });

  // 2) 미스터트롯 TOP7·방송 정보 정리
  await upsertArticle('mr-trot-top7', {
    type: 'roundup',
    title: '내일은 미스터트롯 우승자와 TOP7·시즌 정보 정리',
    seoTitle: '미스터트롯 우승자·TOP7·방송 정보 정리',
    description: 'TV조선 《내일은 미스터트롯》 시즌1 최종 우승자와 TOP7, 시즌2 우승자까지 방송 정보를 공식 보도 기반으로 정리했습니다.',
    excerpt: '미스터트롯 시즌1 TOP7과 시즌2 우승자 정리.',
    primaryKeyword: '미스터트롯 우승자',
    searchIntent: '미스터트롯 우승자와 TOP7이 누구인지',
    body: [
      '> 방송사·주요 언론 보도로 교차 확인한 사실만 정리했습니다.',
      '',
      '## 프로그램 개요',
      '《내일은 미스터트롯》은 TV조선의 남성 트로트 경연 오디션으로, 마스터 점수와 시청자 문자투표를 합산해 순위를 정하고 상위 3인에게 진(眞)·선(善)·미(美)를 부여합니다.',
      '',
      '## 시즌1 (2020) 최종 TOP7',
      '- 진(眞) 우승: 임영웅',
      '- 선(善): 영탁',
      '- 미(美): 이찬원',
      '- 4위: 김호중',
      '- 5위: 정동원',
      '- 6위: 장민호',
      '- 7위: 김희재',
      '',
      '2020년 3월 14일 방송된 결승에서 임영웅이 최종 우승했습니다.',
      '',
      '## 시즌2 (미스터트롯2)',
      '《미스터트롯2: 새로운 전설의 시작》 결승은 2023년 3월 16일 방송됐으며, 안성훈이 최종 우승(진)했습니다. 선(善)은 박지현, 미(美)는 진해성입니다.',
    ].join('\n'),
    sources: [
      { sourceTitle: '미스터트롯', sourcePublisher: '위키백과', sourceUrl: 'https://ko.wikipedia.org/wiki/미스터트롯', sourceGrade: 'B' },
      { sourceTitle: "임영웅 '미스터트롯' 최종 우승…2위 영탁·3위 이찬원", sourcePublisher: '매일신문', sourceUrl: 'https://www.imaeil.com/page/view/2020031420290777035', sourceGrade: 'B' },
      { sourceTitle: "미스터트롯2 최종 우승자는 안성훈", sourcePublisher: '아주경제', sourceUrl: 'https://www.ajunews.com/view/20230317055217211', sourceGrade: 'B' },
    ],
    authorId,
    connectArtists: [lyw.id],
    connectPrograms: [mrTrot.id],
  });

  // 3) 송가인 가인이어라 교과서 수록 (검증된 소식)
  await upsertArticle('songgain-textbook-2025', {
    type: 'award',
    title: "송가인 '가인이어라', 트로트 최초로 중학교 음악 교과서 수록",
    seoTitle: "송가인 가인이어라, 중학교 음악 교과서 수록 (트로트 최초)",
    description: '송가인의 대표곡 「가인이어라」가 2025년 중학교 음악 교과서에 수록됐습니다. 트로트 곡의 교과서 등재는 처음으로, 다수 언론이 보도했습니다.',
    excerpt: '「가인이어라」가 트로트 최초로 중학교 음악 교과서에 실렸습니다.',
    primaryKeyword: '송가인 가인이어라 교과서',
    searchIntent: '송가인 가인이어라 교과서 수록 사실 확인',
    timeSensitive: false,
    body: [
      '> 서울신문·TV리포트·머니S 등 다수 언론 보도로 교차 확인한 사실입니다.',
      '',
      '## 무엇이 알려졌나',
      '송가인의 대표곡 「가인이어라」가 중학교 음악 교과서(‘음악2’)에 수록된 사실이 2025년 10월 보도됐습니다. 트로트 곡이 정규 음악 교과서에 실린 것은 처음으로 전해집니다.',
      '',
      '## 곡 정보',
      '「가인이어라」는 송가인의 2019년 정규 1집 《佳人(가인)》의 타이틀곡입니다. 송가인은 2019년 TV조선 《내일은 미스트롯》 초대 우승자로, 국악(판소리)을 전공한 이력을 바탕으로 정통 트로트 창법을 선보여 왔습니다.',
      '',
      '## 왜 의미가 있나',
      '대중가요, 그중에서도 트로트가 공교육 교재에 실린 사례로, 트로트에 대한 대중적·문화적 인식 변화를 보여주는 상징적 사건으로 언론은 평가했습니다.',
    ].join('\n'),
    sources: [
      { sourceTitle: "송가인 '가인이어라' 음악교과서 수록", sourcePublisher: '서울신문', sourceUrl: 'https://en.seoul.co.kr/news/entertainment/2025/10/29/20251029500162', sourceGrade: 'B' },
      { sourceTitle: "송가인 '가인이어라', 중학교 음악 교과서 수록", sourcePublisher: 'TV리포트', sourceUrl: 'https://tvreport.co.kr/star/article/952405/', sourceGrade: 'B' },
      { sourceTitle: "'트로트 최초' 송가인, 중등 음악 교과서 수록", sourcePublisher: '머니S', sourceUrl: 'https://www.moneys.co.kr/article/2025102914593866027', sourceGrade: 'B' },
    ],
    authorId,
    connectArtists: [sgi.id],
    connectPrograms: [],
    connectMusic: [gain.id],
  });

  console.log('✔ 콘텐츠 시드 완료: 가수 2, 프로그램 2, 음반 2, 기사 3 (모두 출처 포함, published)');
}

interface ArticleInput {
  type: string; title: string; seoTitle?: string; description: string; excerpt?: string;
  primaryKeyword?: string; searchIntent?: string; body: string; timeSensitive?: boolean;
  sources: { sourceTitle: string; sourcePublisher: string; sourceUrl: string; sourceGrade: string }[];
  authorId: string | null; connectArtists: string[]; connectPrograms: string[]; connectMusic?: string[];
}

async function upsertArticle(slug: string, a: ArticleInput) {
  await prisma.article.upsert({ where: { slug }, update: {}, create: { slug, type: a.type, title: a.title, description: a.description, body: a.body, status: 'draft' } });
  const art = await prisma.article.update({
    where: { slug },
    data: {
      type: a.type,
      title: a.title,
      seoTitle: a.seoTitle,
      description: a.description,
      excerpt: a.excerpt,
      primaryKeyword: a.primaryKeyword,
      searchIntent: a.searchIntent,
      body: a.body,
      timeSensitive: a.timeSensitive ?? false,
      status: 'published',
      index: true,
      riskLevel: 'low',
      isSample: false,
      autoGenerated: false,
      publishedAt: NOW,
      lastFactCheckedAt: NOW,
      nextReviewAt: REVIEW,
      authorId: a.authorId,
      artists: { set: a.connectArtists.map((id) => ({ id })) },
      programs: { set: a.connectPrograms.map((id) => ({ id })) },
      music: { set: (a.connectMusic ?? []).map((id) => ({ id })) },
    },
  });
  await prisma.source.deleteMany({ where: { articleId: art.id } });
  await prisma.source.createMany({
    data: a.sources.map((s) => ({
      articleId: art.id, sourceTitle: s.sourceTitle, sourcePublisher: s.sourcePublisher,
      sourceUrl: s.sourceUrl, sourceGrade: s.sourceGrade, factType: 'reference',
      verificationStatus: 'cross_checked', accessedAt: NOW,
    })),
  });
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

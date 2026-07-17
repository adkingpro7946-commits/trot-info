/**
 * 콘텐츠 배치5 — 손태진·박지현 + 불타는 트롯맨 프로그램 (웹 조사·교차확인).
 * 기존에 등록된 두 사람의 공연에 아티스트 연결까지 복구한다.
 * 보수적 처리:
 *  - 손태진 공식 채널 검증 실패 → 링크 미표기 / 《현역가왕》 관여는 미확인이라 제외
 *  - 박지현 인스타만 검증됨(소속사명 교차일치) → 인스타만 표기
 *  - 박지현 '그레이스이엔엠 합류 시점' 보도 상충 → 연월 없이 '2025년 이적'으로만
 * 실행: DATABASE_PROVIDER=postgresql + generate 후 DATABASE_URL=<neon> npx tsx prisma/seed-content-batch5.ts
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const NOW = new Date('2026-07-17T00:00:00+09:00');
const D = (s: string) => new Date(s);

const W_STJ = 'https://ko.wikipedia.org/wiki/손태진_(성악가)';
const W_PJH = 'https://ko.wikipedia.org/wiki/박지현_(가수)';

async function main() {
  // ---------------- 프로그램: 불타는 트롯맨 ----------------
  const burning = await prisma.program.upsert({
    where: { slug: 'burning-trotman' },
    update: {},
    create: {
      slug: 'burning-trotman',
      name: '불타는 트롯맨',
      broadcaster: 'MBN',
      airInfo: '2022년 12월 ~ 2023년 3월 방영 (시즌1)',
      description:
        'MBN의 남성 트로트 경연 오디션 프로그램. 2023년 3월 8일 방영된 결승에서 손태진이 초대 우승을 차지했으며, 전국 시청률 16.2%로 종영했다.',
      isSample: false,
      status: 'published',
    },
  });

  // ---------------- 손태진 ----------------
  await prisma.artist.upsert({ where: { slug: 'son-tae-jin' }, update: {}, create: { slug: 'son-tae-jin', stageName: '손태진', profileSummary: 'x', status: 'draft' } });
  const stj = await prisma.artist.update({
    where: { slug: 'son-tae-jin' },
    data: {
      stageName: '손태진',
      realName: null, // 활동명과 동일
      profileSummary:
        '손태진은 1988년생으로 서울대학교 성악과를 졸업한 베이스바리톤 출신 가수다. JTBC 《팬텀싱어》 시즌1에 출연해 초대 우승팀 「포르테 디 콰트로」의 멤버가 되며 크로스오버 가수로 자리 잡았다. 2022년 말 MBN 《불타는 트롯맨》에 참가해 2023년 3월 최종 우승하면서 트로트로 활동 영역을 넓혔다. 이후 자작곡과 리메이크 앨범을 꾸준히 발표하며 성악·크로스오버·트로트를 넘나드는 활동을 이어가고 있다.',
      birthDate: D('1988-10-20'),
      birthPlace: '서울특별시',
      agency: '미스틱스토리',
      isSample: false,
      status: 'published',
      lastFactCheckedAt: NOW,
      programs: { connect: { id: burning.id } },
    },
  });
  await prisma.award.deleteMany({ where: { artistId: stj.id } });
  await prisma.award.createMany({
    data: [
      { artistId: stj.id, year: 2023, title: 'MBN 《불타는 트롯맨》 초대 우승', org: 'MBN', sourceUrl: 'https://news.sbs.co.kr/news/endPage.do?news_id=N1007106061' },
      { artistId: stj.id, year: 2017, title: 'JTBC 《팬텀싱어》 시즌1 우승 (포르테 디 콰트로)', org: 'JTBC', sourceUrl: 'https://ko.wikipedia.org/wiki/포르테_디_콰트로' },
      { artistId: stj.id, year: 2025, title: '한터뮤직어워즈 베스트 오브 어덜트 컨템포러리', sourceUrl: W_STJ },
    ],
  });
  await prisma.timelineEntry.deleteMany({ where: { artistId: stj.id } });
  await prisma.timelineEntry.createMany({
    data: [
      { artistId: stj.id, date: D('2023-03-08'), title: '《불타는 트롯맨》 최종 우승', sourceUrl: 'https://www.ajunews.com/view/20230308060037162' },
      { artistId: stj.id, date: D('2023-08-02'), title: '우승 특전곡 「참 좋은 사람」 발매', sourceUrl: 'http://news.heraldcorp.com/view.php?ud=20230803000650' },
    ],
  });
  await prisma.source.deleteMany({ where: { artistId: stj.id } });
  await prisma.source.createMany({
    data: [
      { artistId: stj.id, sourceTitle: '손태진 (성악가)', sourcePublisher: '위키백과', sourceUrl: W_STJ, sourceGrade: 'B', factType: 'profile', verificationStatus: 'cross_checked', accessedAt: NOW },
      { artistId: stj.id, sourceTitle: "'불타는 트롯맨' 최종 우승은 손태진", sourcePublisher: 'SBS 뉴스', sourceUrl: 'https://news.sbs.co.kr/news/endPage.do?news_id=N1007106061', sourceGrade: 'B', factType: 'award', verificationStatus: 'cross_checked', accessedAt: NOW },
      { artistId: stj.id, sourceTitle: '포르테 디 콰트로', sourcePublisher: '위키백과', sourceUrl: 'https://ko.wikipedia.org/wiki/포르테_디_콰트로', sourceGrade: 'B', factType: 'profile', verificationStatus: 'cross_checked', accessedAt: NOW },
    ],
  });

  // ---------------- 박지현 ----------------
  await prisma.artist.upsert({ where: { slug: 'park-ji-hyun' }, update: {}, create: { slug: 'park-ji-hyun', stageName: '박지현', profileSummary: 'x', status: 'draft' } });
  const pjh = await prisma.artist.update({
    where: { slug: 'park-ji-hyun' },
    data: {
      stageName: '박지현',
      realName: null, // 활동명과 동일
      profileSummary:
        '박지현은 1995년 전라남도 목포에서 태어난 트로트 가수다. 2021년 KBS1 《노래가 좋아》에서 4연승으로 명예졸업한 뒤, TV조선 《내일은 미스터트롯2》에 참가해 2023년 3월 결승에서 최종 2위인 선(善)을 차지했다. 「깜빡이를 키고 오세요」 등의 곡으로 인지도를 넓혔으며 2025년 그레이스이엔엠으로 이적했다. 2026년 2월 데뷔 후 첫 정규앨범 《MASTER VOICE》를 발표해 전곡 차트인을 기록했다.',
      birthDate: D('1995-12-12'),
      birthPlace: '전라남도 목포',
      agency: '그레이스이엔엠',
      fanClubName: '엔돌핀',
      officialSocialLinks: JSON.stringify([
        { label: '공식 인스타그램', url: 'https://www.instagram.com/parkjihyeon.official/' },
      ]),
      isSample: false,
      status: 'published',
      lastFactCheckedAt: NOW,
      programs: { connect: { id: (await prisma.program.findUnique({ where: { slug: 'mr-trot' }, select: { id: true } }))!.id } },
    },
  });
  await prisma.award.deleteMany({ where: { artistId: pjh.id } });
  await prisma.award.createMany({
    data: [
      { artistId: pjh.id, year: 2023, title: '《내일은 미스터트롯2》 선(善, 최종 2위)', org: 'TV조선', sourceUrl: 'https://www.honam.ac.kr/UniNews/read/20112' },
      { artistId: pjh.id, year: 2023, title: '제31회 대한민국 문화연예대상 성인가요 10대 가수상', sourceUrl: W_PJH },
      { artistId: pjh.id, year: 2025, title: 'MBC 방송연예대상 남자 인기상', org: 'MBC', sourceUrl: W_PJH },
    ],
  });
  await prisma.timelineEntry.deleteMany({ where: { artistId: pjh.id } });
  await prisma.timelineEntry.createMany({
    data: [
      { artistId: pjh.id, date: D('2023-03-16'), title: '《내일은 미스터트롯2》 선(善) 확정', description: '결승 최종점수 2,928.81점', sourceUrl: 'https://www.honam.ac.kr/UniNews/read/20112' },
      { artistId: pjh.id, date: D('2026-02-23'), title: '데뷔 첫 정규앨범 《MASTER VOICE》 발매', description: '초동 25만 장·전곡 차트인', sourceUrl: 'https://www.segye.com/newsView/20260311512321' },
    ],
  });
  await prisma.source.deleteMany({ where: { artistId: pjh.id } });
  await prisma.source.createMany({
    data: [
      { artistId: pjh.id, sourceTitle: '박지현 (가수)', sourcePublisher: '위키백과', sourceUrl: W_PJH, sourceGrade: 'B', factType: 'profile', verificationStatus: 'cross_checked', accessedAt: NOW },
      { artistId: pjh.id, sourceTitle: "호남대 박지현, 미스터트롯2 '선'", sourcePublisher: '호남대학교', sourceUrl: 'https://www.honam.ac.kr/UniNews/read/20112', sourceGrade: 'A', factType: 'award', verificationStatus: 'cross_checked', accessedAt: NOW },
      { artistId: pjh.id, sourceTitle: "박지현, 초동 25만 장·전곡 차트인", sourcePublisher: '세계일보', sourceUrl: 'https://www.segye.com/newsView/20260311512321', sourceGrade: 'B', factType: 'release', verificationStatus: 'cross_checked', accessedAt: NOW },
    ],
  });

  // ---------------- 대표곡 ----------------
  await upsertMusic('cham-joheun-saram', '참 좋은 사람', 'single', stj.id, '2023-08-02',
    '손태진의 《불타는 트롯맨》 우승 특전곡.', [], 'http://news.heraldcorp.com/view.php?ud=20230803000650');
  await upsertMusic('blinker-song', '깜빡이를 키고 오세요', 'single', pjh.id, '2023-03-10',
    '박지현이 《내일은 미스터트롯2》 준결승 신곡미션에서 선보인 곡으로 대표 히트곡이 됐다.', [], W_PJH);
  await upsertMusic('master-voice', 'MASTER VOICE', 'album', pjh.id, '2026-02-23',
    '박지현의 데뷔 첫 정규앨범. 타이틀곡은 「무(無)」이며 초동 25만 장·전곡 차트인을 기록했다.',
    ['Opening', '무(無)', '기도', '아름다운 인생 이야기', 'Dancing In Love', '안녕이란 슬픈 말', '애간장', '만물트럭', '초대장'],
    'https://www.munhwa.com/article/11566493');

  // ---------------- 기존 공연에 아티스트 연결(끊겨 있던 부분 복구) ----------------
  await prisma.event.update({
    where: { slug: 'son-tae-jin-maestro-2026-busan' },
    data: { artists: { set: [{ id: stj.id }] } },
  });
  await prisma.event.update({
    where: { slug: 'park-ji-hyun-showmanship2-2026-seongnam' },
    data: { artists: { set: [{ id: pjh.id }] } },
  });

  const [ar, pg, mu] = await Promise.all([
    prisma.artist.count({ where: { status: 'published' } }),
    prisma.program.count({ where: { status: 'published' } }),
    prisma.music.count({ where: { status: 'published' } }),
  ]);
  console.log(`✔ 배치5 완료. published — 가수 ${ar}, 프로그램 ${pg}, 음반/곡 ${mu} · 공연-가수 연결 복구 2건`);
}

async function upsertMusic(slug: string, title: string, type: string, artistId: string, releaseDate: string | null, description: string, tracks: string[], sourceUrl: string) {
  await prisma.music.upsert({ where: { slug }, update: {}, create: { slug, title, status: 'draft' } });
  const m = await prisma.music.update({
    where: { slug },
    data: { title, type, releaseDate: releaseDate ? D(releaseDate) : null, description, trackList: JSON.stringify(tracks), isSample: false, status: 'published', artists: { set: [{ id: artistId }] } },
  });
  await prisma.source.deleteMany({ where: { musicId: m.id } });
  await prisma.source.create({ data: { musicId: m.id, sourceTitle: `${title} 관련 자료`, sourcePublisher: '언론/백과', sourceUrl, sourceGrade: 'B', factType: 'release', verificationStatus: 'cross_checked', accessedAt: NOW } });
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

/**
 * 시드 데이터 — 전부 가상(DEMO) 데이터. 실제 인물/사실이 아님.
 * 모든 레코드 isSample=true, 화면에는 SAMPLE 배지 표시(§24).
 * 출처 URL은 example.com (실제 출처 아님, 데모 표시용).
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('▶ seed 시작 (DEMO 데이터)');

  // --- 관리자 계정 ---
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin1234!';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: '데모 관리자',
      role: 'admin',
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });
  console.log(`  관리자: ${admin.email}`);

  // 초기화(멱등): 기존 DEMO 데이터 제거 후 재생성
  await prisma.source.deleteMany({});
  await prisma.revisionLog.deleteMany({});
  await prisma.award.deleteMany({});
  await prisma.timelineEntry.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.music.deleteMany({});
  await prisma.program.deleteMany({});
  await prisma.artist.deleteMany({});

  const D = (s: string) => new Date(s);

  // --- 프로그램 ---
  const program = await prisma.program.create({
    data: {
      slug: 'demo-trot-stage',
      name: '데모 트로트 스테이지 (DEMO)',
      broadcaster: '데모방송',
      airInfo: '매주 금요일 저녁 (DEMO)',
      description: '데모용 가상 트로트 경연/무대 프로그램입니다. 실제 프로그램이 아닙니다.',
      isSample: true,
      status: 'published',
    },
  });

  // --- 가수 3명 (전부 가상 인물) ---
  const artistA = await prisma.artist.create({
    data: {
      slug: 'demo-kim-trot',
      stageName: '김트로트 (DEMO)',
      realName: null, // 미확인 → null
      profileSummary:
        '김트로트는 데모용 가상 트로트 가수입니다. 본 프로필의 모든 정보는 사이트 구조 시연을 위한 예시이며 실제 인물이 아닙니다. 검증된 정보만 표시하는 프로필 구조를 보여줍니다.',
      birthPlace: '데모시',
      debutDate: D('2015-03-01'),
      agency: '데모엔터테인먼트',
      fanClubName: '데모팬 (DEMO)',
      officialWebsite: 'https://example.com/demo-kim-trot',
      officialSocialLinks: JSON.stringify([
        { label: '공식 유튜브(DEMO)', url: 'https://example.com/demo-kim-yt' },
        { label: '공식 인스타(DEMO)', url: 'https://example.com/demo-kim-ig' },
      ]),
      isSample: true,
      status: 'published',
      lastFactCheckedAt: D('2026-07-10'),
      awards: {
        create: [
          { year: 2019, title: '데모 신인상 (DEMO)', org: '데모가요대상', sourceUrl: 'https://example.com/demo-award' },
        ],
      },
      timeline: {
        create: [
          { date: D('2015-03-01'), title: '데뷔 (DEMO)', description: '가상 데뷔 이벤트', sourceUrl: 'https://example.com/demo1' },
          { date: D('2020-06-15'), title: '첫 단독 콘서트 (DEMO)', description: '가상 공연', sourceUrl: 'https://example.com/demo2' },
          { date: D('2026-05-20'), title: '신곡 발표 (DEMO)', description: '가상 신곡', sourceUrl: 'https://example.com/demo3' },
        ],
      },
      programs: { connect: { id: program.id } },
    },
  });

  const artistB = await prisma.artist.create({
    data: {
      slug: 'demo-lee-song',
      stageName: '이가락 (DEMO)',
      profileSummary:
        '이가락은 데모용 가상 트로트 가수입니다. 실제 인물이 아니며, 미확인 정보(나이·가족관계 등)는 표시하지 않는 원칙을 시연합니다.',
      debutDate: D('2018-09-10'),
      agency: '데모뮤직',
      officialSocialLinks: JSON.stringify([
        { label: '공식 채널(DEMO)', url: 'https://example.com/demo-lee' },
      ]),
      isSample: true,
      status: 'published',
      lastFactCheckedAt: D('2026-07-08'),
      programs: { connect: { id: program.id } },
    },
  });

  const artistC = await prisma.artist.create({
    data: {
      slug: 'demo-park-hyang',
      stageName: '박향 (DEMO)',
      profileSummary:
        '박향은 데모용 가상 트로트 가수입니다. 이 항목은 프로필 최소 정보 상태(검증 대기)를 보여주는 예시입니다.',
      isSample: true,
      status: 'published',
      lastFactCheckedAt: D('2026-07-01'),
    },
  });

  // --- 음반/곡 ---
  const music = await prisma.music.create({
    data: {
      slug: 'demo-spring-road',
      title: '봄길 (DEMO)',
      type: 'single',
      releaseDate: D('2026-05-20'),
      label: '데모레코드',
      description: '데모용 가상 신곡입니다. 실제 음원이 아닙니다.',
      trackList: JSON.stringify(['봄길 (DEMO)', '봄길 (Inst.) (DEMO)']),
      isSample: true,
      status: 'published',
      artists: { connect: { id: artistA.id } },
      sources: {
        create: [
          {
            sourceTitle: '데모레코드 공식 발매 안내 (DEMO)',
            sourcePublisher: '데모레코드',
            sourceUrl: 'https://example.com/demo-release',
            sourceGrade: 'A',
            factType: 'release',
            verificationStatus: 'verified',
            accessedAt: D('2026-05-19'),
          },
        ],
      },
    },
  });

  // --- 공연 3개 ---
  const eventPublished = await prisma.event.create({
    data: {
      slug: 'demo-seoul-concert-2026-08',
      eventName: '김트로트 데모 콘서트 in 서울 (DEMO)',
      eventType: 'concert',
      startDateTime: D('2026-08-15T19:00:00+09:00'),
      endDateTime: D('2026-08-15T21:00:00+09:00'),
      venue: '데모아트홀 (DEMO)',
      address: '서울 데모구 데모로 1',
      region: 'seoul',
      ticketVendor: '데모티켓 (DEMO)',
      ticketUrl: 'https://example.com/demo-ticket',
      ticketOpenDate: D('2026-07-20T14:00:00+09:00'),
      priceInformation: 'R석 99,000원 / S석 77,000원 (DEMO, 실시간 아님)',
      ageRestriction: '8세 이상 관람 (DEMO)',
      organizer: '데모기획',
      officialSourceUrl: 'https://example.com/demo-concert',
      transportInfo: '데모역 2번 출구 도보 5분 (DEMO)',
      eventStatus: 'ticket_open',
      sourceCheckedAt: D('2026-07-11'),
      isSample: true,
      status: 'published',
      artists: { connect: { id: artistA.id } },
      sources: {
        create: [
          {
            sourceTitle: '데모기획 공연 안내 (DEMO)',
            sourcePublisher: '데모기획',
            sourceUrl: 'https://example.com/demo-concert',
            sourceGrade: 'A',
            factType: 'schedule',
            verificationStatus: 'verified',
            accessedAt: D('2026-07-11'),
          },
          {
            sourceTitle: '데모티켓 예매 페이지 (DEMO)',
            sourcePublisher: '데모티켓',
            sourceUrl: 'https://example.com/demo-ticket',
            sourceGrade: 'A',
            factType: 'schedule',
            verificationStatus: 'cross_checked',
            accessedAt: D('2026-07-11'),
          },
        ],
      },
    },
  });

  const eventCancelled = await prisma.event.create({
    data: {
      slug: 'demo-busan-event-cancelled',
      eventName: '이가락 데모 페스티벌 in 부산 (DEMO)',
      eventType: 'festival',
      startDateTime: D('2026-09-05T18:00:00+09:00'),
      venue: '데모비치 특설무대 (DEMO)',
      region: 'busan',
      organizer: '데모페스티벌',
      officialSourceUrl: 'https://example.com/demo-festival',
      eventStatus: 'cancelled', // 취소 → 삭제하지 않고 상태 유지(§5)
      cancelledAt: D('2026-07-09'),
      sourceCheckedAt: D('2026-07-10'),
      isSample: true,
      status: 'published',
      artists: { connect: { id: artistB.id } },
      sources: {
        create: [
          {
            sourceTitle: '데모페스티벌 취소 공지 (DEMO)',
            sourcePublisher: '데모페스티벌',
            sourceUrl: 'https://example.com/demo-festival',
            sourceGrade: 'A',
            factType: 'schedule',
            verificationStatus: 'verified',
            accessedAt: D('2026-07-10'),
          },
        ],
      },
    },
  });

  await prisma.event.create({
    data: {
      slug: 'demo-daegu-broadcast-recording',
      eventName: '데모 트로트 스테이지 공개방송 (DEMO)',
      eventType: 'broadcast_recording',
      startDateTime: D('2026-07-25T15:00:00+09:00'),
      venue: '데모방송 공개홀 (DEMO)',
      region: 'daegu',
      organizer: '데모방송',
      officialSourceUrl: 'https://example.com/demo-recording',
      eventStatus: 'scheduled',
      sourceCheckedAt: D('2026-07-11'),
      isSample: true,
      status: 'published',
      artists: { connect: [{ id: artistA.id }, { id: artistB.id }] },
      sources: {
        create: [
          {
            sourceTitle: '데모방송 공개방송 안내 (DEMO)',
            sourcePublisher: '데모방송',
            sourceUrl: 'https://example.com/demo-recording',
            sourceGrade: 'A',
            factType: 'schedule',
            verificationStatus: 'verified',
            accessedAt: D('2026-07-11'),
          },
        ],
      },
    },
  });

  // --- 기사: 발행된 신곡 소식 ---
  const articleRelease = await prisma.article.create({
    data: {
      type: 'release',
      slug: 'demo-kim-trot-spring-road-release',
      title: '김트로트 신곡 봄길 발매일·수록곡·활동 정리 (DEMO)',
      seoTitle: '김트로트 신곡 봄길 발매일·수록곡 안내 (DEMO)',
      description:
        '가상 가수 김트로트(DEMO)의 신곡 봄길 발매 정보를 정리한 데모 기사입니다. 사이트의 신곡 소식 구조를 보여줍니다.',
      excerpt: '데모용 신곡 소식 예시. 발매일·수록곡·관련 공연을 한곳에 정리.',
      body: [
        '> 이 문서는 사이트 구조 시연을 위한 DEMO 콘텐츠입니다. 실제 인물·음원·사실이 아닙니다.',
        '',
        '## 무엇이 발표됐나',
        '데모레코드는 김트로트(DEMO)의 신곡 「봄길(DEMO)」을 2026년 5월 20일 발매했다고 공식 안내했습니다.',
        '',
        '## 핵심 정보',
        '- 발매일: 2026년 5월 20일',
        '- 타이틀곡: 봄길 (DEMO)',
        '- 수록곡: 봄길, 봄길(Inst.)',
        '- 유통/레이블: 데모레코드',
        '',
        '## 기존 활동과의 연결',
        '김트로트(DEMO)는 2015년 데뷔 이후 꾸준히 활동해 온 가상 인물 예시입니다. 이번 신곡은 8월 서울 데모 콘서트와 연계됩니다.',
        '',
        '## 팬 확인 사항',
        '- 8월 15일 서울 데모 콘서트에서 신곡 무대 예정(DEMO)',
        '- 세부 일정은 공식 채널에서 다시 확인하세요.',
      ].join('\n'),
      searchIntent: '김트로트 신곡 봄길 발매 정보',
      primaryKeyword: '김트로트',
      relatedKeywords: JSON.stringify(['봄길', '신곡', '발매일']),
      categories: JSON.stringify(['신곡·앨범']),
      tags: JSON.stringify(['신곡', 'DEMO']),
      publishedAt: D('2026-05-20T10:00:00+09:00'),
      lastFactCheckedAt: D('2026-05-20'),
      nextReviewAt: D('2026-08-20'),
      timeSensitive: true,
      authorId: admin.id,
      reviewerId: admin.id,
      status: 'published',
      index: true,
      riskLevel: 'low',
      qualityScore: 88,
      qualityBreakdown: JSON.stringify({ 검색의도: 18, 사실정확성: 18, 출처신뢰성: 18, 새가치: 12, 중복방지: 10, 가독성: 5, 내부연결: 5, 기술SEO: 2 }),
      isSample: true,
      heroImage: '/img/default-release.svg',
      heroImageAlt: '신곡을 상징하는 편집 일러스트 (DEMO)',
      isAiImage: false,
      artists: { connect: { id: artistA.id } },
      music: { connect: { id: music.id } },
      events: { connect: { id: eventPublished.id } },
      sources: {
        create: [
          {
            sourceTitle: '데모레코드 공식 발매 안내 (DEMO)',
            sourcePublisher: '데모레코드',
            sourceUrl: 'https://example.com/demo-release',
            sourceGrade: 'A',
            factType: 'release',
            verificationStatus: 'verified',
            accessedAt: D('2026-05-19'),
          },
          {
            sourceTitle: '데모음원 플랫폼 앨범 페이지 (DEMO)',
            sourcePublisher: '데모뮤직',
            sourceUrl: 'https://example.com/demo-music-platform',
            sourceGrade: 'A',
            factType: 'release',
            verificationStatus: 'cross_checked',
            accessedAt: D('2026-05-20'),
          },
        ],
      },
    },
  });

  // --- 기사: 발행된 공연 일정 정리 ---
  await prisma.article.create({
    data: {
      type: 'news',
      slug: 'demo-seoul-trot-concerts-2026-08',
      title: '2026년 8월 서울 트로트 공연 일정 정리 (DEMO)',
      description: '가상 데이터 기반으로 2026년 8월 서울 지역 트로트 공연 일정을 정리한 데모 기사입니다.',
      excerpt: '지역·월별 공연 정리 콘텐츠 구조 예시.',
      body: [
        '> DEMO 콘텐츠입니다. 실제 공연 정보가 아닙니다.',
        '',
        '## 이번 달 서울 공연',
        '- 8월 15일 · 김트로트 데모 콘서트 in 서울 (DEMO아트홀), 예매 중',
        '',
        '일정은 변경될 수 있으므로 공식 공연 페이지에서 최종 확인하세요. (확인 기준일: 2026년 7월 11일)',
      ].join('\n'),
      searchIntent: '2026 8월 서울 트로트 공연 일정',
      primaryKeyword: '서울 트로트 공연',
      relatedKeywords: JSON.stringify(['8월 공연', '서울 콘서트']),
      categories: JSON.stringify(['공연·행사']),
      tags: JSON.stringify(['공연', '서울', 'DEMO']),
      publishedAt: D('2026-07-11T09:00:00+09:00'),
      lastFactCheckedAt: D('2026-07-11'),
      timeSensitive: true,
      authorId: admin.id,
      status: 'published',
      riskLevel: 'low',
      qualityScore: 86,
      isSample: true,
      heroImage: '/img/default-news.svg',
      heroImageAlt: '공연 일정 정보 카드 배경 (DEMO)',
      artists: { connect: { id: artistA.id } },
      events: { connect: { id: eventPublished.id } },
      sources: {
        create: [
          {
            sourceTitle: '데모기획 공연 안내 (DEMO)',
            sourcePublisher: '데모기획',
            sourceUrl: 'https://example.com/demo-concert',
            sourceGrade: 'A',
            factType: 'schedule',
            verificationStatus: 'cross_checked',
            accessedAt: D('2026-07-11'),
          },
        ],
      },
    },
  });

  // --- 자동 생성 테스트용 초안 1개 (autoGenerated, review 상태) (§24) ---
  await prisma.article.create({
    data: {
      type: 'news',
      slug: 'demo-auto-draft-review-sample',
      title: '[자동생성 초안] 이가락 데모 방송 출연 관련 확인 필요 항목 (DEMO)',
      description:
        '자동화 파이프라인이 생성한 데모 초안입니다. 민감/검증 사유로 자동 발행되지 않고 검수 대기(review) 상태로 저장된 예시입니다.',
      excerpt: '자동 생성 → 검수 대기 흐름 시연용 초안.',
      body: [
        '> 자동화 파이프라인 산출물(DEMO). 관리자 검수 전까지 발행되지 않습니다.',
        '',
        '이 초안은 다음 사유로 자동 발행이 보류되었습니다:',
        '- 교차 확인 출처 부족(단일 출처)',
        '- 확인 필요한 일정 정보 포함',
        '',
        '관리자 검수 후에만 발행됩니다. (자동 발행 스위치 OFF)',
      ].join('\n'),
      searchIntent: '이가락 방송 출연 확인',
      primaryKeyword: '이가락',
      categories: JSON.stringify(['방송 출연']),
      tags: JSON.stringify(['DEMO', '자동생성']),
      lastFactCheckedAt: D('2026-07-12'),
      nextReviewAt: D('2026-07-14'),
      authorId: null,
      status: 'review', // 자동 발행 금지 → 검수 대기
      index: false,
      riskLevel: 'medium',
      qualityScore: 72,
      qualityBreakdown: JSON.stringify({ 검색의도: 14, 사실정확성: 10, 출처신뢰성: 8, 새가치: 12, 중복방지: 10, 가독성: 5, 내부연결: 3, 기술SEO: 2 }),
      isSample: true,
      autoGenerated: true,
      artists: { connect: { id: artistB.id } },
      programs: { connect: { id: program.id } },
      sources: {
        create: [
          {
            sourceTitle: '데모방송 편성 안내 (DEMO, 단일출처)',
            sourcePublisher: '데모방송',
            sourceUrl: 'https://example.com/demo-broadcast-single',
            sourceGrade: 'B',
            factType: 'schedule',
            verificationStatus: 'unverified',
            accessedAt: D('2026-07-12'),
          },
        ],
      },
    },
  });

  // 자동화 로그 예시
  await prisma.automationLog.createMany({
    data: [
      { stage: 'collect', level: 'info', message: 'DEMO 후보 5건 수집' },
      { stage: 'risk', level: 'warn', message: '이가락 방송 초안: 민감/단일출처 → 검수 강제', refType: 'article', refId: 'demo-auto-draft-review-sample' },
      { stage: 'publish', level: 'info', message: '자동 발행 스위치 OFF → 3건 draft/review 보관' },
    ],
  });

  console.log('✔ seed 완료: 가수 3, 공연 3, 기사 3(발행 2/검수 1), 음반 1, 프로그램 1');
  void artistC; void eventCancelled; void articleRelease;
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

/**
 * 콘텐츠 배치4 — 김연자·진성 (웹 조사 + 출처 교차확인). isSample=false, published.
 * 보수적 처리:
 *  - 김연자 「아침의 나라에서」는 88올림픽 주제가 선정→교체 이력이 있어 서술에서 제외
 *  - 진성 「보릿고개」 발매연도 2015/2016 상충 → 설명에 병기, releaseDate는 미표기
 *  - 공식 SNS 채널은 검증 실패(404/JS) → 링크 미표기
 *  - 두 가수 모두 오늘(2026-07-17) 이후 검증된 예정 공연 없음 → 공연 미등록
 * 실행: DATABASE_PROVIDER=postgresql + generate 후 DATABASE_URL=<neon> npx tsx prisma/seed-content-batch4.ts
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const NOW = new Date('2026-07-17T00:00:00+09:00');
const D = (s: string) => new Date(s);

const W_KYJ = 'https://ko.wikipedia.org/wiki/김연자';
const W_JS = 'https://ko.wikipedia.org/wiki/진성_(가수)';

async function main() {
  // ---------------- 김연자 ----------------
  await prisma.artist.upsert({ where: { slug: 'kim-yeon-ja' }, update: {}, create: { slug: 'kim-yeon-ja', stageName: '김연자', profileSummary: 'x', status: 'draft' } });
  const kyj = await prisma.artist.update({
    where: { slug: 'kim-yeon-ja' },
    data: {
      stageName: '김연자',
      realName: null, // 활동명과 동일
      profileSummary:
        '김연자는 1959년 광주에서 태어난 대한민국의 트로트 가수로, 1974년 「말을 해줘요」로 데뷔해 2024년 데뷔 50주년을 맞았다. 1980년대 후반부터 약 20여 년간 일본에서 엔카 가수로 활동하며 NHK 홍백가합전에 세 차례 출전했고 오리콘 엔카 차트 1위를 기록했다. 2009년 국내 활동을 재개했으며, 2013년 발표한 「아모르 파티」가 2017년 역주행하며 세대를 아우르는 인기를 얻었다. 2021년 대한민국 대중문화예술상에서 트로트 가수 최초로 대통령표창을 받았다.',
      birthDate: D('1959-01-25'),
      birthPlace: '광주광역시',
      agency: 'YJK컴퍼니',
      isSample: false,
      status: 'published',
      lastFactCheckedAt: NOW,
    },
  });
  await prisma.award.deleteMany({ where: { artistId: kyj.id } });
  await prisma.award.createMany({
    data: [
      { artistId: kyj.id, year: 2021, title: '제12회 대한민국 대중문화예술상 대통령표창 (트로트 가수 최초)', org: '문화체육관광부', sourceUrl: 'https://m.newspim.com/news/view/20211028000139' },
      { artistId: kyj.id, year: 1983, title: 'MBC 10대가수가요제 본상', org: 'MBC', sourceUrl: W_KYJ },
      { artistId: kyj.id, year: 2003, title: '일본 요시다 타다시상', sourceUrl: W_KYJ },
    ],
  });
  await prisma.timelineEntry.deleteMany({ where: { artistId: kyj.id } });
  await prisma.timelineEntry.createMany({
    data: [
      { artistId: kyj.id, date: D('2013-05-23'), title: '「아모르 파티」 발표', description: '2017년 음원차트 트로트 부문 1위로 역주행', sourceUrl: 'https://ko.wikipedia.org/wiki/아모르_파티_(노래)' },
      { artistId: kyj.id, date: D('2024-06-02'), title: '데뷔 50주년 기념 콘서트 (광주예술의전당)', sourceUrl: 'https://www.lecturernews.com/news/articleView.html?idxno=153039' },
    ],
  });
  await prisma.source.deleteMany({ where: { artistId: kyj.id } });
  await prisma.source.createMany({
    data: [
      { artistId: kyj.id, sourceTitle: '김연자', sourcePublisher: '위키백과', sourceUrl: W_KYJ, sourceGrade: 'B', factType: 'profile', verificationStatus: 'cross_checked', accessedAt: NOW },
      { artistId: kyj.id, sourceTitle: "'대중문화예술상' 수상자 발표", sourcePublisher: '뉴스핌', sourceUrl: 'https://m.newspim.com/news/view/20211028000139', sourceGrade: 'B', factType: 'award', verificationStatus: 'cross_checked', accessedAt: NOW },
      { artistId: kyj.id, sourceTitle: '가수 김연자 "노래 좋아 달려온 50년"', sourcePublisher: '한국강사신문', sourceUrl: 'https://www.lecturernews.com/news/articleView.html?idxno=153039', sourceGrade: 'B', factType: 'profile', verificationStatus: 'cross_checked', accessedAt: NOW },
    ],
  });

  // ---------------- 진성 ----------------
  await prisma.artist.upsert({ where: { slug: 'jin-sung' }, update: {}, create: { slug: 'jin-sung', stageName: '진성', profileSummary: 'x', status: 'draft' } });
  const js = await prisma.artist.update({
    where: { slug: 'jin-sung' },
    data: {
      stageName: '진성',
      realName: '진성철',
      profileSummary:
        '진성(본명 진성철)은 1960년 전북 부안에서 태어난 대한민국의 트로트 가수로, 1997년 앨범 《님의 등불》로 데뷔했다. 「내가 바보야」, 「태클을 걸지마」를 거쳐 2008년 발표한 「안동역에서」가 2012년 재편곡 이후 큰 인기를 얻으며 대표곡으로 자리 잡았다. 직접 작사한 「보릿고개」는 지난 시절의 정서를 담아낸 곡으로 널리 알려졌다. 2023년부터 소속사 토탈셋에서 활동하고 있다.',
      birthDate: D('1960-08-06'),
      birthPlace: '전라북도 부안',
      agency: '토탈셋',
      officialWebsite: 'https://totalset.kr',
      isSample: false,
      status: 'published',
      lastFactCheckedAt: NOW,
    },
  });
  await prisma.award.deleteMany({ where: { artistId: js.id } });
  await prisma.award.createMany({
    data: [
      { artistId: js.id, year: 2019, title: '소리바다 베스트 케이뮤직 어워즈 트로트 대상', sourceUrl: W_JS },
      { artistId: js.id, year: 2020, title: '제1회 트롯어워즈 트롯100년 남자 베스트 가수상', sourceUrl: W_JS },
      { artistId: js.id, year: 2014, title: 'MBC가요베스트 올해의 노래상', org: 'MBC', sourceUrl: W_JS },
    ],
  });
  await prisma.timelineEntry.deleteMany({ where: { artistId: js.id } });
  await prisma.timelineEntry.createMany({
    data: [
      { artistId: js.id, date: D('2015-04-18'), title: '정규앨범 《안동역에서》 발매', description: '「보릿고개」 수록', sourceUrl: W_JS },
      { artistId: js.id, date: D('2023-09-23'), title: '신곡 「소금꽃」 발매', sourceUrl: 'https://m.news.nate.com/view/20230923n03171' },
    ],
  });
  await prisma.source.deleteMany({ where: { artistId: js.id } });
  await prisma.source.createMany({
    data: [
      { artistId: js.id, sourceTitle: '진성 (가수)', sourcePublisher: '위키백과', sourceUrl: W_JS, sourceGrade: 'B', factType: 'profile', verificationStatus: 'cross_checked', accessedAt: NOW },
      { artistId: js.id, sourceTitle: '[노래와 세상] 안동역에서', sourcePublisher: '경향신문', sourceUrl: 'https://www.khan.co.kr/article/202301160300085', sourceGrade: 'B', factType: 'profile', verificationStatus: 'cross_checked', accessedAt: NOW },
      { artistId: js.id, sourceTitle: '진성·박군, 소속사 토탈셋과 재계약', sourcePublisher: '톱스타뉴스', sourceUrl: 'https://www.topstarnews.net/news/articleView.html?idxno=16109312', sourceGrade: 'B', factType: 'profile', verificationStatus: 'cross_checked', accessedAt: NOW },
    ],
  });

  // ---------------- 대표곡 ----------------
  await upsertSingle('amor-fati', '아모르 파티', kyj.id, '2013-05-23',
    '김연자의 대표곡. 트로트에 EDM을 결합한 곡으로, 2013년 발표 후 2017년 음원차트 트로트 부문 1위로 역주행했다. 작사 신철·이건우, 작곡 윤일상.',
    'https://ko.wikipedia.org/wiki/아모르_파티_(노래)');

  await upsertSingle('andong-station', '안동역에서', js.id, null,
    '진성의 대표곡. 2008년 발표됐으나 큰 반응이 없다가 2012년 재편곡 이후 폭발적인 인기를 얻었다. 작사 김병걸, 작곡 최강산.',
    'https://www.khan.co.kr/article/202301160300085');

  await upsertSingle('borit-gogae', '보릿고개', js.id, null,
    '진성이 직접 작사한 곡. 2015년 정규앨범 《안동역에서》에 수록됐고, 2016년 리메이크 싱글로도 발매됐다. 작곡 김도일.',
    'https://www.nongmin.com/article/20200414321571');

  const [ar, mu] = await Promise.all([
    prisma.artist.count({ where: { status: 'published' } }),
    prisma.music.count({ where: { status: 'published' } }),
  ]);
  console.log(`✔ 배치4 완료. published — 가수 ${ar}, 음반/곡 ${mu} (예정 공연 검증분 없어 공연 미등록)`);
}

async function upsertSingle(slug: string, title: string, artistId: string, releaseDate: string | null, description: string, sourceUrl: string) {
  await prisma.music.upsert({ where: { slug }, update: {}, create: { slug, title, status: 'draft' } });
  const m = await prisma.music.update({
    where: { slug },
    data: { title, type: 'single', releaseDate: releaseDate ? D(releaseDate) : null, description, isSample: false, status: 'published', artists: { set: [{ id: artistId }] } },
  });
  await prisma.source.deleteMany({ where: { musicId: m.id } });
  await prisma.source.create({ data: { musicId: m.id, sourceTitle: `${title} 관련 자료`, sourcePublisher: '언론/백과', sourceUrl, sourceGrade: 'B', factType: 'release', verificationStatus: 'cross_checked', accessedAt: NOW } });
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

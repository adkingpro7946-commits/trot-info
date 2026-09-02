/**
 * 콘텐츠 배치24 — 가수 심층 프로필 본문(bio) 채우기 (애드센스 '낮은 가치 콘텐츠' 대응).
 * 검증된 공개 사실만 자체 서술. 나이·가족·건강·연애·재산 등은 다루지 않음(플랫폼 원칙).
 * bio 참고 출처는 sourceTitle '[프로필]' 접두어로 관리(멱등: 재실행 시 갱신).
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const NOW = new Date('2026-08-25T00:00:00+09:00');

type Src = { title: string; publisher: string; url: string };

async function setBio(slug: string, bio: string, sources: Src[]) {
  const a = await prisma.artist.findUnique({ where: { slug }, select: { id: true } });
  if (!a) { console.log(`  - 없음, 건너뜀 ${slug}`); return false; }
  await prisma.artist.update({ where: { slug }, data: { bio, lastFactCheckedAt: NOW } });
  await prisma.source.deleteMany({ where: { artistId: a.id, sourceTitle: { startsWith: '[프로필]' } } });
  for (const s of sources) {
    await prisma.source.create({ data: {
      artistId: a.id, sourceTitle: `[프로필] ${s.title}`, sourcePublisher: s.publisher, sourceUrl: s.url,
      sourceGrade: 'B', factType: 'reference', verificationStatus: 'cross_checked', accessedAt: NOW,
    } });
  }
  return true;
}

// slug → { bio(Markdown), sources }
const wiki = (name: string, path: string): Src => ({ title: name, publisher: '위키백과', url: `https://ko.wikipedia.org/wiki/${path}` });
const namu = (name: string, path: string): Src => ({ title: name, publisher: '나무위키', url: `https://namu.wiki/w/${path}` });

const BIOS: Record<string, { bio: string; sources: Src[] }> = {
  'lim-young-woong': {
    bio: `임영웅은 2016년 KBS 《전국노래자랑》에서 최우수상을 받은 뒤 같은 해 디지털 싱글 「미워요」로 정식 데뷔했다. 무명 시절을 거친 그는 2020년 TV조선 《내일은 미스터트롯》에 출연해 실시간 국민투표에서 압도적인 득표율로 초대 '진(眞, 최종 1위)'에 선정되며 전국적인 스타로 발돋움했다.

우승 직후 발표한 「이제 나만 믿어요」가 주요 음원 차트 상위권을 기록하며 대표곡으로 자리 잡았고, 이후 「별빛 같은 나의 사랑아」와 드라마 OST 「사랑은 늘 도망가」 등 발표곡마다 음원 사이트 1위를 이어갔다. 2022년 5월에는 첫 정규앨범 「[IM HERO](/music/im-hero)」를 발매해 발매 첫 주 110만 장 이상의 판매고를 올렸으며, 2025년 정규 2집 「[IM HERO 2](/music/lim-young-woong-im-hero-2)」로 활동을 이어갔다.

발라드와 트로트를 아우르는 폭넓은 창법과 탄탄한 팬덤을 바탕으로 트로트의 대중화에 크게 기여했다는 평가를 받는다. 소속사는 물고기뮤직이다.`,
    sources: [wiki('임영웅', '%EC%9E%84%EC%98%81%EC%9B%85'), namu('임영웅', '%EC%9E%84%EC%98%81%EC%9B%85')],
  },
  'young-tak': {
    bio: `영탁(본명 박영탁)은 2000년대 중반 발라드·R&B 가수로 음악 활동을 시작했다가 2016년 트로트로 전향했다. 2020년 TV조선 《내일은 미스터트롯》에서 최종 2위인 '선(善)'에 오르며 인지도가 크게 상승했다.

미스터트롯에서 강진의 「막걸리 한잔」을 리메이크해 부른 무대로 화제를 모았고, 자작곡 「니가 왜 거기서 나와」가 큰 인기를 끌며 대표곡이 됐다. 이후 「[찐이야](/music/jjiniya)」 등 히트곡과 정규 「[MMM](/music/youngtak-mmm)」·「[FORM](/music/young-tak-form)」 등 앨범 활동을 이어갔다.

작사·작곡·프로듀싱을 겸하는 싱어송라이터로, 트로트에 댄스·팝 등 다양한 색을 더한 무대로 폭넓은 층의 사랑을 받고 있다.`,
    sources: [wiki('영탁', '%EC%98%81%ED%83%81'), namu('영탁', '%EC%98%81%ED%83%81')],
  },
  'lee-chan-won': {
    bio: `이찬원은 대구광역시 출신의 트로트 가수로, 어린 시절 SBS 《놀라운 대회 스타킹》 등에 출연해 '트로트 신동'으로 소개된 바 있다. 2020년 TV조선 《내일은 미스터트롯》에서 최종 3위인 '미(美)'에 선정되며 이름을 알렸다.

예선 무대에서 부른 「진또배기」로 강렬한 인상을 남기며 '찬또배기'라는 별명을 얻었고, 트로트 관련 지식이 풍부해 '찬또위키'라는 수식어로도 불린다. 「편의점」 등 발표곡으로 음악방송 1위를 기록했으며, 정규 「[ONE](/music/leechanwon-one)」·「[찬란](/music/lee-chan-won-chanran)」 등 꾸준한 음반 활동을 이어가고 있다.

《불후의 명곡》, 《신상출시 편스토랑》 등 예능에 고정 출연하며 활동 영역을 넓혔고, 2024년 KBS 연예대상에서 대상을 수상했다.`,
    sources: [wiki('이찬원', '%EC%9D%B4%EC%B0%AC%EC%9B%90'), namu('이찬원', '%EC%9D%B4%EC%B0%AC%EC%9B%90')],
  },
  'kim-hee-jae': {
    bio: `김희재는 2011년 KBS 《전국노래자랑》에서 최우수상을 받으며 일찍이 노래 실력을 알렸고, 2020년 TV조선 《내일은 미스터트롯》에 출연해 최종 7위(TOP7)에 오르며 대중적 인지도를 크게 높였다. 미스터트롯에서 「돌리도」, 「꽃을 든 남자」 등의 무대로 화제를 모았다.

2022년 정규 1집 「희재(熙栽)」를 발표한 뒤 정규 2집 「[희로애락](/music/kim-hee-jae-huiroaerak)」(2024) 등으로 음반 활동을 이어갔으며, 드라마 《꼰대인턴》 OST 「오르막길」을 불러 음원 활동 범위를 넓혔다. 2020년 멜론뮤직어워즈 핫 트렌드상 등을 수상했다.

가수 활동과 함께 뮤지컬 《모차르트》 등 무대에 서며 배우로도 진출했고, 방송에서는 진행자·심사위원 등으로도 활동했다. 소속사는 티엔엔터테인먼트다.`,
    sources: [wiki('김희재 (가수)', '%EA%B9%80%ED%9D%AC%EC%9E%AC_(%EA%B0%80%EC%88%98)'), { title: '트로트 가수 김희재가 연기에 도전한 이유', publisher: '파이낸셜뉴스', url: 'https://www.fnnews.com/news/202204180801368812' }],
  },
  'jang-min-ho': {
    bio: `장민호(본명 장호근)는 1997년 그룹 '유비스(U-Bes)'의 멤버로 가요계에 데뷔했다. 2011년경부터 트로트로 활동 방향을 전환했고, 2013년 발표한 「남자는 말합니다」가 대표곡으로 자리 잡으며 무대에서 꾸준히 사랑받았다.

2020년 TV조선 《내일은 미스터트롯》에서 최종 6위(TOP6)에 올라 데뷔 20여 년 만에 폭넓은 인기를 얻었다. 뛰어난 댄스와 예능감·입담으로 '엄통령(엄마들의 대통령)'이라는 별명으로 불렸으며, 《사랑의 콜센타》·《뽕숭아학당》 등 예능과 《신상출시 편스토랑》 진행으로도 활동했다.

정규 「[ETERNAL](/music/jang-min-ho-eternal)」과 '에세이' 시리즈([ep.1](/music/jang-min-ho-essay-ep1)·[ep.2](/music/jang-min-ho-essay-ep2)·[ep.3](/music/jangminho-essay3)), 헌정 앨범 「[Analog Vol.1](/music/jang-min-ho-analog-vol-1)」 등 꾸준한 음반 활동을 이어가고 있다. 소속사는 호엔터테인먼트다.`,
    sources: [wiki('장민호 (가수)', '%EC%9E%A5%EB%AF%BC%ED%98%B8_(%EA%B0%80%EC%88%98)'), namu('장민호', '%EC%9E%A5%EB%AF%BC%ED%98%B8')],
  },
  'jeong-dong-won': {
    bio: `정동원은 2020년 TV조선 《내일은 미스터트롯》에 출연해 최종 TOP7에 오르며 이름을 알렸다. 「여백」 무대가 그의 대표 무대로 꼽히며, 어린 나이에 원숙한 감성을 보여줘 큰 주목을 받았다.

미스터트롯 이후 《사랑의 콜센타》 등에 출연하며 방송 활동을 이어갔고, 2020년 KBS 《불후의 명곡》 송해가요제에서 MVP를 수상했다. 2021년 정규 1집 「[그리움, 아낌없이 주는 나무](/music/jeong-dong-won-grium-namu)」로 솔로 음반 활동을 본격화한 뒤, 「[키다리의 선물](/music/jeong-dong-won-kidariui-seonmul)」·소품집 시리즈 등으로 트로트와 발라드·댄스를 아우르는 폭넓은 음악을 선보였다.

한터뮤직어워즈 포스트 제너레이션상(2023)·파퓰러 솔로 아티스트상(2024) 등을 수상했다. 소속사는 쇼플레이엔터테인먼트다.`,
    sources: [wiki('정동원', '%EC%A0%95%EB%8F%99%EC%9B%90'), { title: "정동원 홀로서기 시작", publisher: '스타뉴스', url: 'https://v.daum.net/v/20211117152111204' }],
  },
  'ahn-sung-hoon': {
    bio: `안성훈은 2012년 「오래오래」로 데뷔한 남성 트로트 가수다. 오랜 무명 기간을 거쳐 2020년 《내일은 미스터트롯》에 참가했고, 2023년 재도전한 TV조선 《미스터트롯2》에서 최종 '진(眞)'에 올라 우승했다.

미스터트롯2 결승에서 패티김의 「그대 내 친구여」를 열창해 호평을 받았으며, 우승 특전곡 「은인」을 발매했다. 대표곡으로는 「[엄마 꽃](/music/mom-flower)」이 꼽히고, 이후 첫 미니앨범 「[러브스토리](/music/ahn-sung-hoon-love-story)」 등으로 활동을 이어갔다.

실패의 아픔을 딛고 우승으로 재기에 성공한 스토리로 큰 공감을 얻었다.`,
    sources: [wiki('안성훈 (가수)', '%EC%95%88%EC%84%B1%ED%9B%88_(%EA%B0%80%EC%88%98)'), { title: "'미스터트롯2' 우승자는 안성훈", publisher: '노컷뉴스', url: 'https://m.nocutnews.co.kr/news/5911355' }],
  },
  'kim-yong-bin': {
    bio: `김용빈은 어린 시절 '트로트 신동'으로 불리며 데뷔한 뒤 공백기를 거쳐 성인 가수로 복귀했다. 2020년 KBS 《트롯 전국체전》에 출전해 최종 5위에 올랐고, 2024~2025년 방영된 TV조선 《미스터트롯3》에서 최종 우승(진)을 차지했다.

미스터트롯3 결승 무대에서 나훈아의 「감사」를 불렀고, 실시간 문자투표에서 약 44만여 표(득표율 약 27%)를 얻어 우승을 확정했다. 오랜 무명을 딛고 정상에 오른 그는 우승 특전곡 「[어제도 너였고 오늘도 너여서](/music/gold-spoon)」 등으로 활동을 이어가고 있다.`,
    sources: [wiki('김용빈 (가수)', '%EA%B9%80%EC%9A%A9%EB%B9%88_(%EA%B0%80%EC%88%98)'), { title: "김용빈, '미스터트롯3' 우승", publisher: '뉴시스', url: 'https://www.newsis.com/view/NISX20250314_0003099150' }],
  },
  'nam-seung-min': {
    bio: `남승민은 아역배우로 여러 드라마에 출연한 뒤 트로트 가수로 전향했다. 2019년 음반을 발표하며 가수 활동을 시작했고, 2020년 TV조선 《내일은 미스터트롯》에 유소년부로 참가하며 얼굴을 알렸다.

전 세대의 사랑을 받아 '국민 손자'라는 별명으로 불리며, 대표곡으로 「[트위스트 킹](/music/twist-king)」 등이 있다. 2024~2025년 《미스터트롯3》에 출연해 결승에서 최종 6위를 기록했다. 아역배우 출신답게 연기·노래·방송을 아우르는 종합 엔터테이너를 지향한다.`,
    sources: [wiki('남승민 (2002년)', '%EB%82%A8%EC%8A%B9%EB%AF%BC_(2002%EB%85%84)'), namu('남승민', '%EB%82%A8%EC%8A%B9%EB%AF%BC')],
  },
  'jin-hae-seong': {
    bio: `진해성(본명 이상성)은 부산 출신의 남성 트로트 가수로, 2012년 데뷔했다. 10대 시절부터 각종 노래 경연에 참가해 실력을 쌓았고, 2020년 KBS 《트롯 전국체전》에서 우승해 금메달을 차지했다.

2017년 발표한 「사랑 반 눈물 반」이 큰 사랑을 받았으며, 2023년 TV조선 《미스터트롯2》에서 최종 3위 '미(美)'에 올랐다. 정통 트로트 창법에 기반한 안정적인 가창력이 강점으로, 미니앨범 「[사랑에게](/music/sarangege)」·「[愛人](/music/jin-hae-seong-aein)」 등으로 활동을 이어가고 있다.`,
    sources: [wiki('진해성', '%EC%A7%84%ED%95%B4%EC%84%B1'), { title: "'미스터트롯2' 美 진해성", publisher: '스타뉴스', url: 'https://news.nate.com/view/20230317n00241' }],
  },
  'song-ga-in': {
    bio: `송가인은 전라남도 진도 출신으로, 판소리·국악을 기반으로 한 정통 트로트 창법이 특징인 가수다. 2012년 트로트 가수로 데뷔한 뒤, 2019년 TV조선 《내일은 미스트롯》에서 초대 우승 '진(眞)'을 차지하며 트로트 열풍의 상징적 인물로 떠올랐다.

미스트롯 우승 이후 정규 「[가인(佳人)](/music/ga-in-album)」과 「[가인;달](/music/song-ga-in-gain-dal)」 등을 발표했으며, 「가인이어라」·「한 많은 대동강」 등이 대표곡으로 꼽힌다. 탄탄한 국악 내공에서 나오는 구성진 소리로 트로트 대중화를 이끈 대표 스타로 평가받는다.`,
    sources: [wiki('송가인', '%EC%86%A1%EA%B0%80%EC%9D%B8'), namu('송가인', '%EC%86%A1%EA%B0%80%EC%9D%B8')],
  },
  'jang-yoon-jeong': {
    bio: `장윤정은 1999년 제20회 강변가요제에서 대상을 받으며 데뷔했다. 2004년 발표한 「[어머나](/music/eomeona-jang-yoon-jeong)」가 전 연령대의 사랑을 받으며 침체됐던 트로트를 젊은 층까지 확산시킨 대표 주자로 자리 잡았다.

「[짠짜라](/music/jjanjjara-jang-yoon-jeong)」·「[초혼](/music/jang-yoon-jeong-chohon)」·「콩깍지」 등 잇단 히트곡으로 '트로트 여왕'으로 불리며, 방송·공연을 넘나들며 폭넓게 활동해 왔다. 근래에는 작사·작곡('장공장장' 명의)에도 참여하며 후배 가수들에게 곡을 주는 등 음악적 영역을 넓히고 있다.`,
    sources: [wiki('장윤정', '%EC%9E%A5%EC%9C%A4%EC%A0%95'), { title: '장윤정 1집 - 어머나', publisher: 'maniadb', url: 'http://www.maniadb.com/album/135866' }],
  },
  'jeon-yu-jin': {
    bio: `전유진은 2020년 「사랑...하시렵니까?」로 데뷔한 트로트 가수다. 파워풀한 고음과 폭넓은 감성 표현이 강점으로, 2023~2024년 MBN 《현역가왕》 시즌1에서 초대 우승을 차지하며 크게 주목받았다.

우승 기념 미니앨범 「[Only You](/music/jeon-yu-jin-only-you)」를 발표했고, 「[연꽃](/music/yeonkkot)」·「훨훨훨」·「나비야」 등이 대표곡으로 꼽힌다. 어린 나이에도 무대를 압도하는 가창력으로 차세대 트로트 스타로 자리매김하고 있다.`,
    sources: [wiki('전유진', '%EC%A0%84%EC%9C%A0%EC%A7%84'), { title: "'현역가왕' 우승 전유진", publisher: '한국아이닷컴', url: 'https://www.hankooki.com/news/articleView.html?idxno=137048' }],
  },
  'yang-ji-eun': {
    bio: `양지은은 국악을 전공한 국악인 출신의 트로트 가수다. 2021년 TV조선 《내일은 미스트롯2》에서 우승 '진(眞)'을 차지하며 이름을 알렸다.

미스트롯2에서 「빙빙빙」·「그 강을 건너지 마오」 등의 무대로 깊은 인상을 남겼고, 우승 이후 미니앨범과 첫 정규앨범 「[소풍](/music/yang-ji-eun-sopoong)」, 「[석양](/music/yang-ji-eun-seokyang)」 등을 발표했다. 국악에서 다져진 발성과 표현력으로 정통 트로트에 깊이를 더한다는 평을 받는다.`,
    sources: [wiki('양지은', '%EC%96%91%EC%A7%80%EC%9D%80'), namu('양지은', '%EC%96%91%EC%A7%80%EC%9D%80')],
  },
  'kim-da-hyun': {
    bio: `김다현은 '청학동 국악소녀'로 알려진 국악 기반의 트로트 가수다. 어린 시절 전국 어린이 판소리 대회에서 수상하는 등 국악 신동으로 주목받았고, 2020년 MBN 《보이스트롯》 준우승에 이어 2021년 TV조선 《내일은 미스트롯2》에서 3위 '미(美)'에 올랐다.

국악과 트로트를 접목한 개성 있는 무대로 사랑받으며, 정규 3집 「[까만백조](/music/kim-da-hyun-kkaman-baekjo)」 등에서는 직접 작사·작곡에도 참여했다. 전통과 대중가요를 잇는 젊은 소리꾼으로 성장하고 있다.`,
    sources: [wiki('김다현 (가수)', '%EA%B9%80%EB%8B%A4%ED%98%84_(%EA%B0%80%EC%88%98)'), { title: "'미스트롯2' 김다현", publisher: '엑스포츠뉴스', url: 'https://www.xportsnews.com/article/1480288' }],
  },
  'hong-jin-young': {
    bio: `홍진영은 2009년 「[사랑의 배터리](/music/sarangui-battery-hong-jin-young)」로 솔로 트로트 가수로 데뷔했다. 밝고 대중적인 댄스 트로트로 폭넓은 인기를 얻으며 트로트의 대중화에 기여했다.

「[산다는 건](/music/hong-jin-young-sandaneun-geon)」·「[엄지 척](/music/eomji-cheok-hong-jin-young)」·「내 사랑」 등 히트곡을 잇달아 발표했고, 예능과 방송을 넘나들며 활동한 대표적 트로트 가수로 자리 잡았다. 경쾌한 리듬과 친근한 무대 매너가 강점이다.`,
    sources: [wiki('홍진영', '%ED%99%8D%EC%A7%84%EC%98%81'), wiki('사랑의 배터리', '%EC%82%AC%EB%9E%91%EC%9D%98_%EB%B0%B0%ED%84%B0%EB%A6%AC')],
  },
  'kim-yeon-ja': {
    bio: `김연자는 정통 트로트와 엔카 무대를 아우르며 활동해 온 원로 가수다. 1988년 「아침의 나라에서」를 일본어로 개사해 히트시킨 이후 일본 무대에서 '엔카 여왕'으로 활약했다.

대표곡 「[아모르 파티](/music/amor-fati-kim-yeon-ja)」는 트로트와 EDM을 접목한 곡으로, 발표 몇 년 뒤인 2016년 이후 국내에서 역주행하며 세대를 아우르는 국민적 인기를 얻었다. 「[수은등](/music/kim-yeon-ja-sueundeung)」 등 오랜 대표곡과 함께, 강렬한 무대 매너로 꾸준히 재조명받고 있다.`,
    sources: [wiki('김연자', '%EA%B9%80%EC%97%B0%EC%9E%90'), { title: '아모르파티 김연자', publisher: '글로벌이코노믹', url: 'https://www.g-enews.com/article/GlobalBiz/2018/02/20180202175029458298b22ff23_1' }],
  },
  'hong-ja': {
    bio: `홍자는 2012년 데뷔한 여성 트로트 가수로, 깊은 호소력과 탄탄한 가창력이 강점이다. 2019년 TV조선 《내일은 미스트롯》 시즌1에서 3위 '미(美)'에 오르며 대중적 인지도를 얻었다.

「상사화」·「사랑 참」·「[어떻게 살아](/music/eotteoke-sara)」 등이 대표곡으로 꼽히며, 이후 미니앨범 「[빠라삐리뽀](/music/hong-ja-ppara-ppiri-ppo)」 등으로 발라드부터 댄스 트로트까지 폭넓은 스펙트럼을 선보이고 있다.`,
    sources: [wiki('홍자 (가수)', '%ED%99%8D%EC%9E%90_(%EA%B0%80%EC%88%98)'), namu('홍자 (가수)', '%ED%99%8D%EC%9E%90(%EA%B0%80%EC%88%98)')],
  },
  'park-ji-hyun': {
    bio: `박지현은 시원한 보이스와 무대 매너로 주목받는 차세대 트로트 가수다. KBS1 《노래가 좋아》에서 연승을 기록하며 실력을 알렸고, 2022~2023년 TV조선 《미스터트롯2》에서 2위 '선(善)'에 올랐다.

「거문고야」·「못난 놈」 등의 무대로 화제를 모았으며, 첫 정규앨범 「[MASTER VOICE](/music/master-voice)」와 미니앨범 「[OCEAN](/music/park-ji-hyun-ocean)」 등을 발표했다. 목포 출신의 배경을 담은 음악으로 폭넓은 사랑을 받고 있다.`,
    sources: [wiki('박지현 (가수)', '%EB%B0%95%EC%A7%80%ED%98%84_(%EA%B0%80%EC%88%98)'), { title: "'미스터트롯2' 박지현", publisher: '뉴스워커', url: 'http://www.newsworker.co.kr/news/articleView.html?idxno=332349' }],
  },
  'son-tae-jin': {
    bio: `손태진은 서울대 성악과 출신으로, 성악·크로스오버를 기반으로 한 트로트 가수다. JTBC 《팬텀싱어》 시즌1에서 '포르테 디 콰트로' 멤버로 우승한 데 이어, MBN 《불타는 트롯맨》에서도 최종 우승하며 '더블 크라운'으로 화제를 모았다.

우승 특전곡 「[참 좋은 사람](/music/cham-joheun-saram)」과 정규 「[SHINE](/music/son-tae-jin-shine)」, 리메이크 앨범 「[여름 향수](/music/son-tae-jin-summer-nostalgia)」 등을 발표했다. 클래식에서 다진 풍성한 성량과 안정적인 발성으로 트로트에 품격을 더한다는 평을 받는다.`,
    sources: [wiki('손태진 (성악가)', '%EC%86%90%ED%83%9C%EC%A7%84_(%EC%84%B1%EC%95%85%EA%B0%80)'), { title: "손태진, '팬텀싱어'→'불타는 트롯맨' 우승", publisher: '엑스포츠뉴스', url: 'https://www.xportsnews.com/article/1693942' }],
  },
  'na-hoon-a': {
    bio: `나훈아(본명 최홍기)는 1960년대 중후반 가요계에 데뷔해 한국 트로트를 대표하는 원로 가수다. '가황(歌皇, 노래의 황제)'으로 불리며 '한국 가요계의 살아 있는 전설'로 평가받는다.

「사랑은 눈물의 씨앗」·「고향역」·「[무시로](/music/na-hoon-a-musiro)」·「[홍시](/music/na-hoon-a-hongsi)」 등 수많은 히트곡을 남겼으며, 다수의 곡을 직접 쓴 싱어송라이터이기도 하다. 뒤집고 꺾는 특유의 간드러진 꺾기 창법이 특징이다. 1970년대에는 남진과 함께 가요계를 양분한 최대 라이벌로, 정통 트로트를 대표하며 '남진·나훈아 시대'를 이끌었다. 2020년 트롯어워즈에서 '트롯 100년 가왕상'을 받았다.`,
    sources: [wiki('나훈아', '%EB%82%98%ED%9B%88%EC%95%84'), { title: "나훈아 '사랑은 눈물의 씨앗'", publisher: '경향신문', url: 'https://www.khan.co.kr/article/200110141650081' }],
  },
  'nam-jin': {
    bio: `남진(본명 김남진)은 1965년 데뷔한 원로 트로트 가수다. 「가슴 아프게」(1967), 「[님과 함께](/music/nam-jin-nim-gwa-hamkke)」(1972), 「둥지」(1999) 등 시대를 대표하는 히트곡을 남겼다.

「님과 함께」는 소울 리듬을 접목한 강한 비트에 춤 동작을 곁들인 무대로 큰 인기를 끌었다. 1970년대에 나훈아와 함께 가요계 양대 산맥을 이루며, 활발하고 박진감 넘치는 무대로 서정적인 나훈아와 대비됐다. 가수 활동과 병행해 영화배우로도 활동했으며, MBC 10대 가수 가수왕상을 연속 수상하고 2020년 트롯어워즈 '트롯 100년 가왕상'을 받았다.`,
    sources: [wiki('남진 (가수)', '%EB%82%A8%EC%A7%84_(%EA%B0%80%EC%88%98)'), { title: '임과 함께', publisher: '한국민족문화대백과사전', url: 'https://encykorea.aks.ac.kr/Article/E0072210' }],
  },
  'lee-mi-ja': {
    bio: `이미자는 '엘레지(비가)의 여왕'으로 불리는 원로 트로트 가수다. 1959년 공식 데뷔한 뒤 「열아홉 순정」(1959), 「[동백아가씨](/music/dongbaek-agassi-lee-mi-ja)」(1964), 「기러기 아빠」 등 수많은 곡을 남기며 전통가요(트로트)의 계보를 대표했다.

「동백아가씨」는 서양식 팝에 밀렸던 트로트를 부활시킨 곡으로 큰 사랑을 받았으나, '왜색가요' 논란으로 방송·음반 금지곡이 되었다가 1987년에야 해금된 사연으로도 잘 알려져 있다. 1960년대에 한 해 10여 장씩 음반을 낼 만큼 다작하며 한국 트로트의 한 시대를 열었다.`,
    sources: [wiki('이미자', '%EC%9D%B4%EB%AF%B8%EC%9E%90'), { title: '동백아가씨', publisher: '한국민족문화대백과사전', url: 'https://encykorea.aks.ac.kr/Article/E0072207' }],
  },
  'jin-sung': {
    bio: `진성(본명 진성철)은 1997년 데뷔한 트로트 가수다. 2008년 발표한 「[안동역에서](/music/andong-station)」가 발표 당시에는 큰 반응이 없다가 2012년경부터 폭발적인 인기를 얻으며 대표곡이 됐다.

직접 작사한 「[보릿고개](/music/borit-gogae)」(2015)와 「[태클을 걸지마](/music/jin-sung-taekeul-eul-geolji-ma)」 등도 널리 사랑받는 곡이다. 가난했던 옛 시대의 한(恨)과 정서를 절절하게 담아내는 창법이 특징으로, 근래에는 트로트 경연 프로그램의 심사위원·마스터로도 활동하며 후진 양성에 참여하고 있다.`,
    sources: [wiki('진성 (가수)', '%EC%A7%84%EC%84%B1_(%EA%B0%80%EC%88%98)'), { title: "진성 '보릿고개'", publisher: '농민신문', url: 'https://www.nongmin.com/article/20200414321571' }],
  },
  'tae-jin-ah': {
    bio: `태진아는 1972년 「내 마음 급행열차」로 데뷔한 원로 트로트 가수다. 데뷔 16년 만인 1989년 「[옥경이](/music/tae-jin-ah-okgyeongi)」가 첫 대형 히트를 기록했고, 이후 「[사랑은 아무나 하나](/music/tae-jin-ah-2000-sarangeun-amuna-hana)」(2000), 「동반자」(2004) 등 잇단 히트곡을 남겼다.

현철·송대관·설운도와 함께 '트로트 4대 천왕'으로 불리며 1990년대 트로트 부활에 기여했다. '트로트 황제'라는 별명과 엄지춤 등 흥겨운 무대 퍼포먼스로 유명하며, 2016년 은관문화훈장을 받았다.`,
    sources: [wiki('태진아', '%ED%83%9C%EC%A7%84%EC%95%84'), { title: '트로트 황제 태진아', publisher: '문화뉴스', url: 'https://www.mhns.co.kr/news/articleView.html?idxno=329092' }],
  },
  'seol-un-do': {
    bio: `설운도(본명 이영춘)는 1982년 KBS 오디션 《신인탄생》에서 5주 연속 우승하며 데뷔했다. 1983년 KBS 《이산가족을 찾습니다》 생방송에서 부른 「잃어버린 30년」이 하루 만에 대히트해 최단기간 히트곡으로 기네스북에 등재됐다.

이후 「원점」, 「[사랑의 트위스트](/music/seol-un-do-sarang-ui-twist)」(1997), 「[누이](/music/seol-un-do-nui)」(1999) 등 대표 히트곡을 남겼다. 현철·송대관·태진아와 함께 '트로트 4대 천왕'으로 불리며 트로트 부활에 결정적인 역할을 했고, 화려한 반짝이 무대의상으로 상징되는 무대 스타일로도 유명하다.`,
    sources: [wiki('설운도', '%EC%84%A4%EC%9A%B4%EB%8F%84'), { title: "설운도 '잃어버린 30년'", publisher: '더팩트', url: 'https://news.tf.co.kr/read/entertain/1865319.htm' }],
  },
  'joo-hyun-mi': {
    bio: `주현미는 1985년 정규 1집 「[비 내리는 영동교](/music/joo-hyun-mi-bi-naerineun-yeongdonggyo)」로 데뷔했다. 약국을 운영하던 약사 출신 가수로 화제를 모았으며, 데뷔곡이 히트하면서 가수의 길로 들어섰다.

1988년 「[신사동 그 사람](/music/sinsadong-geu-saram-joo-hyun-mi)」의 대히트로 KBS 가요대상·MBC 최고인기가수상·골든디스크 대상을 석권했다. 정통 트로트를 고수하며 '트로트의 여왕'으로 불렸고, 1980년대 김수희·심수봉과 함께 '여성 트로트 빅3'로 꼽힌다. 맑고 정확한 발음의 창법이 특징이다.`,
    sources: [wiki('주현미', '%EC%A3%BC%ED%98%84%EB%AF%B8'), { title: '주현미 인터뷰', publisher: 'SBS 뉴스', url: 'https://news.sbs.co.kr/news/endPage.do?news_id=N1005843059' }],
  },
  'sim-su-bong': {
    bio: `심수봉(본명 심민경)은 1978년 제2회 MBC 대학가요제에 참가해 자작곡 「[그때 그 사람](/music/sim-su-bong-geuttae-geu-saram)」으로 주목받으며 가요계에 진입했다. 대학가요제에 트로트 장르로 출전한 이색 경력으로 화제를 모았다.

히트곡 대부분을 직접 작사·작곡한 1세대 여성 싱어송라이터로, 「[남자는 배 여자는 항구](/music/namjaneun-bae-sim-su-bong)」(1984), 「사랑밖엔 난 몰라」(1987), 「[백만송이 장미](/music/sim-su-bong-million-roses)」 등을 남겼다. 트로트·발라드·재즈를 넘나드는 폭넓은 음악 세계로 한국 대중가요사에 뚜렷한 족적을 남겼다.`,
    sources: [wiki('심수봉', '%EC%8B%AC%EC%88%98%EB%B4%89'), { title: '심수봉과 한국 대중가요', publisher: 'KTV', url: 'https://www.ktv.go.kr/program/home/PG2240033D/content/753280' }],
  },
  'kim-su-hui': {
    bio: `김수희(본명 김희수)는 1976년 「너무합니다」로 솔로 데뷔한 여성 트로트 가수다. 「멍에」(1982), 「[남행열차](/music/namhaeng-yeolcha-kim-su-hui)」(1987), 「[애모](/music/kim-su-hui-aemo)」 등 트로트풍 발라드 명곡을 남겼다.

특히 「애모」는 발표 후 1993년 역주행 히트하며 KBS 가요대상 대상을 안겼다. 허스키하고 성량이 풍부한 보컬에 팝·전통 창법을 결합한 독자적 스타일로 '여자 조용필'이라 불렸으며, 1980년대 여성 트로트를 대표한 가수로 꼽힌다.`,
    sources: [wiki('김수희', '%EA%B9%80%EC%88%98%ED%9D%AC'), { title: '김수희의 대표곡', publisher: '민중의소리', url: 'https://vop.co.kr/A00001007362.html' }],
  },
  'park-seo-jin': {
    bio: `박서진(본명 박효빈)은 국악·민요와 장구 연주를 기반으로 한 트로트 가수다. 2013년부터 활동을 시작했고, 《미스터트롯2》 등 오디션·예능을 거쳐 인지도를 넓혔다.

2025년 2월 MBN 《현역가왕2》 결승에서 민요 「흥타령」 무대와 장구 연주·사자춤으로 우승을 차지했다. 신명나는 국악 기반 무대로 '장구의 신'으로 불리며, 「[나랑 가요](/music/park-seo-jin-narang-gayo)」·「[당신 이야기](/music/park-seo-jin-dangsin-iyagi)」 등 신곡을 발표했다. KBS2 《살림하는 남자들》 출연 등으로 2024 KBS 연예대상 신인상을 받았다.`,
    sources: [wiki('박서진 (1995년)', '%EB%B0%95%EC%84%9C%EC%A7%84_(1995%EB%85%84)'), { title: '박서진, 현역가왕2 우승', publisher: '한국경제', url: 'https://www.hankyung.com/article/202502269772H' }],
  },
  'hyun-cheol': {
    bio: `현철(본명 강상수)은 1969년 「무정한 그대」로 데뷔한 뒤 1983년 트로트로 본격 전향하며 「사랑은 나비인가봐」를 발표했다. 1988년 「봉선화 연정」으로 전성기를 맞아 KBS 가요대상을 받았다.

「내 마음 별과 같이」·「앉으나 서나 당신 생각」·「싫다 싫어」 등 수많은 히트곡을 남겼으며, 송대관·태진아·설운도와 함께 '트로트 4대 천왕'으로 불렸다. 구수한 음색과 서정적인 창법으로 1980~90년대 정통 트로트를 대표한 인물이다.`,
    sources: [wiki('현철 (가수)', '%ED%98%84%EC%B2%A0_(%EA%B0%80%EC%88%98)'), { title: '현철 봉선화 연정', publisher: '농민신문', url: 'https://www.nongmin.com/article/20240906500542' }],
  },
  'song-dae-kwan': {
    bio: `송대관은 1967년 「인정 많은 아저씨」로 데뷔한 뒤 오랜 무명 시절을 겪었다. 1975년 「해뜰날」(직접 작사)로 스타덤에 올랐으며, 이 곡은 '쨍하고 해 뜰 날'이라는 희망의 메시지로 대중을 위로한 국민가요가 됐다.

이후 「정 때문에」·「차표 한 장」·「네박자」·「유행가」 등 잇단 히트곡을 남겼고, 현철·태진아·설운도와 함께 '트로트 4대 천왕'으로 불렸다. 약 58년간 활동하며 서민의 정서를 담은 유행가로 오래 사랑받은 트로트 원로다.`,
    sources: [wiki('해뜰날 (노래)', '%ED%95%B4%EB%9C%B0%EB%82%A0_(%EB%85%B8%EB%9E%98)'), { title: "'트로트 4대 천왕' 송대관", publisher: '세계일보', url: 'https://www.segye.com/newsView/20250207506992' }],
  },
  'hyun-sook': {
    bio: `현숙은 1978년 작곡가 임종수의 스카우트로 데뷔해 첫 독집 「정답게 둘이서」를 발표했다. 독특한 비음 섞인 창법으로 대중의 시선을 끌었다.

「[요즘여자 요즘남자](/music/hyun-sook-yojeum-yeoja-yojeum-namja)」를 비롯해 「정말로」·「포장마차」 등 트로트에 록·댄스를 접목한 경쾌한 곡으로 사랑받았고, 1995년에는 「사랑하는 영자씨」가 크게 히트했다. 밝고 활기찬 무대 매너로 대중 친화적인 트로트 여가수의 계보를 이었으며, '효녀 가수'로도 널리 알려져 있다.`,
    sources: [wiki('현숙', '%ED%98%84%EC%88%99'), { title: "'효녀가수' 현숙", publisher: '아주경제', url: 'https://www.ajunews.com/view/20200722090954618' }],
  },
  'kim-yong-im': {
    bio: `김용임은 1984년 KBS 신인가요제에 「목련」으로 참가하며 데뷔했다. 오랜 무명기를 거쳐 「열두줄」(2002)로 인지도를 얻기 시작했고, 2003년 「사랑의 밧줄」이 대표 히트곡으로 자리 잡았다.

「내사랑 그대여」·「부초 같은 인생」 등 꾸준한 히트곡과 리메이크 앨범, 왕성한 무대 활동으로 '행사의 여왕'으로 불린다. 정통 트로트 창법의 계보를 잇는 현역 여가수로 지금도 신곡을 발표하며 활발히 활동하고 있다.`,
    sources: [wiki('김용임', '%EA%B9%80%EC%9A%A9%EC%9E%84'), { title: "김용임 '사랑의 밧줄'", publisher: '스포츠경향', url: 'https://v.daum.net/v/cPFokbjYva' }],
  },
  'moon-hee-ok': {
    bio: `문희옥은 1987년 고등학교 재학 중 「8도 디스코 사투리 메들리」로 데뷔했다. 전라도·경상도·함경도 등 지역 사투리를 담은 창작곡이 특징으로, 데뷔 앨범이 큰 판매고를 올리며 화려하게 등장했다.

이후 「사랑의 거리」(1989)·「[성은 김이요](/music/seongeun-kimiyo-moon-hee-ok)」(1991) 등 정통 트로트로 사랑받았다. 학생 신분 데뷔로 화제를 모은 1980년대 후반 트로트의 대표 주자이며, 메들리 음악과 정통 트로트 창법을 오래 이어 온 여가수다.`,
    sources: [wiki('문희옥', '%EB%AC%B8%ED%9D%AC%EC%98%A5'), { title: '문희옥 채널', publisher: '멜론', url: 'https://www.melon.com/artist/timeline.htm?artistId=1199' }],
  },
  'geum-jan-di': {
    bio: `금잔디(본명 박수연)는 2000년 데뷔한 뒤 약 10여 년의 무명 생활을 거쳤다. 2012년 「오라버니」가 크게 히트하며 인지도가 급상승했다.

「일편단심」·「사랑껌」 등 히트곡과 정규 「[Remember](/music/geum-jan-di-remember)」 등으로 활동했으며, 고속도로 휴게소·메들리 무대에서 폭발적인 인기를 얻어 '고속도로 여왕'으로 불린다. 방송 활동도 병행하는 대중 친화적 트로트 여가수다.`,
    sources: [wiki('금잔디 (가수)', '%EA%B8%88%EC%9E%94%EB%94%94_(%EA%B0%80%EC%88%98)'), { title: '고속도로 트로트 메들리 금잔디', publisher: '경향신문', url: 'https://www.khan.co.kr/article/201310011258021' }],
  },
  'jeong-mi-ae': {
    bio: `정미애는 20대부터 KBS 《전국노래자랑》에서 최우수상을 받으며 실력을 인정받았고, 2015년 디지털 싱글로 데뷔했다. 2019년 TV조선 《내일은 미스트롯》에서 준우승 '선(善)'을 차지하며 이름을 알렸다.

「[님 찾아왔어요](/music/nim-chajwa)」·「꿀맛」·「인생길」 등을 발표했으며, MBC 《복면가왕》에서도 가창력을 인정받았다. 미스트롯을 통해 부상한 실력파 트로트 여가수다.`,
    sources: [wiki('정미애', '%EC%A0%95%EB%AF%B8%EC%95%A0'), wiki('내일은 미스트롯', '%EB%82%B4%EC%9D%BC%EC%9D%80_%EB%AF%B8%EC%8A%A4%ED%8A%B8%EB%A1%AF')],
  },
  'park-hyun-bin': {
    bio: `박현빈은 성악을 전공하던 중 2006년 트로트로 전향하며 데뷔했다. 정규 1집 타이틀곡 「[곤드레 만드레](/music/park-hyun-bin-gondre-mandre)」로 첫 대형 히트를 기록했는데, 하우스 비트에 트로트를 접목한 퓨전 트로트 곡이었다.

「오빠만 믿어」(2007)·「[샤방샤방](/music/park-hyun-bin-syabang-syabang)」(2008) 등이 젊은 층에게 인기를 끌며 '남자 장윤정'으로 불렸다. 재미 중심의 퓨전 트로트로 신세대 트로트를 개척한 대표 남가수다.`,
    sources: [wiki('박현빈', '%EB%B0%95%ED%98%84%EB%B9%88'), { title: "박현빈 '샤방샤방'", publisher: '노컷뉴스', url: 'https://m.nocutnews.co.kr/news/481965' }],
  },
  'shin-yu': {
    bio: `신유(본명 신동룡)는 2008년 1집 「Luxury Trot of Shin Yu」로 데뷔했다. 데뷔 후 발표한 「시계바늘」이 크게 히트하며 인기 트로트 가수로 자리매김했다.

「잠자는 공주」·「일소일소 일노일노」·「[꽃물](/music/shin-yu-golden-ilso-ilso)」 등 다수의 곡을 발표했으며, 가수와 함께 뮤지컬 배우로도 활동한다.`,
    sources: [wiki('신유 (가수)', '%EC%8B%A0%EC%9C%A0_(%EA%B0%80%EC%88%98)'), { title: "신유 '시계바늘'", publisher: '농민신문', url: 'https://www.nongmin.com/article/20180828297386' }],
  },
  'park-gu-yoon': {
    bio: `박구윤은 2007년 '구윤'이라는 이름으로 데뷔했으나 크게 주목받지 못했고, 2010년 '박구윤'으로 본격 활동을 시작했다. 대표곡 「[뿐이고](/music/park-gu-yoon-ppunigo)」는 노래방 애창곡 상위에 오를 만큼 큰 인기를 얻었다.

「두바퀴」·「나무꾼」 등을 발표했으며, MBC에브리원 《나는 트로트 가수다》, MBN 《현역가왕2》 등에 출연한 베테랑 트로트 가수다. 서울예술대학 실용음악과를 졸업했다.`,
    sources: [wiki('박구윤', '%EB%B0%95%EA%B5%AC%EC%9C%A4'), { title: '박구윤 트로트 부문 수상', publisher: '스포츠경향', url: 'https://sports.khan.co.kr/article/202510261346003' }],
  },
  'jo-myung-seob': {
    bio: `조명섭은 2019년 KBS 《트로트가 좋아》에서 최종 우승하며 앨범으로 데뷔했다. 결선에서 「이별의 부산정거장」을 불러 우승했고, 데뷔 앨범 타이틀곡은 「[강원도 아가씨](/music/gangwondo-agassi)」다.

벨칸토 창법과 중저음 바리톤 발성 등 성악적 창법으로 옛 대중가요를 재해석하는 것이 특징이며, 복고풍 정장과 옛 어투를 고수하는 콘셉트가 상징이다. 첫 정규앨범 「[My Songs](/music/jo-myung-seob-my-songs)」 등으로 활동을 이어가고 있다.`,
    sources: [wiki('조명섭', '%EC%A1%B0%EB%AA%85%EC%84%AD'), namu('조명섭', '%EC%A1%B0%EB%AA%85%EC%84%AD')],
  },
  'kim-su-chan': {
    bio: `김수찬은 2012년 고등학생 신분으로 데뷔 앨범 「오디션」을 발표했다. 청소년 가요제와 전국노래자랑에서 대상을 받는 등 일찍이 실력을 인정받았다.

「[사랑의 해결사](/music/love-solver)」·「엉덩이」 등을 발표했고, 정규 1집 「[공존](/music/kim-su-chan-gongjon)」 등으로 활동했다. MBN 《현역가왕2》에 참가해 '프린수찬'이라는 별명으로 불렸으며, 작사·작곡을 병행하는 싱어송라이터 겸 방송인이다.`,
    sources: [wiki('김수찬 (가수)', '%EA%B9%80%EC%88%98%EC%B0%AC_(%EA%B0%80%EC%88%98)'), namu('김수찬', '%EA%B9%80%EC%88%98%EC%B0%AC')],
  },
  'hong-ji-yun': {
    bio: `홍지윤은 2018년 JTBC 《믹스나인》 참가로 활동을 시작했고, TV조선 《내일은 미스트롯2》에서 최종 2위 '선(善)'에 올랐다. 2026년 MBN 《현역가왕3》 결승에서 우승했다.

중앙대학교 한국음악학과를 졸업한 국악 기반 가수로 가야금을 다루며, 정규 1집 「[Jiyun is...](/music/hong-ji-yun-jiyun-is)」(퓨전 국악 트로트)와 「가보자GO」 등을 발표했다. '트롯바비'라는 별명으로 불린다.`,
    sources: [wiki('홍지윤 (가수)', '%ED%99%8D%EC%A7%80%EC%9C%A4_(%EA%B0%80%EC%88%98)'), namu('홍지윤', '%ED%99%8D%EC%A7%80%EC%9C%A4')],
  },
  'kang-hye-yeon': {
    bio: `강혜연은 2012년 걸그룹 EXID의 초기 멤버로 가요계에 데뷔했고, 2013년 그룹 베스티의 리더 겸 리드보컬로 활동했다. 이후 2018년 「[왔다야](/music/watdaya)」를 발표하며 트로트로 전향해 대표곡으로 히트시켰다.

TV조선 《내일은 미스트롯2》에 참가했으며, 귀여운 이미지로 '트롯다람쥐'라는 별명으로 불린다. 최신 싱글 「[몰라도 너무 몰랐네](/music/kang-hye-yeon-mollado-neomu-mollatne)」 등으로 활동을 이어가고 있다.`,
    sources: [wiki('강혜연', '%EA%B0%95%ED%98%9C%EC%97%B0'), { title: '가수 강혜연 인터뷰', publisher: '더팩트', url: 'https://news.tf.co.kr/read/entertain/2293046.htm' }],
  },
  'mai-jin': {
    bio: `마이진(본명 김화진)은 '나의 진심(My Jin)'과 고향 진주(晉州)의 '진'을 결합한 이름으로 활동한다. 2013년 싱글 「짝사랑하나봐」로 데뷔했다.

MBC 《나는 트로트 가수다》 등 경연 프로그램에 출연했고, 2024년 MBN 《현역가왕》 시즌1에서 준우승을 차지했다. 미니앨범 「[사랑의 리콜](/music/mai-jin-sarang-recall)」 등을 발표했으며, '트로트계의 보석'이라는 별명으로 불린다.`,
    sources: [wiki('마이진 (트로트 가수)', '%EB%A7%88%EC%9D%B4%EC%A7%84_(%ED%8A%B8%EB%A1%9C%ED%8A%B8_%EA%B0%80%EC%88%98)'), namu('마이진', '%EB%A7%88%EC%9D%B4%EC%A7%84')],
  },
  'eun-ga-eun': {
    bio: `은가은은 2013년 댄스곡 「Drop It」으로 정식 데뷔했다. 2014년 「Let It Go」 커버 영상이 SNS로 퍼지며 인지도를 얻었다.

TV조선 《내일은 미스트롯2》에서 최종 7위에 올랐고, MBN 《불타는 트롯걸》에도 출연했다. '엘사'라 불릴 만큼 깔끔한 고음이 주무기이며, 싱글 「[약속합니다](/music/eun-ga-eun-yaksok-hamnida)」 등으로 활동하고 있다.`,
    sources: [wiki('은가은', '%EC%9D%80%EA%B0%80%EC%9D%80'), namu('은가은', '%EC%9D%80%EA%B0%80%EC%9D%80')],
  },
  'hwang-yun-seong': {
    bio: `황윤성은 2015년 아이돌 그룹 '로미오' 멤버로 데뷔했다. 2020년 TV조선 《내일은 미스터트롯》에 출연했고, 2026년 MBN 《무명전설》에서 최종 4위에 올라 '불꽃' 무대로 화제를 모았다.

트로트 아이돌 그룹 '미스터 T' 소속으로 '트롯돌'로 불리며, 《뽕숭아학당》 등 예능·방송에서도 활동하고 있다.`,
    sources: [wiki('황윤성 (1996년)', '%ED%99%A9%EC%9C%A4%EC%84%B1_(1996%EB%85%84)'), { title: "황윤성, '무명전설' 인터뷰", publisher: '탑스타뉴스', url: 'https://www.topstarnews.net/news/articleView.html?idxno=16001454' }],
  },
  'son-bin-a': {
    bio: `손빈아는 2018년 1집 「다듬이」로 데뷔했다. 경남 하동 출신으로 '하동 남진'이라는 별칭으로 불린다.

2025년 TV조선 《미스터트롯3》에서 최종 2위 '선(善)'에 올랐으며, 결승전 마스터 심사에서 만점을 기록할 만큼 탄탄한 가창력과 고음을 인정받았다. '국민사위'라는 별칭으로도 사랑받는다.`,
    sources: [namu('손빈아', '%EC%86%90%EB%B9%88%EC%95%84'), { title: "'미스터트롯3' 손빈아", publisher: 'iMBC 연예', url: 'https://enews.imbc.com/News/RetrieveNewsInfo/452883' }],
  },
  'cheon-rok-dam': {
    bio: `천록담은 가수 이정이 선보인 트로트 활동명이다. 이정은 2002년 그룹 '세븐데이즈'로 데뷔해 「다신」 등을 히트시킨 발라드 가수로, 트로트로 변신해 천록담이라는 이름으로 활동했다.

2025년 TV조선 《미스터트롯3》에서 최종 3위 '미(美)'에 올랐으며, 깊은 감성의 무대로 '젊은 나훈아'라는 극찬을 받았다.`,
    sources: [namu('천록담', '%EC%B2%9C%EB%A1%9D%EB%8B%B4'), { title: "'미스터트롯3' 천록담 TOP3", publisher: '국악타임즈', url: 'https://www.gugaktimes.com/news/article.html?no=75908' }],
  },
  'chun-gil': {
    bio: `춘길은 2005년 '모세'라는 예명으로 데뷔해 「사랑인걸」 등으로 사랑받은 가수다. 2022년부터 트로트 활동명 '춘길'로 활동하며 발라드에서 트로트로 음악적 스펙트럼을 넓혔다.

20년 차 현재진행형 가수로, 장르 변신을 이어가며 꾸준히 무대에 오르고 있다.`,
    sources: [{ title: '모세에서 춘길로', publisher: '헤럴드경제', url: 'https://biz.heraldcorp.com/article/10551421' }, { title: '20년 차 현재진행형 가수 춘길', publisher: '포브스코리아', url: 'https://www.forbeskorea.co.kr/news/articleView.html?idxno=400724' }],
  },
  'byeol-sarang': {
    bio: `별사랑은 2012년 록 음악 가수로 데뷔해 언더그라운드 무대에서 활동했다. 2020년 TV조선 《미스터트롯2》에 출연해 최종 6위에 올랐다.

록에서 트로트로 전향한 개성 있는 여성 트로트 가수로, 세미 트로트 싱글 「[가위바위보](/music/byeol-sarang-gawi-bawi-bo)」 등을 발표하며 활동을 이어가고 있다.`,
    sources: [wiki('별사랑', '%EB%B3%84%EC%82%AC%EB%9E%91'), { title: '가수 별사랑 프로필', publisher: '국제뉴스', url: 'https://www.gukjenews.com/news/articleView.html?idxno=2392068' }],
  },
  'maria-trot': {
    bio: `마리아는 미국 코네티컷주 출신의 글로벌 트로트 가수다. 청소년기에 K-POP에 빠져 독학으로 한글을 익혔고, Mnet 《너의 목소리가 보여 시즌6》으로 얼굴을 알렸다.

2021년 TV조선 《미스트롯2》에 출전해 외국인 참가자 최초로 준결승에 진출하며 화제를 모았다. 한국에서 활동하는 외국인 트로트 가수로 자리매김했다.`,
    sources: [wiki('마리아 (미국의 가수)', '%EB%A7%88%EB%A6%AC%EC%95%84_(%EB%AF%B8%EA%B5%AD%EC%9D%98_%EA%B0%80%EC%88%98)'), { title: '마리아의 트로트 여정', publisher: '잡포스트', url: 'https://www.job-post.co.kr/news/articleView.html?idxno=144181' }],
  },
  'yoyomi': {
    bio: `요요미는 2018년 2월 싱글 「첫번째 이야기(First Story)」로 정식 데뷔했다. 유튜브에 가수 혜은이의 노래 커버를 올려 화제가 되며 '리틀 혜은이'라는 별칭을 얻었다.

트로트를 중심으로 발라드·R&B·댄스·팝 등 다양한 장르를 소화하는 싱어송라이터로, 「[난다요요미](/music/yoyomi-nanda-yoyomi)」·「[어흥](/music/yoyomi-eoheung)」 등 꾸준히 신곡을 발표하고 있다.`,
    sources: [wiki('요요미', '%EC%9A%94%EC%9A%94%EB%AF%B8'), namu('요요미', '%EC%9A%94%EC%9A%94%EB%AF%B8')],
  },
};

async function main() {
  let n = 0;
  for (const [slug, v] of Object.entries(BIOS)) {
    if (await setBio(slug, v.bio, v.sources)) n++;
  }
  const withBio = await prisma.artist.count({ where: { status: 'published', bio: { not: null } } });
  console.log(`✔ 배치24 완료. bio 추가/갱신 ${n} · bio 보유 가수 ${withBio}`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

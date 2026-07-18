import Link from 'next/link';
import { prisma } from '@/lib/db';
import { SearchBox } from '@/components/SearchBox';
import { ArticleCard, EventCard, ArtistCard, ArtistAvatarLink } from '@/components/cards';
import { REGIONS } from '@/lib/enums';
import { HOME_HERO_IMAGE } from '@/lib/seo';
import { formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic'; // 홈은 '오늘' 기준 최신성 우선

function Section({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-ink-900">{title}</h2>
        {href && <Link href={href} className="text-sm text-brand-600 hover:underline">전체 보기</Link>}
      </div>
      {children}
    </section>
  );
}

export default async function HomePage() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 86400000);

  const [todayEvents, todayNews, upcomingEvents, broadcasts, recentArtists, newMusic] = await Promise.all([
    prisma.event.findMany({
      where: { status: 'published', startDateTime: { gte: startOfDay, lt: endOfDay } },
      include: { artists: { select: { stageName: true } } },
      orderBy: { startDateTime: 'asc' },
      take: 4,
    }),
    prisma.article.findMany({
      where: { status: 'published', publishedAt: { gte: startOfDay, lt: endOfDay } },
      orderBy: { publishedAt: 'desc' },
      take: 4,
    }),
    prisma.event.findMany({
      where: { status: 'published', startDateTime: { gte: now }, eventStatus: { notIn: ['cancelled', 'completed'] } },
      include: { artists: { select: { stageName: true } } },
      orderBy: { startDateTime: 'asc' },
      take: 4,
    }),
    prisma.event.findMany({
      where: { status: 'published', eventType: 'broadcast_recording', startDateTime: { gte: now } },
      include: { artists: { select: { stageName: true } } },
      orderBy: { startDateTime: 'asc' },
      take: 3,
    }),
    prisma.artist.findMany({
      where: { status: 'published' },
      orderBy: { lastFactCheckedAt: 'desc' },
      take: 3,
    }),
    prisma.music.findMany({
      where: { status: 'published' },
      orderBy: { releaseDate: 'desc' },
      take: 3,
    }),
  ]);

  const [artistStrip, guides] = await Promise.all([
    prisma.artist.findMany({
      where: { status: 'published' },
      orderBy: { stageName: 'asc' },
      take: 16,
      select: { slug: true, stageName: true },
    }),
    prisma.article.findMany({
      where: { status: 'published', type: 'guide' },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      select: { slug: true, title: true, description: true, type: true, heroImage: true, heroImageAlt: true, publishedAt: true, isSample: true },
    }),
  ]);

  // 최신 발행 소식 (오늘 것이 없을 때 대체)
  const latestNews =
    todayNews.length > 0
      ? todayNews
      : await prisma.article.findMany({
          where: { status: 'published' },
          orderBy: { publishedAt: 'desc' },
          take: 4,
        });

  return (
    <div>
      {/* 1. 히어로 + 검색 */}
      <section className="relative overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HOME_HERO_IMAGE}
          alt="트로트 공연 무대 (이해를 돕기 위해 제작된 이미지)"
          width={1200}
          height={630}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
        <div className="relative px-6 py-12 md:px-10 md:py-16">
          <h1 className="text-2xl font-extrabold leading-tight text-white drop-shadow-sm md:text-4xl">
            트로트 가수·공연·방송·신곡을<br className="hidden sm:block" /> 한곳에서
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/85 md:text-base">
            공식 출처를 교차 확인해 정리한 트로트 전문 정보. 오늘 일정과 최신 소식을 확인하세요.
          </p>
          <div className="mt-6 max-w-content">
            <SearchBox size="lg" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Link href="/events" className="rounded-full bg-white/15 px-3 py-1.5 font-medium text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/25">오늘의 트로트 일정</Link>
            <Link href="/artists" className="rounded-full bg-white/15 px-3 py-1.5 font-medium text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/25">가수 이름으로 찾기</Link>
            <Link href="/events" className="rounded-full bg-white/15 px-3 py-1.5 font-medium text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/25">지역별 공연 찾기</Link>
          </div>
        </div>
      </section>

      {/* 가수 둘러보기 (아바타 스트립) */}
      {artistStrip.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-ink-900">가수 둘러보기</h2>
            <Link href="/artists" className="text-sm text-brand-600 hover:underline">전체 보기</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {artistStrip.map((a) => <ArtistAvatarLink key={a.slug} artist={a} />)}
          </div>
        </section>
      )}

      {/* 2. 오늘의 주요 일정 */}
      <Section title={`오늘의 주요 일정 · ${formatDate(now)}`} href="/events">
        {todayEvents.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {todayEvents.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            오늘로 등록된 공개 일정이 없습니다. 다가오는 공연을 확인하세요.
          </p>
        )}
      </Section>

      {/* 3. 오늘 업데이트된 소식 */}
      <Section title={todayNews.length ? '오늘 업데이트된 트로트 소식' : '최신 트로트 소식'} href="/news">
        <div className="grid gap-3 md:grid-cols-2">
          {latestNews.map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
      </Section>

      {/* 4. 다가오는 공연 */}
      <Section title="다가오는 공연" href="/events">
        <div className="grid gap-3 md:grid-cols-2">
          {upcomingEvents.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      </Section>

      {/* 5. 방송 출연 일정 */}
      {broadcasts.length > 0 && (
        <Section title="방송 출연 일정" href="/broadcasts">
          <div className="grid gap-3 md:grid-cols-2">
            {broadcasts.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        </Section>
      )}

      {/* 6. 새로 업데이트된 가수 프로필 */}
      <Section title="새로 업데이트된 가수 프로필" href="/artists">
        <div className="grid gap-3 md:grid-cols-3">
          {recentArtists.map((a) => <ArtistCard key={a.id} artist={a} />)}
        </div>
      </Section>

      {/* 7. 신곡·앨범 */}
      {newMusic.length > 0 && (
        <Section title="신곡·앨범" href="/music">
          <div className="grid gap-3 md:grid-cols-3">
            {newMusic.map((m) => (
              <Link key={m.id} href={`/music/${m.slug}`} className="rounded-xl border border-slate-200 p-4 hover:border-brand-300">
                <p className="font-bold text-ink-900">{m.title}</p>
                {m.releaseDate && <p className="mt-1 text-xs text-slate-500">{formatDate(m.releaseDate)} 발매</p>}
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* 트로트 가이드·읽을거리 (실제 분석 데이터 없는 '인기'는 표시하지 않음 — §15) */}
      {guides.length > 0 && (
        <Section title="트로트 가이드·읽을거리" href="/news">
          <div className="grid gap-3 md:grid-cols-3">
            {guides.map((g) => <ArticleCard key={g.slug} article={g} />)}
          </div>
        </Section>
      )}

      {/* 8. 지역별 공연 찾기 */}
      <Section title="지역별 공연 찾기">
        <div className="flex flex-wrap gap-2">
          {REGIONS.filter((r) => r.slug !== 'other').map((r) => (
            <Link key={r.slug} href={`/events/region/${r.slug}`} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-ink-700 hover:bg-brand-50 hover:text-brand-700">
              {r.label}
            </Link>
          ))}
        </div>
      </Section>

      {/* 9. 이번 주 트로트 일정 */}
      <Section title="이번 주 트로트 일정">
        <Link href="/weekly" className="inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          이번 주 일정 정리 보기
        </Link>
      </Section>

      {/* 10. 인기 콘텐츠 — 실제 분석 데이터가 쌓인 경우에만 표시 (§15). 현재 미표시. */}

      {/* 11. 사이트 정보 원칙 */}
      <Section title="이 사이트의 정보 원칙">
        <ul className="grid gap-2 text-sm text-ink-700 md:grid-cols-2">
          <li className="rounded-lg bg-slate-50 p-3">공식 홈페이지·소속사·방송사·주최사·티켓처 등 신뢰 가능한 원자료를 우선 사용합니다.</li>
          <li className="rounded-lg bg-slate-50 p-3">중요한 사실은 2개 이상 출처로 교차 확인하고, 확인되지 않은 정보는 표시하지 않습니다.</li>
          <li className="rounded-lg bg-slate-50 p-3">각 콘텐츠 하단에 출처와 마지막 확인일을 표기합니다.</li>
          <li className="rounded-lg bg-slate-50 p-3">티켓을 직접 판매하지 않으며, 가격·잔여 좌석은 실시간이 아닐 수 있습니다.</li>
        </ul>
      </Section>

      {/* 12. 정정 요청·문의 */}
      <Section title="정정 요청·문의">
        <p className="text-sm text-ink-700">
          잘못된 정보를 발견하셨나요?{' '}
          <Link href="/corrections" className="font-semibold text-brand-600 hover:underline">정보 정정 요청</Link>
          {' '}페이지에서 알려주세요.
        </p>
      </Section>
    </div>
  );
}
